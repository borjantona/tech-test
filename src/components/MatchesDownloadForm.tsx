import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { FormEvent, useState } from "react";
import {
  downloadCsv,
  downloadObjectToCsv,
  filterMatches,
  formatObjectToDownload,
  downloadObjectInterface,
  FormDataInterface,
} from "@/lib/utils/utils";
import { useMatchesUsers } from "@/lib/hooks/useMatchesUsers";
import { DATE_OPTIONS } from "@/lib/utils/utils";

export type Sport = "tennis" | "padel";

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

export default function MatchesDownloadForm() {
  const [formData, setFormData] = useState<FormDataInterface>({
    sports: {
      tennis: true,
      padel: true,
    },
    date: DATE_OPTIONS.AllTime,
    user: "0",
    startDate: "",
    endDate: "",
  });

  const [error, setError] = useState("");
  const { matches, users } = useMatchesUsers();

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

  const handleDateChange = (key: "startDate" | "endDate", value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const onDownloadMatches = (event: FormEvent) => {
    event.preventDefault();

	const filteredMatches = filterMatches(matches, formData);

    const objectToDownload: downloadObjectInterface[] =
      formatObjectToDownload(filteredMatches);

    try {
      downloadCsv(downloadObjectToCsv(objectToDownload), "matches.csv");
      setError("");
    } catch (error) {
      setError(
        "Error downloading the file. Filters need to be adjusted to include users in this period."
      );
      console.error(error);
    }
  };

  return (
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
        sx={{ margin: "1rem 0", width: "100%" }}
        defaultValue={DATE_OPTIONS.AllTime}
        onChange={handleSelectChange}
      >
        {Object.entries(DATE_OPTIONS).map(([, value]) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </TextField>

      {formData.date === DATE_OPTIONS.CustomDate && (
        <Stack direction="row" spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            inputProps={{ max: today }}
            onChange={(e) => {handleDateChange("startDate", e.target.value)}}
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            inputProps={{ max: today }}
            onChange={(e) => {handleDateChange("endDate", e.target.value)}}
          />
        </Stack>
      )}

      <TextField
        id="outlined-select-currency"
        select
        label="Users"
        name="user"
        sx={{ margin: "2rem 0", width: "100%" }}
        value={formData.user}
        onChange={handleSelectChange}
        defaultValue={"0"}
      >
        <MenuItem value="0">All users</MenuItem>
        {users.map((user) => (
          <MenuItem key={user.userId} value={user.userId}>
            {user.displayName}
          </MenuItem>
        ))}
      </TextField>

      <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        className="button"
      >
        Download
      </Button>
    </form>
  );
}
 