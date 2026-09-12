import { apiClient } from "./client";
import type { MonthlyReport } from "../types/reports";

export async function getMonthlyReport(month?: number, year?: number): Promise<MonthlyReport> {
  const params: Record<string, number> = {};
  if (month !== undefined) params.month = month;
  if (year !== undefined) params.year = year;

  const response = await apiClient.get<MonthlyReport>("/v1/reports/monthly", { params });
  return response.data;
}

/**
 * Downloads a file response by creating a temporary object URL and
 * simulating a click on a hidden <a download>, which is what triggers
 * the browser's native save dialog for a blob response (axios can't
 * trigger a download on its own).
 */
async function downloadBlob(
  url: string,
  params: Record<string, unknown>,
  fallbackFilename: string
): Promise<void> {
  const response = await apiClient.get(url, { params, responseType: "blob" });

  const disposition: string | undefined = response.headers["content-disposition"];
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? fallbackFilename;

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export async function downloadTransactionsCsv(params: {
  startDate?: string;
  endDate?: string;
}): Promise<void> {
  await downloadBlob("/v1/reports/export/csv", params, "transactions.csv");
}

export async function downloadMonthlyReportPdf(month?: number, year?: number): Promise<void> {
  const params: Record<string, number> = {};
  if (month !== undefined) params.month = month;
  if (year !== undefined) params.year = year;
  await downloadBlob("/v1/reports/export/pdf", params, "fintrack-report.pdf");
}
