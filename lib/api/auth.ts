import { apiFetch, API_BASE_URL } from "./client";

export interface CurrentUser {
  id: number;
  email: string;
  username: string | null;
  is_admin: boolean;
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/me");
}

export function loginWithPassword(email: string, password: string) {
  return apiFetch("/api/login", { method: "POST", json: { email, password } });
}

export function signup(email: string, password: string, username?: string) {
  return apiFetch("/api/signup", { method: "POST", json: { email, password, username } });
}

export function logout() {
  return apiFetch("/logout", { method: "POST" });
}

export function googleLoginUrl(): string {
  return `${API_BASE_URL}/login/google`;
}