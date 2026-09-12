import { apiClient } from "./client";
import type { FinancialHealth } from "../types/health";

export async function getFinancialHealth(): Promise<FinancialHealth> {
  const response = await apiClient.get<FinancialHealth>("/v1/analytics/health");
  return response.data;
}
