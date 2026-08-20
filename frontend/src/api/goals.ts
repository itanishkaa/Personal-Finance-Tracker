import { apiClient } from "./client";
import type { Goal, GoalCreateInput, GoalUpdateInput } from "../types/goal";

export async function getGoals(): Promise<Goal[]> {
  const response = await apiClient.get<Goal[]>("/v1/goals");
  return response.data;
}

export async function createGoal(goal: GoalCreateInput): Promise<Goal> {
  const response = await apiClient.post<Goal>("/v1/goals", goal);
  return response.data;
}

export async function updateGoal(
  id: number,
  goal: GoalUpdateInput,
): Promise<Goal> {
  const response = await apiClient.put<Goal>(`/v1/goals/${id}`, goal);
  return response.data;
}

export async function deleteGoal(id: number): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/v1/goals/${id}`,
  );
  return response.data;
}

export async function contributeToGoal(
  id: number,
  amount: number,
): Promise<Goal> {
  const response = await apiClient.post<Goal>(`/v1/goals/${id}/contribute`, {
    amount,
  });
  return response.data;
}
