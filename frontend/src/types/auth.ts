export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Matches the backend's Token schema exactly - login returns only a token,
// never the user (that's fetched separately via /v1/auth/me).
export interface TokenResponse {
  access_token: string;
  token_type: string;
}
