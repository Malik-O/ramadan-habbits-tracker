"use client";

import { useState, useEffect, useCallback } from "react";

export type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Read from localStorage on mount to sync state
    const stored = window.localStorage.getItem("hemma-theme");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed === "dark" || parsed === "light") {
          setTheme(parsed);
        }
      } catch (e) {
        // If parsing fails, it might be a raw string "dark" or "light"
        if (stored === "dark" || stored === "light") {
          setTheme(stored as Theme);
        } else {
          console.warn("Failed to parse theme from localStorage", e);
        }
      }
    } else {
      // Default to light if no theme is set
      window.localStorage.setItem("hemma-theme", JSON.stringify("light"));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't modify DOM until we've mounted and checked storage
    // This prevents overwriting the class set by layout.tsx script
    if (!mounted) return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem("hemma-theme", JSON.stringify(next));
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}
