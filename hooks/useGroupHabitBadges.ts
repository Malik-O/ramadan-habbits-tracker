"use client";

import { useState, useEffect, useMemo } from "react";
import { getMyGroups, type GroupResponse } from "@/services/api";

/**
 * Maps habit labels to the group names they belong to.
 * Uses category name + habit label matching to detect overlaps.
 */
interface GroupHabitMatch {
  /** Map of "categoryName::habitLabel" → group names */
  habitGroupMap: Map<string, string[]>;
  /** Check if a habit (by category name + habit label) belongs to any group */
  getGroupNames: (categoryName: string, habitLabel: string) => string[];
  isLoading: boolean;
}

/** Build a lookup key from category name + habit label */
function buildKey(categoryName: string, habitLabel: string): string {
  return `${categoryName.trim()}::${habitLabel.trim()}`;
}

export function useGroupHabitBadges(isAuthenticated: boolean): GroupHabitMatch {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    setIsLoading(true);

    getMyGroups()
      .then((data) => {
        if (!cancelled) setGroups(data);
      })
      .catch(() => {
        // Silently fail – badges are non-critical
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const habitGroupMap = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const group of groups) {
      for (const category of group.categories) {
        for (const item of category.items) {
          const key = buildKey(category.name, item.label);
          const existing = map.get(key) || [];
          if (!existing.includes(group.name)) {
            existing.push(group.name);
          }
          map.set(key, existing);
        }
      }
    }

    return map;
  }, [groups]);

  const getGroupNames = (categoryName: string, habitLabel: string): string[] => {
    return habitGroupMap.get(buildKey(categoryName, habitLabel)) || [];
  };

  return { habitGroupMap, getGroupNames, isLoading };
}
