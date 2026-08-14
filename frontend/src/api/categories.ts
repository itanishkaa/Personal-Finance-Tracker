import { apiClient } from "./client";
import type { Category, CategoryInput } from "../types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/v1/categories");
  return response.data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const response = await apiClient.post<Category>("/v1/categories", input);
  return response.data;
}

export async function updateCategory(
  id: number,
  input: CategoryInput,
): Promise<Category> {
  const response = await apiClient.put<Category>(`/v1/categories/${id}`, input);
  return response.data;
}

export async function deleteCategory(
  id: number,
): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/v1/categories/${id}`,
  );
  return response.data;
}
