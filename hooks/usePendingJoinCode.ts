import { useCallback } from "react";

const PENDING_JOIN_KEY = "pendingGroupJoinCode";

/**
 * Hook for managing the pending group join code stored in localStorage.
 *
 * Flow:
 * 1. Unauthenticated user opens a join link → GroupsPageContent stores the code.
 * 2. User signs in → GroupsManager calls consumePendingCode() to retrieve
 *    and clear it, then opens the join bottom sheet automatically.
 */
export function usePendingJoinCode() {
  const consumePendingCode = useCallback((): string | null => {
    try {
      const code = localStorage.getItem(PENDING_JOIN_KEY);
      if (code) {
        localStorage.removeItem(PENDING_JOIN_KEY);
      }
      return code;
    } catch {
      return null;
    }
  }, []);

  return { consumePendingCode };
}
