"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMyGroups,
  createGroup as apiCreateGroup,
  joinGroupByCode as apiJoinGroup,
  leaveGroup as apiLeaveGroup,
  deleteGroup as apiDeleteGroup,
  updateGroupHabits as apiUpdateGroupHabits,
  type GroupResponse,
  type GroupCategory,
} from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface UseGroupsState {
  groups: GroupResponse[];
  isLoading: boolean;
  error: string | null;
  /** Refresh groups list */
  refresh: () => Promise<void>;
  /** Create a new group */
  createGroup: (name: string) => Promise<GroupResponse | null>;
  /** Join a group via invite code */
  joinGroup: (inviteCode: string) => Promise<GroupResponse | null>;
  /** Leave a group */
  leaveGroup: (groupId: string) => Promise<boolean>;
  /** Delete a group (admin) */
  deleteGroup: (groupId: string) => Promise<boolean>;
  /** Update group habits (admin) */
  updateHabits: (groupId: string, categories: GroupCategory[]) => Promise<GroupResponse | null>;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useGroups(): UseGroupsState {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyGroups();
      setGroups(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء تحميل المجموعات";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createGroup = useCallback(
    async (name: string): Promise<GroupResponse | null> => {
      try {
        const group = await apiCreateGroup(name);
        setGroups((prev) => [...prev, group]);
        return group;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء المجموعة";
        setError(message);
        return null;
      }
    },
    []
  );

  const joinGroup = useCallback(
    async (inviteCode: string): Promise<GroupResponse | null> => {
      try {
        const group = await apiJoinGroup(inviteCode);
        setGroups((prev) => [...prev, group]);
        return group;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "رمز الدعوة غير صالح";
        setError(message);
        return null;
      }
    },
    []
  );

  const leaveGroupFn = useCallback(
    async (groupId: string): Promise<boolean> => {
      try {
        await apiLeaveGroup(groupId);
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "حدث خطأ أثناء مغادرة المجموعة";
        setError(message);
        return false;
      }
    },
    []
  );

  const deleteGroupFn = useCallback(
    async (groupId: string): Promise<boolean> => {
      try {
        await apiDeleteGroup(groupId);
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "حدث خطأ أثناء حذف المجموعة";
        setError(message);
        return false;
      }
    },
    []
  );

  const updateHabits = useCallback(
    async (groupId: string, categories: GroupCategory[]): Promise<GroupResponse | null> => {
      try {
        const updated = await apiUpdateGroupHabits(groupId, categories);
        setGroups((prev) => prev.map((g) => (g._id === groupId ? updated : g)));
        return updated;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "حدث خطأ أثناء تحديث العادات";
        setError(message);
        return null;
      }
    },
    []
  );

  return {
    groups,
    isLoading,
    error,
    refresh,
    createGroup,
    joinGroup,
    leaveGroup: leaveGroupFn,
    deleteGroup: deleteGroupFn,
    updateHabits,
  };
}
