import { Match } from "../api-types";

export function getLocale(date: string, format: string): string {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "Invalid Date";

  const options: Intl.DateTimeFormatOptions =
    format === "L"
      ? { year: "numeric", month: "2-digit", day: "2-digit" }
      : { hour: "2-digit", minute: "2-digit" };

  return parsedDate.toLocaleString(navigator.language || "en", options);
}

export enum DATE_OPTIONS {
  AllTime = "All time",
  Last3Months = "Last 3 months",
  CustomDate = "Custom date",
}

export interface DownloadObjectInterface {
  sport: string;
  day: string;
  start: string;
  end: string;
  players: string;
}

export interface FormDataInterface {
  sports: {
    tennis: boolean;
    padel: boolean;
  };
  date: DATE_OPTIONS;
  user: string;
  startDate: string;
  endDate: string;
}

export function downloadObjectToCsv(
  data: DownloadObjectInterface[],
  delimiter = ","
): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Data malformed or empty");
  }

  function getTypedKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  const headers = getTypedKeys(data[0]);

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(delimiter)
  );

  return [
    headers.map((header) => capitalizeFirstLetter(header)).join(delimiter),
    ...csvRows,
  ].join("\n");
}

function capitalizeFirstLetter(val: string): string {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function downloadCsv(csvData: string, filename: string) {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function filterMatches(
  matches: Match[],
  formData: FormDataInterface
): Match[] {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  return matches.filter((match) => {
    const matchDate = new Date(match.startDate);

    const isTennis =
      formData.sports.tennis && match.sport.toLowerCase() === "tennis";
    const isPadel =
      formData.sports.padel && match.sport.toLowerCase() === "padel";
    const isDate =
      formData.date === DATE_OPTIONS.AllTime ||
      (formData.date === DATE_OPTIONS.Last3Months &&
        matchDate >= threeMonthsAgo) ||
      (formData.date === DATE_OPTIONS.CustomDate &&
        new Date(formData.startDate) <= matchDate &&
        matchDate <= new Date(formData.endDate));
    const isUser =
      formData.user === "0" ||
      match.teams.some((team) =>
        team.players.some((player) => player.userId === formData.user)
      );

    return (isTennis || isPadel) && isDate && isUser;
  });
}

export function formatObjectToDownload(
  filteredMatches: Match[]
): DownloadObjectInterface[] {
  return filteredMatches.map((match) => {
    const day = getLocale(match.startDate, "L");
    const start = getLocale(match.startDate, "LT");
    const end = getLocale(match.endDate, "LT");

    const players = match.teams
      .map((team, index) => {
        const teamPlayers = team.players.map((player) => player.displayName);
        return `Team ${index + 1}: ${teamPlayers.join(" and ")}`;
      })
      .join(", ");

    return {
      sport: match.sport,
      day,
      start,
      end,
      players,
    };
  });
}
