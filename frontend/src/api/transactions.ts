import { apiClient } from "./client";
import type {
  Transaction,
  TransactionInput,
  TransactionType,
} from "../types/transaction";

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: number;
}

export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<Transaction[]> {
  const params: Record<string, string | number> = {};
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.type) params.type = filters.type;
  if (filters.categoryId) params.categoryId = filters.categoryId;

  const response = await apiClient.get<Transaction[]>("/v1/transactions", {
    params,
  });
  return response.data;
}

export async function addTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  const response = await apiClient.post<Transaction>("/v1/transactions", input);
  return response.data;
}

export async function updateTransaction(
  id: number,
  input: TransactionInput,
): Promise<Transaction> {
  const response = await apiClient.put<Transaction>(
    `/v1/transactions/${id}`,
    input,
  );
  return response.data;
}

export async function deleteTransaction(
  id: number,
): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/v1/transactions/${id}`,
  );
  return response.data;
}
