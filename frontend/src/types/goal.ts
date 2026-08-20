export type GoalStatus = "active" | "completed";

// Matches the backend's GoalOut schema exactly - progress figures are
// computed server-side at read time, never stored.
export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  remaining_amount: number;
  progress_percent: number;
  target_date: string; // ISO date string
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

// Matches backend GoalCreate - current_amount is optional (defaults to 0)
export interface GoalCreateInput {
  name: string;
  target_amount: number;
  target_date: string;
  current_amount?: number;
}

// Matches backend GoalUpdate - deliberately no current_amount; only
// contribute() can move that figure.
export interface GoalUpdateInput {
  name: string;
  target_amount: number;
  target_date: string;
}
