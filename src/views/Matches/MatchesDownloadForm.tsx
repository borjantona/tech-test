import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { FormEvent, useState } from "react";
import { User } from "@/lib/api-types";
import "./MatchesDownloadForm.css";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

export interface downloadObjectInterface {
  Sport: string;
  Day: string;
  "Start hour": string;
  "End hour": string;
  Players: string;
}

const DATE_OPTIONS = ["All time", "Last 3 months", "Custom date"];
const MOCK_USERS: User[] = [
  {
    displayName: "User 1",
    email: "user1@playtomic.io",
    pictureURL: "",
    userId: "1",
  },
  {
    displayName: "User 2",
    email: "user2@playtomic.io",
    pictureURL: "",
    userId: "2",
  },
  {
    displayName: "User 3",
    email: "user1@playtomic.io",
    pictureURL: "",
    userId: "3",
  },
];
export type Sport = "tennis" | "padel";
const today = dayjs();
const yesterday = dayjs().subtract(1, "day");

export default function MatchesDownloadForm() {
  const [formData, setFormData] = useState({
    sports: {
      tennis: true,
      padel: true,
    },
    date: DATE_OPTIONS[0],
    user: "0",
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log("Form submitted with values:", formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form className="form" onSubmit={handleSubmit}>
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
          defaultValue={DATE_OPTIONS[0]}
          onChange={handleChange}
        >
          {DATE_OPTIONS.map((option) => {
            return (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            );
          })}
        </TextField>
        {formData.date === "Custom date" && (
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
          onChange={handleChange}
          defaultValue={"0"}
        >
          <MenuItem value="0">All users</MenuItem>
          {MOCK_USERS.map((user) => {
            return (
              <MenuItem key={user.userId} value={user.userId}>
                {user.displayName}
              </MenuItem>
            );
          })}
        </TextField>
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
