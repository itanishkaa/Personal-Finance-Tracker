import type { TransactionType } from "./transaction";

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

// Matches the backend's RecurringOut schema exactly - monthly_equivalent
// is computed server-side at read time, never stored.
export interface RecurringTransaction {
  id: number;
  category_id: number | null;
  category_name: string | null;
  category_icon: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  frequency: RecurringFrequency;
  next_date: string; // ISO date string
  active: boolean;
  monthly_equivalent: number;
  created_at: string;
  updated_at: string;
}

export interface RecurringInput {
  category_id: number | null;
  amount: number;
  type: TransactionType;
  description: string;
  frequency: RecurringFrequency;
  next_date: string;
  active: boolean;
}
