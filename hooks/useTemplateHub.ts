"use client";

import { useState, useCallback, useEffect } from "react";
import {
  listTemplates,
  createTemplate,
  useTemplate,
  deleteTemplate,
  type TemplateResponse,
  type TemplateCategory,
} from "@/services/api";
import { useCustomHabits } from "./useCustomHabits";
import { getAuthToken } from "@/services/api";
import type { HabitCategory, HabitRepeat } from "@/constants/habits";

// ─── Types ───────────────────────────────────────────────────────

interface UseTemplateHubReturn {
  templates: TemplateResponse[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  fetchTemplates: (search?: string) => Promise<void>;
  publishTemplate: (name: string, description: string) => Promise<void>;
  mergeTemplate: (template: TemplateResponse) => Promise<void>;
  replaceWithTemplate: (template: TemplateResponse) => Promise<void>;
  removeTemplate: (templateId: string) => Promise<void>;
}

// ─── Helper ──────────────────────────────────────────────────────

/** Generate a unique ID for merged category/habit */
function generateMergeId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Convert user categories to template format */
function toTemplateCategories(categories: HabitCategory[]): TemplateCategory[] {
  return categories.map((cat) => ({
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
  }));
}

// ─── Hook ────────────────────────────────────────────────────────

export function useTemplateHub(): UseTemplateHubReturn {
  const { categories, setCategories } = useCustomHabits();
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = !!getAuthToken();

  const fetchTemplates = useCallback(async (search = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listTemplates(1, 50, search);
      setTemplates(result.templates);
    } catch (err: any) {
      setError(err.message || "فشل تحميل القوالب");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const publishTemplate = useCallback(
    async (name: string, description: string) => {
      setError(null);
      try {
        const templateCategories = toTemplateCategories(categories);
        const created = await createTemplate({
          name,
          description,
          categories: templateCategories,
        });
        setTemplates((prev) => [created, ...prev]);
      } catch (err: any) {
        setError(err.message || "فشل نشر القالب");
        throw err;
      }
    },
    [categories]
  );

  /** Convert template categories to local HabitCategory format with fresh IDs */
  const convertTemplateToLocal = useCallback(
    (template: TemplateResponse): HabitCategory[] =>
      template.categories.map((tCat) => ({
        id: generateMergeId(),
        name: tCat.name,
        icon: tCat.icon,
        items: tCat.items.map((tItem) => ({
          id: generateMergeId(),
          label: tItem.label,
          type: tItem.type,
          repeat: (tItem.repeat as HabitRepeat) || "daily",
          repeatDays: tItem.repeatDays,
          repeatMonthDay: tItem.repeatMonthDay,
          repeatMonthHijri: tItem.repeatMonthHijri,
          repeatYearlyDate: tItem.repeatYearlyDate,
          repeatYearlyHijri: tItem.repeatYearlyHijri,
          repeatEndDate: tItem.repeatEndDate,
        })),
      })),
    []
  );

  const mergeTemplate = useCallback(
    async (template: TemplateResponse) => {
      setError(null);
      try {
        await useTemplate(template._id);
        const newCategories = convertTemplateToLocal(template);
        setCategories((prev: HabitCategory[]) => [...prev, ...newCategories]);
      } catch (err: any) {
        setError(err.message || "فشل دمج القالب");
        throw err;
      }
    },
    [setCategories, convertTemplateToLocal]
  );

  const replaceWithTemplate = useCallback(
    async (template: TemplateResponse) => {
      setError(null);
      try {
        await useTemplate(template._id);
        const newCategories = convertTemplateToLocal(template);
        setCategories(() => newCategories);
      } catch (err: any) {
        setError(err.message || "فشل استبدال العادات");
        throw err;
      }
    },
    [setCategories, convertTemplateToLocal]
  );

  const removeTemplate = useCallback(
    async (templateId: string) => {
      setError(null);
      try {
        await deleteTemplate(templateId);
        setTemplates((prev) => prev.filter((t) => t._id !== templateId));
      } catch (err: any) {
        setError(err.message || "فشل حذف القالب");
        throw err;
      }
    },
    []
  );

  return {
    templates,
    isLoading,
    error,
    isAuthenticated,
    fetchTemplates,
    publishTemplate,
    mergeTemplate,
    replaceWithTemplate,
    removeTemplate,
  };
}
