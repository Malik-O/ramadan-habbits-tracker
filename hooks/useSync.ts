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
import { useSyncQueue } from "./useSyncQueue";
import type { TrackerState, DayUpdatedAtMap } from "./useHabitTracker";
import type { HabitCategory } from "@/constants/habits";
import { getDateStringForDayIndex, getDayIndexFromDateString } from "@/utils/hijri";

// ─── Constants ───────────────────────────────────────────────────

/** Minimum interval between uploads (ms) — acts as a throttle ceiling */
const THROTTLE_INTERVAL_MS = 3000;

/** Grace period after the last change before flushing (ms) */
const TRAILING_FLUSH_MS = 1500;

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
    
    const date = getDateStringForDayIndex(dayIndex);
    const updatedAt = timestamps[dayIndex] || new Date().toISOString();

    for (const [habitId, value] of Object.entries(dayRecord)) {
      entries.push({ date, habitId, value, updatedAt });
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
    const dayIndex = getDayIndexFromDateString(entry.date);
    
    if (!trackerState[dayIndex]) {
      trackerState[dayIndex] = {};
    }
    trackerState[dayIndex][entry.habitId] = entry.value;

    // Track the latest updatedAt per day
    const existing = dayUpdatedAt[dayIndex];
    if (!existing || new Date(entry.updatedAt) > new Date(existing)) {
      dayUpdatedAt[dayIndex] = entry.updatedAt;
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
      repeat: item.repeat || "daily",
      repeatDays: item.repeatDays,
      repeatMonthDay: item.repeatMonthDay,
      repeatMonthHijri: item.repeatMonthHijri,
      repeatYearlyDate: item.repeatYearlyDate,
      repeatYearlyHijri: item.repeatYearlyHijri,
      repeatEndDate: item.repeatEndDate,
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
      items: cat.items.map((item) => ({
        id: item.id,
        label: item.label,
        type: item.type,
        repeat: (item.repeat as HabitCategory["items"][number]["repeat"]) || "daily",
        repeatDays: item.repeatDays,
        repeatMonthDay: item.repeatMonthDay,
        repeatMonthHijri: item.repeatMonthHijri,
        repeatYearlyDate: item.repeatYearlyDate,
        repeatYearlyHijri: item.repeatYearlyHijri,
        repeatEndDate: item.repeatEndDate,
      })),
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
    map.set(`${entry.date}:${entry.habitId}`, entry);
  }

  // Override with local entries if they are newer
  for (const entry of localEntries) {
    const key = `${entry.date}:${entry.habitId}`;
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
 * - **While logged in**: batches dirty changes into a queue and flushes
 *   them to the server via a throttle (max once per THROTTLE_INTERVAL_MS)
 *   with a trailing flush to catch final changes.
 * - **On logout / page close**: flush remaining queue immediately.
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
  const queue = useSyncQueue();

  const isUploadingRef = useRef(false);
  const hasDownloadedRef = useRef(false);
  const prevAuthRef = useRef(isAuthenticated);

  // Throttle timer refs
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trailingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUploadTimeRef = useRef(0);

  // Keep latest state in refs for the flush function to read without stale closures
  const trackerRef = useRef(trackerState);
  const dayUpdatedAtRef = useRef(dayUpdatedAt);
  const customHabitsRef = useRef(customHabits);
  const customHabitsUpdatedAtRef = useRef(customHabitsUpdatedAt);

  // Sync refs with latest values on every render
  trackerRef.current = trackerState;
  dayUpdatedAtRef.current = dayUpdatedAt;
  customHabitsRef.current = customHabits;
  customHabitsUpdatedAtRef.current = customHabitsUpdatedAt;

  // Keep previous state snapshots for diffing
  const prevTrackerRef = useRef(trackerState);
  const prevCustomHabitsRef = useRef(customHabits);
  const prevCustomHabitsUpdatedAtRef = useRef(customHabitsUpdatedAt);

  /** Apply merged server response to local state */
  const applyServerResponse = useCallback(
    (response: SyncResponse) => {
      const { trackerState: mergedState, dayUpdatedAt: mergedTimestamps } =
        entriesToTrackerState(response.entries);
      setTrackerState(mergedState);
      setDayUpdatedAt(mergedTimestamps);

      if (response.categories.length > 0) {
        setCustomHabits(payloadToCategories(response.categories));
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

  // ── Flush queue & upload only dirty changes ────────────────────

  const flushAndUpload = useCallback(async () => {
    if (isUploadingRef.current) return;
    if (!getAuthToken()) return;

    const snapshot = queue.flush();
    if (snapshot.isEmpty) return;

    isUploadingRef.current = true;
    lastUploadTimeRef.current = Date.now();

    try {
      const response = await uploadSyncData({
        entries: snapshot.entries,
        categories: snapshot.categories,
      });

      if (response) {
        applyServerResponse(response);
      }
    } catch (error) {
      // On failure, re-enqueue the failed items so they retry next flush
      for (const entry of snapshot.entries) {
        queue.enqueueEntry(entry);
      }
      if (snapshot.categories.length > 0) {
        queue.enqueueCategories(snapshot.categories);
      }
      console.warn("[useSync] Upload failed, changes re-queued:", error);
    } finally {
      isUploadingRef.current = false;
    }
  }, [queue, applyServerResponse]);

  // ── Schedule the next upload (throttle + trailing) ─────────────

  const scheduleFlush = useCallback(() => {
    // Clear any existing trailing timer
    if (trailingTimerRef.current) {
      clearTimeout(trailingTimerRef.current);
      trailingTimerRef.current = null;
    }

    const elapsed = Date.now() - lastUploadTimeRef.current;
    const remaining = THROTTLE_INTERVAL_MS - elapsed;

    if (remaining <= 0 && !throttleTimerRef.current) {
      // Enough time has passed — flush immediately
      flushAndUpload();
    } else if (!throttleTimerRef.current) {
      // Schedule a flush at the throttle boundary
      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        flushAndUpload();
      }, remaining);
    }

    // Always set a trailing timer to catch the "last" change
    trailingTimerRef.current = setTimeout(() => {
      trailingTimerRef.current = null;
      if (queue.hasPendingChanges()) {
        flushAndUpload();
      }
    }, TRAILING_FLUSH_MS);
  }, [flushAndUpload, queue]);

  // ── Download & smart-merge on login ────────────────────────────

  const downloadAndMerge = useCallback(async () => {
    try {
      const serverData = await downloadSyncData();
      if (!serverData) return;

      const localEntries = trackerStateToEntries(
        trackerRef.current,
        dayUpdatedAtRef.current
      );
      const localCatPayload = categoriesToPayload(
        customHabitsRef.current,
        customHabitsUpdatedAtRef.current
      );

      const mergedEntries = mergeEntries(localEntries, serverData.entries);
      const mergedCats = mergeCategories(localCatPayload, serverData.categories);

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

      // Update prev refs to the merged state so the diff effect
      // doesn't immediately re-queue everything we just downloaded
      prevTrackerRef.current = mergedState;
      prevCustomHabitsRef.current = payloadToCategories(mergedCats);
      prevCustomHabitsUpdatedAtRef.current =
        mergedCats.reduce(
          (latest, cat) => (cat.updatedAt > latest ? cat.updatedAt : latest),
          ""
        ) || customHabitsUpdatedAtRef.current;
    } catch (error) {
      console.warn("[useSync] Failed to download server data:", error);
    }
  }, [setTrackerState, setDayUpdatedAt, setCustomHabits, setCustomHabitsUpdatedAt]);

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

  // ── Diff tracker state & enqueue only changed entries ──────────

  useEffect(() => {
    if (!isAuthenticated || !hasDownloadedRef.current) return;

    const prevState = prevTrackerRef.current;
    const nextState = trackerState;

    // Find entries that actually changed
    for (const [dayKey, dayRecord] of Object.entries(nextState)) {
      const dayIndex = Number(dayKey);
      if (isNaN(dayIndex)) continue;

      const date = getDateStringForDayIndex(dayIndex);
      const prevDayRecord = prevState[dayIndex] || {};
      const updatedAt = dayUpdatedAt[dayIndex] || new Date().toISOString();

      for (const [habitId, value] of Object.entries(dayRecord)) {
        if (prevDayRecord[habitId] !== value) {
          queue.enqueueEntry({ date, habitId, value, updatedAt });
        }
      }
    }

    prevTrackerRef.current = nextState;

    if (queue.hasPendingChanges()) {
      scheduleFlush();
    }
  }, [isAuthenticated, trackerState, dayUpdatedAt, queue, scheduleFlush]);

  // ── Diff custom habits & enqueue only on change ────────────────

  useEffect(() => {
    if (!isAuthenticated || !hasDownloadedRef.current) return;

    const prevHabits = prevCustomHabitsRef.current;
    const nextHabits = customHabits;
    const prevTs = prevCustomHabitsUpdatedAtRef.current;
    const nextTs = customHabitsUpdatedAt;

    // Simple reference or timestamp check
    if (prevHabits !== nextHabits || prevTs !== nextTs) {
      const payload = categoriesToPayload(nextHabits, nextTs);
      queue.enqueueCategories(payload);

      prevCustomHabitsRef.current = nextHabits;
      prevCustomHabitsUpdatedAtRef.current = nextTs;

      scheduleFlush();
    }
  }, [isAuthenticated, customHabits, customHabitsUpdatedAt, queue, scheduleFlush]);

  // ── Flush on page unload (best-effort) ─────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleBeforeUnload = () => {
      if (!queue.hasPendingChanges()) return;
      if (!getAuthToken()) return;

      const snapshot = queue.flush();
      if (snapshot.isEmpty) return;

      // Use sendBeacon for reliable delivery on page close
      const token = getAuthToken();
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const blob = new Blob(
        [JSON.stringify({ entries: snapshot.entries, categories: snapshot.categories })],
        { type: "application/json" }
      );

      // sendBeacon doesn't support custom headers, so we embed the token
      // Use a query param fallback — if your server supports it
      // Otherwise, fall back to a synchronous XHR
      try {
        const sent = navigator.sendBeacon(`${API_BASE}/sync/upload?token=${token}`, blob);
        if (!sent) {
          // Re-queue if beacon failed (unlikely to help, but safe)
          for (const entry of snapshot.entries) {
            queue.enqueueEntry(entry);
          }
          if (snapshot.categories.length > 0) {
            queue.enqueueCategories(snapshot.categories);
          }
        }
      } catch {
        // Best-effort — data is still in localStorage
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAuthenticated, queue]);

  // ── Cleanup timers on unmount ──────────────────────────────────

  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
      if (trailingTimerRef.current) clearTimeout(trailingTimerRef.current);
    };
  }, []);
}
