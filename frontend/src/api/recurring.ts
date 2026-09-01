import { apiClient } from "./client";
import type { RecurringInput, RecurringTransaction } from "../types/recurring";

export async function getRecurring(): Promise<RecurringTransaction[]> {
  const response = await apiClient.get<RecurringTransaction[]>("/v1/recurring");
  return response.data;
}

export async function createRecurring(
  input: RecurringInput,
): Promise<RecurringTransaction> {
  const response = await apiClient.post<RecurringTransaction>(
    "/v1/recurring",
    input,
  );
  return response.data;
}

export async function updateRecurring(
  id: number,
  input: RecurringInput,
): Promise<RecurringTransaction> {
  const response = await apiClient.put<RecurringTransaction>(
    `/v1/recurring/${id}`,
    input,
  );
  return response.data;
}

export async function deleteRecurring(
  id: number,
): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/v1/recurring/${id}`,
  );
  return response.data;
}
