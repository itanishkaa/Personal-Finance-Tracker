export type Granularity = "weekly" | "monthly" | "yearly";

// Matches backend OverviewOut
export interface Overview {
  income: number;
  expenses: number;
  balance: number;
  savings_rate: number;
}

// Matches backend CashflowPoint
export interface CashflowPoint {
  period: string; // "2026-08" | "2026-W33" | "2026"
  income: number;
  expense: number;
}

// Matches backend CategoryBreakdownItem
export interface CategoryBreakdownItem {
  category_id: number | null;
  name: string;
  icon: string | null;
  amount: number;
  percentage: number;
}

// Matches backend PaymentMethodTotal
export interface PaymentMethodTotal {
  payment_method: string;
  amount: number;
}

// Matches backend MonthOverMonthOut
export interface MonthOverMonth {
  current_month: string;
  previous_month: string;
  current_total: number;
  previous_total: number;
  change_percent: number | null;
  top_contributors: CategoryBreakdownItem[];
}

// Matches backend SpendingAnalyticsOut
export interface SpendingAnalytics {
  total_spending: number;
  average_daily_spending: number;
  highest_category: CategoryBreakdownItem | null;
  lowest_category: CategoryBreakdownItem | null;
  by_payment_method: PaymentMethodTotal[];
  month_over_month: MonthOverMonth;
}

// Matches backend MonthlyTrendPoint
export interface MonthlyTrendPoint {
  month: string; // "2026-08"
  income: number;
  expenses: number;
  savings: number;
}
