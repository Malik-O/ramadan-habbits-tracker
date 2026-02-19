const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** Stored JWT token key */
const TOKEN_KEY = "hemma-auth-token";

/** Get stored auth token */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Store auth token */
export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Base fetch wrapper with automatic auth header injection and error handling.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "حدث خطأ غير متوقع");
  }

  return data as T;
}

// ─── Auth API Types ──────────────────────────────────────────────

export interface AuthResponse {
  _id: string;
  uid: string;
  name: string;
  email: string;
  token: string;
  photoURL?: string;
  provider?: "google" | "local";
}

export interface UserProfile {
  _id: string;
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}

export interface SyncData {
  trackerState: Record<number, Record<string, boolean | number>>;
  customHabits: any[]; // Using any[] for simplicity, or import distinct types if needed
  currentDay: number;
  theme: "light" | "dark";
  lastSynced?: Date;
}

// ─── Auth API Methods ────────────────────────────────────────────

/** Login with email and password */
export function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Register a new user */
export function registerWithEmail(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/** Login/register via Google credential */
export function loginWithGoogle(
  credential: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

/** Get current user profile (requires auth token) */
export function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/auth/profile");
}

// ─── Sync API Methods ────────────────────────────────────────────

/** Upload local state to server */
export function uploadSyncData(data: Omit<SyncData, "lastSynced">): Promise<SyncData> {
  return apiFetch<SyncData>("/sync/upload", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Download state from server */
export function downloadSyncData(): Promise<SyncData> {
  return apiFetch<SyncData>("/sync/download");
}
