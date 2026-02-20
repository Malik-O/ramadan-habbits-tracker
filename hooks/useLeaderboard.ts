"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getLeaderboard,
  type LeaderboardResponse,
  type LeaderboardEntry,
} from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface UseLeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalCount: number;
  currentUserRank: number | null;
  /** Fetch the first page */
  refresh: () => Promise<void>;
  /** Load the next page (appends to existing entries) */
  loadMore: () => Promise<void>;
  /** Whether more pages are available */
  hasMore: boolean;
}

const PAGE_SIZE = 20;

// ─── Hook ────────────────────────────────────────────────────────

export function useLeaderboard(): UseLeaderboardState {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  /** Apply response data from the API */
  const applyResponse = useCallback(
    (data: LeaderboardResponse, append: boolean) => {
      setEntries((prev) => (append ? [...prev, ...data.entries] : data.entries));
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentUserRank(data.currentUserRank);
    },
    []
  );

  /** Fetch first page */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(1, PAGE_SIZE);
      applyResponse(data, false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء تحميل لوحة المتصدرين";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [applyResponse]);

  /** Load next page */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || page >= totalPages) return;

    setIsLoadingMore(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const data = await getLeaderboard(nextPage, PAGE_SIZE);
      applyResponse(data, true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء تحميل المزيد";
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, page, totalPages, applyResponse]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasMore = page < totalPages;

  return {
    entries,
    isLoading,
    isLoadingMore,
    error,
    page,
    totalPages,
    totalCount,
    currentUserRank,
    refresh,
    loadMore,
    hasMore,
  };
}
