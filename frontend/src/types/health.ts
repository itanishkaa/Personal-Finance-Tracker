export type HealthStatus = "positive" | "warning";

// Matches backend HealthFactor
export interface HealthFactor {
  name: string;
  weight: number;
  score: number;
  status: HealthStatus;
  message: string;
}

// Matches backend HealthInsight
export interface HealthInsight {
  status: HealthStatus;
  message: string;
}

// Matches backend FinancialHealthOut
export interface FinancialHealth {
  score: number;
  label: string;
  factors: HealthFactor[];
  insights: HealthInsight[];
}
