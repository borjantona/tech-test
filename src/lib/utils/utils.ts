import { downloadObjectInterface } from "../../views/Matches/MatchesDownloadForm";

export function downloadObjectToCsv(
  data: downloadObjectInterface[],
  delimiter = ","
): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("El JSON debe ser un arreglo no vacío.");
  }

  // Obtain headers from the first object
  const headers = Object.keys(data[0]) as (keyof downloadObjectInterface)[];

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
