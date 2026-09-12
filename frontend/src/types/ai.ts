export interface ChatInput {
  message: string;
}

// Matches backend ChatOut
export interface ChatResponse {
  response: string;
}

export interface CategorizeInput {
  description: string;
  type: "income" | "expense";
}

// Matches backend CategorizeOut
export interface CategorizeResponse {
  category_id: number | null;
  category_name: string | null;
  confidence: number; // 0-100
}

// Matches backend InsightsOut
export interface InsightsResponse {
  insights: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
