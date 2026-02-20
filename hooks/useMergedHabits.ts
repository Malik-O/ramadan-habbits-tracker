"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { HabitCategory, HabitItem } from "@/constants/habits";
import { getMyGroups, type GroupResponse } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

/** Key used to identify a unique habit across contexts */
function buildKey(categoryName: string, habitLabel: string): string {
  return `${categoryName.trim()}::${habitLabel.trim()}`;
}

export interface UseMergedHabitsReturn {
  /** Personal categories merged with group habits */
  mergedCategories: HabitCategory[];
  /** Returns group names a habit belongs to (for badge display) */
  getGroupNames: (categoryName: string, habitLabel: string) => string[];
  /** Whether group data is still loading */
  isGroupsLoading: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useMergedHabits(
  personalCategories: HabitCategory[],
  isAuthenticated: boolean
): UseMergedHabitsReturn {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);

  // Fetch groups when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setGroups([]);
      return;
    }

    let cancelled = false;
    setIsGroupsLoading(true);

    getMyGroups()
      .then((data) => {
        if (!cancelled) setGroups(data);
      })
      .catch(() => {
        // Silently fail — group badges are non-critical
      })
      .finally(() => {
        if (!cancelled) setIsGroupsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Build habit → group name mapping
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

  const getGroupNames = useCallback(
    (categoryName: string, habitLabel: string): string[] => {
      return habitGroupMap.get(buildKey(categoryName, habitLabel)) || [];
    },
    [habitGroupMap]
  );

  // Merge personal + group habits
  const mergedCategories = useMemo(() => {
    if (groups.length === 0) return personalCategories;

    // Deep-clone personal categories so we can mutate safely
    const merged: HabitCategory[] = personalCategories.map((cat) => ({
      ...cat,
      items: [...cat.items],
    }));

    // Track existing habits by key to avoid duplicates
    const existingHabitKeys = new Set<string>();
    for (const cat of merged) {
      for (const item of cat.items) {
        existingHabitKeys.add(buildKey(cat.name, item.label));
      }
    }

    // Build a name → merged-category-index map for fast lookup
    const categoryIndexByName = new Map<string, number>();
    for (let i = 0; i < merged.length; i++) {
      categoryIndexByName.set(merged[i].name.trim(), i);
    }

    for (const group of groups) {
      for (const groupCat of group.categories) {
        const catName = groupCat.name.trim();
        const existingIndex = categoryIndexByName.get(catName);

        if (existingIndex !== undefined) {
          // Category exists — append only NEW habits
          for (const groupItem of groupCat.items) {
            const key = buildKey(catName, groupItem.label);
            if (!existingHabitKeys.has(key)) {
              existingHabitKeys.add(key);
              merged[existingIndex].items.push({
                id: groupItem.id,
                label: groupItem.label,
                type: groupItem.type,
              });
            }
          }
        } else {
          // New category from group — add it with only unique habits
          const newItems: HabitItem[] = [];
          for (const groupItem of groupCat.items) {
            const key = buildKey(catName, groupItem.label);
            if (!existingHabitKeys.has(key)) {
              existingHabitKeys.add(key);
              newItems.push({
                id: groupItem.id,
                label: groupItem.label,
                type: groupItem.type,
              });
            }
          }

          if (newItems.length > 0) {
            const newCat: HabitCategory = {
              id: groupCat.categoryId,
              name: catName,
              icon: groupCat.icon,
              items: newItems,
            };
            categoryIndexByName.set(catName, merged.length);
            merged.push(newCat);
          }
        }
      }
    }

    return merged;
  }, [personalCategories, groups]);

  return { mergedCategories, getGroupNames, isGroupsLoading };
}
