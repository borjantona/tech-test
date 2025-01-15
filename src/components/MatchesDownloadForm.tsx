import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { FormEvent,  useState } from "react";
import "./MatchesDownloadForm.css";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { downloadCsv, downloadObjectToCsv, filterMatches, formatObjectToDownload, downloadObjectInterface, FormDataInterface } from "@/lib/utils/utils";
import { useMatchesUsers } from "@/lib/hooks/useMatchesUsers";
import { DATE_OPTIONS } from "@/lib/utils/utils";

export type Sport = "tennis" | "padel";

const today = dayjs();
const yesterday = dayjs().subtract(1, "day");
dayjs.extend(isBetween);


export default function MatchesDownloadForm() {
  /* Hooks */
  const [formData, setFormData] = useState<FormDataInterface>({
    sports: {
      tennis: true,
      padel: true,
    },
    date: DATE_OPTIONS.AllTime,
    user: "0",
    startDate: null,
    endDate: null,
  });
  
  const [error, setError] = useState("");
  const { matches, users } = useMatchesUsers();
  

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
  const onDownloadMatches = (event: FormEvent) => {
    event.preventDefault();

    /*Filter the data*/
    const filteredMatches = filterMatches(matches, formData);

    /*Format the data to download*/
    const objectToDownload: downloadObjectInterface[] = formatObjectToDownload(filteredMatches);

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
          sx={{ margin: "1rem 0" }}
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
          sx={{ margin: "2rem 0" }}
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
