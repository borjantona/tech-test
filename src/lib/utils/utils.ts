import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/es";
import { Match } from "../api-types";

dayjs.extend(localizedFormat);

// Configurar el locale del navegador
const browserLocale = navigator.language || "en"; // Detecta el idioma del navegador
dayjs.locale(browserLocale);

export function getLocale(date: string, format: string): string {
  return dayjs(date).format(format);
}

export enum DATE_OPTIONS {
  AllTime = "All time",
  Last3Months = "Last 3 months",
  CustomDate = "Custom date",
}

export interface downloadObjectInterface {
  Sport: string;
  Day: string;
  "Start hour": string;
  "End hour": string;
  Players: string;
}

export interface FormDataInterface {
  sports: {
    tennis: boolean;
    padel: boolean;
  };
  date: DATE_OPTIONS;
  user: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

/**
 * Returns a CSV string from an array of objects
 *
 * @throws {Error} if data malformed or empty
 */
export function downloadObjectToCsv(
  data: downloadObjectInterface[],
  delimiter = ","
): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Data malformed or empty");
  }

  function getTypedKeys<T extends object>(obj: T): (keyof T)[] {
    const keys: (keyof T)[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        keys.push(key);
      }
    }
    return keys;
  }

  const headers = getTypedKeys(data[0]);

  // Create CSV rows
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];

        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(delimiter)
  );

  // Join headers and rows
  return [headers.join(delimiter), ...csvRows].join("\n");
}

export function downloadCsv(csvData: string, filename: string) {
  // Create a blob with the CSV data
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

  // Create a temporary URL to download the CSV
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);

  // Add the link to the document and click it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the URL
  URL.revokeObjectURL(url);
}

export function filterMatches(
  matches: Match[],
  formData: FormDataInterface
): Match[] {
  const today = dayjs();

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

  return filteredMatches;
}

export function formatObjectToDownload(
  filteredMatches: Match[]
): downloadObjectInterface[] {
  return filteredMatches.map((match) => {
    const day = getLocale(match.startDate, "L");
    const startTime = getLocale(match.startDate, "LT");
    const endTime = getLocale(match.endDate, "LT");

    const players = match.teams
      .map((team, index) => {
        const teamPlayers = team.players.map((player) => player.displayName);
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
  });
}
