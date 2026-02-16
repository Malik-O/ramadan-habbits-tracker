"use client";

import { useState, useEffect, useCallback } from "react";

export type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // 1. Try to read from localStorage
    const stored = window.localStorage.getItem("ramadan-theme");
    if (stored) {
      try {
        setTheme(JSON.parse(stored));
        return;
      } catch (e) {
        console.warn("Failed to parse theme from localStorage", e);
      }
    }

    // 2. If no storage, check system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mediaQuery.matches ? "dark" : "light");

    // Optional: Listen for system changes if no override specifically set?
    // For simplicity, we just set the initial value.
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem("ramadan-theme", JSON.stringify(next));
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}
