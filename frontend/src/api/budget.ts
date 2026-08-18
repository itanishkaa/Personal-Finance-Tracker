import { apiClient } from "./client";
import type { Budget, BudgetInput } from "../types/budget";

export async function getBudgets(
  month?: number,
  year?: number,
): Promise<Budget[]> {
  const params: Record<string, number> = {};
  if (month !== undefined) params.month = month;
  if (year !== undefined) params.year = year;

  const response = await apiClient.get<Budget[]>("/v1/budgets", { params });
  return response.data;
}

export async function createBudget(budget: BudgetInput): Promise<Budget> {
  const response = await apiClient.post<Budget>("/v1/budgets", budget);
  return response.data;
}

export async function updateBudget(
  id: number,
  budget: BudgetInput,
): Promise<Budget> {
  const response = await apiClient.put<Budget>(`/v1/budgets/${id}`, budget);
  return response.data;
}

export async function deleteBudget(id: number): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/v1/budgets/${id}`,
  );
  return response.data;
}
