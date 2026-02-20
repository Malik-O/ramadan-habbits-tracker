"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  uploadSyncData,
  downloadSyncData,
  getAuthToken,
  type SyncEntryPayload,
  type SyncCategoryPayload,
  type SyncResponse,
} from "@/services/api";
import type { TrackerState, DayUpdatedAtMap } from "./useHabitTracker";
import type { HabitCategory } from "@/constants/habits";

// ─── Constants ───────────────────────────────────────────────────

/** Debounce delay before uploading changes (ms) */
const UPLOAD_DEBOUNCE_MS = 2000;

// ─── Types ───────────────────────────────────────────────────────

interface UseSyncOptions {
  isAuthenticated: boolean;
  trackerState: TrackerState;
  dayUpdatedAt: DayUpdatedAtMap;
  customHabits: HabitCategory[];
  customHabitsUpdatedAt: string;
  currentDay: number;
  theme: "light" | "dark";
  setTrackerState: (state: TrackerState) => void;
  setDayUpdatedAt: (map: DayUpdatedAtMap) => void;
  setCustomHabits: (habits: HabitCategory[]) => void;
  setCustomHabitsUpdatedAt: (ts: string) => void;
  setCurrentDay: (day: number) => void;
}

// ─── Converters: Local ↔ API format ─────────────────────────────

/** Convert local TrackerState + DayUpdatedAtMap → flat entry array for API */
function trackerStateToEntries(
  state: TrackerState,
  timestamps: DayUpdatedAtMap
): SyncEntryPayload[] {
  const entries: SyncEntryPayload[] = [];
  for (const [dayKey, dayRecord] of Object.entries(state)) {
    const dayIndex = Number(dayKey);
    if (isNaN(dayIndex)) continue;
    const updatedAt = timestamps[dayIndex] || new Date().toISOString();

    for (const [habitId, value] of Object.entries(dayRecord)) {
      entries.push({ dayIndex, habitId, value, updatedAt });
    }
  }
  return entries;
}

/** Convert flat entry array from API → local TrackerState + DayUpdatedAtMap */
function entriesToTrackerState(entries: SyncEntryPayload[]): {
  trackerState: TrackerState;
  dayUpdatedAt: DayUpdatedAtMap;
} {
  const trackerState: TrackerState = {};
  const dayUpdatedAt: DayUpdatedAtMap = {};

  for (const entry of entries) {
    if (!trackerState[entry.dayIndex]) {
      trackerState[entry.dayIndex] = {};
    }
    trackerState[entry.dayIndex][entry.habitId] = entry.value;

    // Track the latest updatedAt per day
    const existing = dayUpdatedAt[entry.dayIndex];
    if (!existing || new Date(entry.updatedAt) > new Date(existing)) {
      dayUpdatedAt[entry.dayIndex] = entry.updatedAt;
    }
  }

  return { trackerState, dayUpdatedAt };
}

/** Convert local HabitCategory[] → API category payload array */
function categoriesToPayload(
  categories: HabitCategory[],
  updatedAt: string
): SyncCategoryPayload[] {
  const ts = updatedAt || new Date().toISOString();
  return categories.map((cat, index) => ({
    categoryId: cat.id,
    name: cat.name,
    icon: cat.icon,
    items: cat.items.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
    })),
    sortOrder: index,
    updatedAt: ts,
  }));
}

/** Convert API category payload array → local HabitCategory[] */
function payloadToCategories(payload: SyncCategoryPayload[]): HabitCategory[] {
  return payload
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((cat) => ({
      id: cat.categoryId,
      name: cat.name,
      icon: cat.icon,
      items: cat.items,
    }));
}

// ─── Smart Merge ─────────────────────────────────────────────────

