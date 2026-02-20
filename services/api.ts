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
  isNewUser?: boolean;
}

export interface UserProfile {
  _id: string;
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
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

// ─── Sync API Types ──────────────────────────────────────────────

/** A single habit tracking record for sync */
export interface SyncEntryPayload {
  dayIndex: number;
  habitId: string;
  value: boolean | number;
  updatedAt: string; // ISO string
}

/** A habit category for sync */
export interface SyncCategoryPayload {
  categoryId: string;
  name: string;
  icon: string;
  items: { id: string; label: string; type: "boolean" | "number" }[];
  sortOrder: number;
  updatedAt: string; // ISO string
}

/** Server response shape for sync endpoints */
export interface SyncResponse {
  entries: SyncEntryPayload[];
  categories: SyncCategoryPayload[];
}

// ─── Sync API Methods ────────────────────────────────────────────

/** Upload local entries + categories to server (smart merge) */
export function uploadSyncData(data: {
  entries: SyncEntryPayload[];
  categories: SyncCategoryPayload[];
}): Promise<SyncResponse> {
  return apiFetch<SyncResponse>("/sync/upload", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Download all entries + categories from server */
export function downloadSyncData(): Promise<SyncResponse> {
  return apiFetch<SyncResponse>("/sync/download");
}

/** Reset (delete) all user data on the server */
export function resetSyncData(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/sync/reset", {
    method: "DELETE",
  });
}

/**
 * Push existing localStorage data to the server right after sign-up.
 * Reads directly from localStorage so the caller doesn't need to pass state.
 */
export async function initialUploadAfterSignup(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Read tracker state from localStorage
    const rawTracker = localStorage.getItem("hemma-tracker");
    const trackerState: Record<number, Record<string, boolean | number>> =
      rawTracker ? JSON.parse(rawTracker) : {};

    // Read custom habits
    const rawHabits = localStorage.getItem("hemma-custom-habits");
    const customHabits: { id: string; name: string; icon: string; items: { id: string; label: string; type: "boolean" | "number" }[] }[] =
      rawHabits ? JSON.parse(rawHabits) : [];

    // Read timestamps
    const rawDayTimestamps = localStorage.getItem("hemma-day-updated-at");
    const dayTimestamps: Record<number, string> =
      rawDayTimestamps ? JSON.parse(rawDayTimestamps) : {};

    const rawHabitsTimestamp = localStorage.getItem("hemma-custom-habits-updated-at");
    const habitsTimestamp: string = rawHabitsTimestamp
      ? JSON.parse(rawHabitsTimestamp)
      : new Date().toISOString();

    // Convert to entry format
    const entries: SyncEntryPayload[] = [];
    for (const [dayKey, dayRecord] of Object.entries(trackerState)) {
      const dayIndex = Number(dayKey);
      if (isNaN(dayIndex)) continue;
      const updatedAt = dayTimestamps[dayIndex] || new Date().toISOString();

      for (const [habitId, value] of Object.entries(dayRecord as Record<string, boolean | number>)) {
        entries.push({ dayIndex, habitId, value, updatedAt });
      }
    }

    // Convert to category format
    const now = habitsTimestamp || new Date().toISOString();
    const categories: SyncCategoryPayload[] = customHabits.map((cat, index) => ({
      categoryId: cat.id,
      name: cat.name,
      icon: cat.icon,
      items: cat.items.map((item) => ({
        id: item.id,
        label: item.label,
        type: item.type,
      })),
      sortOrder: index,
      updatedAt: now,
    }));

    // Only upload if there's data
    if (entries.length > 0 || categories.length > 0) {
      await uploadSyncData({ entries, categories });
    }
  } catch (error) {
    console.warn("[api] Failed to upload initial data after signup:", error);
  }
}

