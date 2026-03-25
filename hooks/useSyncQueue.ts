"use client";

import { useRef, useCallback } from "react";
import type { SyncEntryPayload, SyncCategoryPayload } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface DirtyEntry {
  date: string;
  habitId: string;
  value: boolean | number;
  updatedAt: string;
}

interface DirtyCategory {
  categoryId: string;
  payload: SyncCategoryPayload;
}

interface QueueSnapshot {
  entries: SyncEntryPayload[];
  categories: SyncCategoryPayload[];
  isEmpty: boolean;
}

export interface SyncQueue {
  /** Mark a single habit entry as dirty (needs upload) */
  enqueueEntry: (entry: DirtyEntry) => void;
  /** Mark all categories as dirty (needs upload) */
  enqueueCategories: (categories: SyncCategoryPayload[]) => void;
  /** Take a snapshot of all queued changes and clear the queue */
  flush: () => QueueSnapshot;
  /** Check if there are pending changes */
  hasPendingChanges: () => boolean;
}

// ─── Hook ────────────────────────────────────────────────────────

/**
 * Maintains an in-memory queue of dirty (changed) entries and categories
 * that need to be synced to the server.
 *
 * Uses refs to avoid re-renders — the queue is invisible to React's
 * rendering cycle and only consumed by the sync throttle logic.
 */
export function useSyncQueue(): SyncQueue {
  // Map key: "date:habitId" → latest dirty entry
  const dirtyEntriesRef = useRef<Map<string, SyncEntryPayload>>(new Map());
  // Map key: "categoryId" → latest dirty category payload
  const dirtyCategoriesRef = useRef<Map<string, SyncCategoryPayload>>(new Map());

  const enqueueEntry = useCallback((entry: DirtyEntry) => {
    const key = `${entry.date}:${entry.habitId}`;
    dirtyEntriesRef.current.set(key, {
      date: entry.date,
      habitId: entry.habitId,
      value: entry.value,
      updatedAt: entry.updatedAt,
    });
  }, []);

  const enqueueCategories = useCallback((categories: SyncCategoryPayload[]) => {
    for (const cat of categories) {
      dirtyCategoriesRef.current.set(cat.categoryId, cat);
    }
  }, []);

  const flush = useCallback((): QueueSnapshot => {
    const entries = [...dirtyEntriesRef.current.values()];
    const categories = [...dirtyCategoriesRef.current.values()];
    const isEmpty = entries.length === 0 && categories.length === 0;

    // Clear the queue after snapshot
    dirtyEntriesRef.current.clear();
    dirtyCategoriesRef.current.clear();

    return { entries, categories, isEmpty };
  }, []);

  const hasPendingChanges = useCallback((): boolean => {
    return dirtyEntriesRef.current.size > 0 || dirtyCategoriesRef.current.size > 0;
  }, []);

  return { enqueueEntry, enqueueCategories, flush, hasPendingChanges };
}