/** Merge local and server entries — latest updatedAt per (day, habit) wins */
function mergeEntries(
  localEntries: SyncEntryPayload[],
  serverEntries: SyncEntryPayload[]
): SyncEntryPayload[] {
  const map = new Map<string, SyncEntryPayload>();

  // Add server entries first
  for (const entry of serverEntries) {
    map.set(`${entry.dayIndex}:${entry.habitId}`, entry);
  }

  // Override with local entries if they are newer
  for (const entry of localEntries) {
    const key = `${entry.dayIndex}:${entry.habitId}`;
    const existing = map.get(key);
    if (
      !existing ||
      new Date(entry.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()
    ) {
      map.set(key, entry);
    }
  }

  return [...map.values()];
}

/** Merge categories — latest updatedAt per categoryId wins */
function mergeCategories(
  localCategories: SyncCategoryPayload[],
  serverCategories: SyncCategoryPayload[]
): SyncCategoryPayload[] {
  const map = new Map<string, SyncCategoryPayload>();

  for (const cat of serverCategories) {
    map.set(cat.categoryId, cat);
  }

  for (const cat of localCategories) {
    const existing = map.get(cat.categoryId);
    if (
      !existing ||
      new Date(cat.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()
    ) {
      map.set(cat.categoryId, cat);
    }
  }

  return [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

// ─── Hook ────────────────────────────────────────────────────────

/**
 * Handles bidirectional sync between localStorage and backend.
 *
 * - **On login**: downloads server data and smart-merges into local state.
 * - **While logged in**: debounced upload of local changes (server returns merged result).
 * - **On logout**: does nothing — all local data is preserved.
 */
export function useSync({
  isAuthenticated,
  trackerState,
  dayUpdatedAt,
  customHabits,
  customHabitsUpdatedAt,
  currentDay,
  setTrackerState,
  setDayUpdatedAt,
  setCustomHabits,
  setCustomHabitsUpdatedAt,
  setCurrentDay,
}: UseSyncOptions): void {
  const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUploadingRef = useRef(false);
  const hasDownloadedRef = useRef(false);
  const prevAuthRef = useRef(isAuthenticated);

  /** Apply merged server response to local state */
  const applyServerResponse = useCallback(
    (response: SyncResponse) => {
      const { trackerState: mergedState, dayUpdatedAt: mergedTimestamps } =
        entriesToTrackerState(response.entries);
      setTrackerState(mergedState);
      setDayUpdatedAt(mergedTimestamps);

      if (response.categories.length > 0) {
        setCustomHabits(payloadToCategories(response.categories));
        // Use the latest category updatedAt as the habits timestamp
        const latestCatTime = response.categories.reduce(
          (latest, cat) =>
            cat.updatedAt > latest ? cat.updatedAt : latest,
          ""
        );
        if (latestCatTime) {
          setCustomHabitsUpdatedAt(latestCatTime);
        }
      }
    },
    [setTrackerState, setDayUpdatedAt, setCustomHabits, setCustomHabitsUpdatedAt]
  );

  // ── Download & smart-merge on login ────────────────────────────
  const downloadAndMerge = useCallback(async () => {
    try {
      const serverData = await downloadSyncData();
      if (!serverData) return;

      // Convert local state to entry format
      const localEntries = trackerStateToEntries(trackerState, dayUpdatedAt);
      const localCatPayload = categoriesToPayload(customHabits, customHabitsUpdatedAt);

      // Smart merge
      const mergedEntries = mergeEntries(localEntries, serverData.entries);
      const mergedCats = mergeCategories(localCatPayload, serverData.categories);

      // Apply merged result locally
      const { trackerState: mergedState, dayUpdatedAt: mergedTimestamps } =
        entriesToTrackerState(mergedEntries);
      setTrackerState(mergedState);
      setDayUpdatedAt(mergedTimestamps);

      if (mergedCats.length > 0) {
        setCustomHabits(payloadToCategories(mergedCats));
        const latestCatTime = mergedCats.reduce(
          (latest, cat) =>
            cat.updatedAt > latest ? cat.updatedAt : latest,
          ""
        );
        if (latestCatTime) {
          setCustomHabitsUpdatedAt(latestCatTime);
        }
      }
    } catch (error) {
      console.warn("[useSync] Failed to download server data:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTrackerState, setDayUpdatedAt, setCustomHabits, setCustomHabitsUpdatedAt, setCurrentDay]);

  // ── Upload to server (returns merged result) ───────────────────
  const uploadToServer = useCallback(async () => {
    if (isUploadingRef.current) return;
    if (!getAuthToken()) return;

    isUploadingRef.current = true;
    try {
      const entries = trackerStateToEntries(trackerState, dayUpdatedAt);
      const categories = categoriesToPayload(customHabits, customHabitsUpdatedAt);

      const response = await uploadSyncData({ entries, categories });

      // Apply the server's merged result back to local state
      if (response) {
        applyServerResponse(response);
      }
    } catch (error) {
      console.warn("[useSync] Failed to upload data:", error);
    } finally {
      isUploadingRef.current = false;
    }
  }, [
    trackerState,
    dayUpdatedAt,
    customHabits,
    customHabitsUpdatedAt,
    applyServerResponse,
  ]);

  // ── Detect login transition & download ─────────────────────────
  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (isAuthenticated && !wasAuthenticated && !hasDownloadedRef.current) {
      hasDownloadedRef.current = true;
      downloadAndMerge();
    }

    if (!isAuthenticated && wasAuthenticated) {
      hasDownloadedRef.current = false;
    }
  }, [isAuthenticated, downloadAndMerge]);

  // ── Debounced upload on data changes ───────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!hasDownloadedRef.current) return;

    if (uploadTimerRef.current) {
      clearTimeout(uploadTimerRef.current);
    }

    uploadTimerRef.current = setTimeout(() => {
      uploadToServer();
    }, UPLOAD_DEBOUNCE_MS);

    return () => {
      if (uploadTimerRef.current) {
        clearTimeout(uploadTimerRef.current);
      }
    };
  }, [isAuthenticated, trackerState, customHabits, currentDay, uploadToServer]);
}
