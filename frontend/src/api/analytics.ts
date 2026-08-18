import { apiClient } from "./client";
import type {
  CashflowPoint,
  CategoryBreakdownItem,
  Granularity,
  MonthlyTrendPoint,
  Overview,
  SpendingAnalytics,
} from "../types/analytics";
import type { TransactionType } from "../types/transaction";

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export async function getOverview(range: DateRange = {}): Promise<Overview> {
  const response = await apiClient.get<Overview>("/v1/analytics/overview", {
    params: range,
  });
  return response.data;
}

export async function getCashflow(
  granularity: Granularity,
  range: DateRange = {},
): Promise<CashflowPoint[]> {
  const response = await apiClient.get<CashflowPoint[]>(
    "/v1/analytics/cashflow",
    {
      params: { granularity, ...range },
    },
  );
  return response.data;
}

export async function getCategoryBreakdown(
  type: TransactionType,
  range: DateRange = {},
): Promise<CategoryBreakdownItem[]> {
  const response = await apiClient.get<CategoryBreakdownItem[]>(
    "/v1/analytics/categories",
    {
      params: { type, ...range },
    },
  );
  return response.data;
}

export async function getSpendingAnalytics(
  range: DateRange = {},
): Promise<SpendingAnalytics> {
  const response = await apiClient.get<SpendingAnalytics>(
    "/v1/analytics/spending",
    {
      params: range,
    },
  );
  return response.data;
}

export async function getMonthlyTrends(
  months = 6,
): Promise<MonthlyTrendPoint[]> {
  const response = await apiClient.get<MonthlyTrendPoint[]>(
    "/v1/analytics/trends",
    {
      params: { months },
    },
  );
  return response.data;
}
