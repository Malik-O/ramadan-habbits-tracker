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
  showOnLeaderboard?: boolean;
  isNewUser?: boolean;
}

export interface UserProfile {
  _id: string;
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  showOnLeaderboard?: boolean;
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

// ─── Leaderboard API Types ───────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  photoURL: string | null;
  totalXp: number;
  streak: number;
  completionRate: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  currentUserRank: number | null;
}

// ─── Leaderboard API Methods ─────────────────────────────────────

/** Get paginated leaderboard */
export function getLeaderboard(
  page = 1,
  pageSize = 20
): Promise<LeaderboardResponse> {
  return apiFetch<LeaderboardResponse>(
    `/leaderboard?page=${page}&pageSize=${pageSize}`
  );
}

/** Toggle leaderboard visibility preference */
export function toggleLeaderboardVisibility(
  showOnLeaderboard: boolean
): Promise<{ showOnLeaderboard: boolean }> {
  return apiFetch<{ showOnLeaderboard: boolean }>(
    "/auth/leaderboard-visibility",
    {
      method: "PATCH",
      body: JSON.stringify({ showOnLeaderboard }),
    }
  );
}

// ─── Group API Types ─────────────────────────────────────────────

export interface GroupHabitItem {
  id: string;
  label: string;
  type: "boolean" | "number";
}

export interface GroupCategory {
  categoryId: string;
  name: string;
  icon: string;
  items: GroupHabitItem[];
  sortOrder: number;
}

export interface GroupResponse {
  _id: string;
  name: string;
  adminUid: string;
  isAdmin: boolean;
  memberCount: number;
  inviteCode: string;
  categories: GroupCategory[];
  createdAt: string;
}

export interface GroupLeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  photoURL: string | null;
  completionRate: number;
  completedCount: number;
  totalPossible: number;
}

export interface GroupLeaderboardResponse {
  entries: GroupLeaderboardEntry[];
  groupName: string;
}

export interface MemberProgressResponse {
  member: {
    uid: string;
    displayName: string;
    photoURL: string | null;
  };
  categories: GroupCategory[];
  dayMap: Record<number, Record<string, boolean | number>>;
}

// ─── Group API Methods ───────────────────────────────────────────

/** Public group info (no auth required) */
export interface GroupPublicInfo {
  _id: string;
  name: string;
  memberCount: number;
  inviteCode: string;
}

/** Get basic group info by invite code (public, no auth required) */
export function getGroupInfoByCode(inviteCode: string): Promise<GroupPublicInfo> {
  // Plain fetch — no auth token needed
  return fetch(`${API_BASE}/groups/info/${encodeURIComponent(inviteCode)}`).then(
    async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "المجموعة غير موجودة");
      }
      return res.json();
    }
  );
}

/** Get all groups the current user belongs to */
export function getMyGroups(): Promise<GroupResponse[]> {
  return apiFetch<GroupResponse[]>("/groups");
}

/** Get single group details */
export function getGroup(groupId: string): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/groups/${groupId}`);
}

/** Create a new group */
export function createGroup(name: string): Promise<GroupResponse> {
  return apiFetch<GroupResponse>("/groups", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

/** Join a group via invite code */
export function joinGroupByCode(inviteCode: string): Promise<GroupResponse> {
  return apiFetch<GroupResponse>("/groups/join", {
    method: "POST",
    body: JSON.stringify({ inviteCode }),
  });
}

/** Leave a group */
export function leaveGroup(groupId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/groups/${groupId}/leave`, {
    method: "POST",
  });
}

/** Delete a group (admin only) */
export function deleteGroup(groupId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/groups/${groupId}`, {
    method: "DELETE",
  });
}

/** Update group info (admin only) */
export function updateGroupInfo(
  groupId: string,
  data: { name?: string }
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** Update group habit categories (admin only) */
export function updateGroupHabits(
  groupId: string,
  categories: GroupCategory[]
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/groups/${groupId}/habits`, {
    method: "PUT",
    body: JSON.stringify({ categories }),
  });
}

/** Get group leaderboard */
export function getGroupLeaderboard(
  groupId: string
): Promise<GroupLeaderboardResponse> {
  return apiFetch<GroupLeaderboardResponse>(`/groups/${groupId}/leaderboard`);
}

/** Get member progress detail (admin only) */
export function getMemberProgress(
  groupId: string,
  memberUid: string
): Promise<MemberProgressResponse> {
  return apiFetch<MemberProgressResponse>(
    `/groups/${groupId}/members/${memberUid}/progress`
  );
}
