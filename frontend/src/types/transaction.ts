export type TransactionType = "income" | "expense";

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Matches the backend's TransactionOut schema exactly - no user_id
// (ownership is implicit), and category_id/payment_method are both
// optional since the backend allows null for either.
export interface Transaction {
  id: number;
  category_id: number | null;
  amount: number;
  type: TransactionType;
  description: string;
  date: string; // ISO date string, e.g. "2026-08-11"
  payment_method: PaymentMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TransactionInput = Omit<
  Transaction,
  "id" | "created_at" | "updated_at"
>;
