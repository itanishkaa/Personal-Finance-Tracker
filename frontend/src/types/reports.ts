// Matches backend CategoryAmount
export interface CategoryAmount {
  name: string;
  amount: number;
}

// Matches backend LargestExpense
export interface LargestExpense {
  description: string;
  amount: number;
  date: string;
  category_name: string | null;
}

// Matches backend MonthlyReportOut
export interface MonthlyReport {
  period: string;
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  savings_rate: number;
  top_category: CategoryAmount | null;
  largest_expense: LargestExpense | null;
}
