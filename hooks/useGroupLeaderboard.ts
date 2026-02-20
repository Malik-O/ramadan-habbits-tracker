"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getGroupLeaderboard,
  getMemberProgress as apiGetMemberProgress,
  type GroupLeaderboardEntry,
  type GroupLeaderboardResponse,
  type MemberProgressResponse,
} from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface UseGroupLeaderboardState {
  entries: GroupLeaderboardEntry[];
  groupName: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Admin: get member detailed progress */
  getMemberProgress: (memberUid: string) => Promise<MemberProgressResponse | null>;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useGroupLeaderboard(groupId: string | null): UseGroupLeaderboardState {
  const [entries, setEntries] = useState<GroupLeaderboardEntry[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data: GroupLeaderboardResponse = await getGroupLeaderboard(groupId);
      setEntries(data.entries);
      setGroupName(data.groupName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء تحميل ترتيب المجموعة";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      refresh();
    }
  }, [groupId, refresh]);

  const getMemberProgress = useCallback(
    async (memberUid: string): Promise<MemberProgressResponse | null> => {
      if (!groupId) return null;
      try {
        return await apiGetMemberProgress(groupId, memberUid);
      } catch (err: unknown) {
        console.error("[useGroupLeaderboard] getMemberProgress error:", err);
        return null;
      }
    },
    [groupId]
  );

  return {
    entries,
    groupName,
    isLoading,
    error,
    refresh,
    getMemberProgress,
  };
}
