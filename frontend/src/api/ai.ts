import { apiClient } from "./client";
import type {
  CategorizeInput,
  CategorizeResponse,
  ChatResponse,
  InsightsResponse,
} from "../types/ai";

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>("/v1/ai/chat", {
    message,
  });
  return response.data;
}

export async function categorizeTransaction(
  input: CategorizeInput,
): Promise<CategorizeResponse> {
  const response = await apiClient.post<CategorizeResponse>(
    "/v1/ai/categorize",
    input,
  );
  return response.data;
}

export async function getAiInsights(): Promise<InsightsResponse> {
  const response = await apiClient.post<InsightsResponse>("/v1/ai/insights");
  return response.data;
}
