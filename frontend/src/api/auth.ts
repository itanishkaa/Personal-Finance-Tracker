import { apiClient } from "./client";
import type {
  LoginInput,
  RegisterInput,
  TokenResponse,
  User,
} from "../types/auth";

// Registering creates the account but does not log the caller in - the
// backend's /register only returns the created user, no token. Callers
// should follow up with loginUser() using the same credentials.
export async function registerUser(input: RegisterInput): Promise<User> {
  const response = await apiClient.post<User>("/v1/auth/register", input);
  return response.data;
}

export async function loginUser(input: LoginInput): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/v1/auth/login", input);
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/v1/auth/me");
  return response.data;
}
