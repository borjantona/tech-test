import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Match, User } from "@/lib/api-types";
import "./MatchesDownloadForm.css";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { downloadCsv, downloadObjectToCsv, getLocale } from "@/lib/utils/utils";
import { useApiFetcher } from "@/lib/api";

enum DATE_OPTIONS {
  AllTime = "All time",
  Last3Months = "Last 3 months",
  CustomDate = "Custom date",
}
export type Sport = "tennis" | "padel";

const today = dayjs();
const yesterday = dayjs().subtract(1, "day");
dayjs.extend(isBetween);
export interface downloadObjectInterface {
  Sport: string;
  Day: string;
  "Start hour": string;
  "End hour": string;
  Players: string;
}

export default function MatchesDownloadForm() {
  /* Hooks */
  const [formData, setFormData] = useState({
    sports: {
      tennis: true,
      padel: true,
    },
    date: DATE_OPTIONS.AllTime,
    user: "0",
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
  });
  const fetcher = useApiFetcher();
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getAllData()
      .then((data) => {
        setMatches(data.matches);
        setUsers(data.users);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  /* Handlers for changing the state of the filters */
  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSportsChange = (sport: Sport) => {
    setFormData((prevData) => ({
      ...prevData,
      sports: {
        ...prevData.sports,
        [sport]: !prevData.sports[sport],
      },
    }));
  };
  const handleDateChange = (
    key: "startDate" | "endDate",
    newValue: Dayjs | null
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: newValue,
    }));
  };

  /* Util functions */
  const getAllData = async (): Promise<{ matches: Match[]; users: User[] }> => {
    const matches = [] as Match[];
    let users = [] as User[];
    let page = 0;
    const size = 10;
    let results = -1;

    while (results === -1 || results === size) {
      const res = await fetcher("GET /v1/matches", { page, size });
      if (!res.ok) {
        throw new Error(res.data.message);
      } else {
        matches.push(...res.data);
        results = res.data.length;
      }
      page++;
    }

    users = matches
      .flatMap((match) => match.teams.flatMap((team) => team.players))
      .filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.userId === user.userId)
      );

    return { matches, users };
  };
  const onDownloadMatches = (event: FormEvent) => {
    event.preventDefault();

    /*Filter the data*/
    const filteredMatches = matches.filter((match) => {
      const isTennis =
        formData.sports.tennis && match.sport.toLowerCase() === "tennis";
      const isPadel =
        formData.sports.padel && match.sport.toLowerCase() === "padel";
      const isDate =
        formData.date === DATE_OPTIONS.AllTime ||
        (formData.date === DATE_OPTIONS.Last3Months &&
          today.diff(match.startDate, "month") <= 3) ||
        (formData.date === DATE_OPTIONS.CustomDate &&
          formData.startDate &&
          formData.endDate &&
          dayjs(match.startDate).isBetween(
            formData.startDate,
            formData.endDate,
            "day",
            "[]"
          ));
      const isUser =
        formData.user === "0" ||
        match.teams.some((team) =>
          team.players.some((player) => player.userId === formData.user)
        );
      return (isTennis || isPadel) && isDate && isUser;
    });

    /*Format the data to download*/
    const objectToDownload: downloadObjectInterface[] = filteredMatches.map(
      (match) => {
        const day = getLocale(match.startDate, "L");
        const startTime = getLocale(match.startDate, "LT");
        const endTime = getLocale(match.endDate, "LT");

        const players = match.teams
          .map((team, index) => {
            const teamPlayers = team.players.map(
              (player) => player.displayName
            );
            return `Team ${index + 1}: ${teamPlayers.join(" and ")}`;
          })
          .join(", ");
        return {
          Sport: match.sport,
          Day: day,
          "Start hour": startTime,
          "End hour": endTime,
          Players: players,
        };
      }
    );
    try {
      downloadCsv(downloadObjectToCsv(objectToDownload), "matches.csv");
      setError("");
    } catch (error) {
      setError(
        "Error downloading the file. Filters need to be adjusted to include users."
      );
      console.error(error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form className="form" onSubmit={onDownloadMatches}>
        <Stack direction="row" spacing={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sports.tennis}
                onChange={() => {
                  handleSportsChange("tennis");
                }}
              />
            }
            label="Tennis"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sports.padel}
                onChange={() => {
                  handleSportsChange("padel");
                }}
              />
            }
            label="Padel"
          />
        </Stack>

        <TextField
          id="outlined-select-currency"
          select
          label="Date"
          name="date"
          value={formData.date}
          className="select"
          defaultValue={DATE_OPTIONS.AllTime}
          onChange={handleSelectChange}
        >
          {Object.entries(DATE_OPTIONS).map(([, value]) => {
            return (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            );
          })}
        </TextField>
        {formData.date === DATE_OPTIONS.CustomDate && (
          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Start Date"
              value={formData.startDate}
              maxDate={today}
              defaultValue={yesterday}
              onChange={(newDate) => {
                handleDateChange("startDate", newDate);
              }}
            />
            <DatePicker
              label="End Date"
              value={formData.endDate}
              maxDate={today}
              defaultValue={today}
              onChange={(newDate) => {
                handleDateChange("endDate", newDate);
              }}
            />
          </Stack>
        )}

        <TextField
          id="outlined-select-currency"
          select
          label="Users"
          name="user"
          className="select"
          value={formData.user}
          onChange={handleSelectChange}
          defaultValue={"0"}
        >
          <MenuItem value="0">All users</MenuItem>
          {users.map((user) => {
            return (
              <MenuItem key={user.userId} value={user.userId}>
                {user.displayName}
              </MenuItem>
            );
          })}
        </TextField>

        <div className="error">{error}</div>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="button"
        >
          Download
        </Button>
      </form>
    </LocalizationProvider>
  );
}
