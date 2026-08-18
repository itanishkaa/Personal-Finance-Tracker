export type BudgetStatus = "healthy" | "warning" | "near_limit" | "over_budget";

// Matches the backend's BudgetOut schema exactly - usage figures are
// computed server-side at read time, never stored.
export interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string | null;
  amount: number;
  month: number; // 1-12
  year: number;
  spent: number;
  remaining: number;
  percent_used: number;
  status: BudgetStatus;
  alert_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetInput {
  category_id: number;
  amount: number;
  month: number;
  year: number;
}
