/**
 * Google Analytics 4 event tracking utilities.
 *
 * All helpers gracefully no-op when GA is not loaded,
 * so they are safe to call unconditionally.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Core helpers ────────────────────────────────────────────

/** Send a custom GA4 event */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

/** Track a virtual page view (useful for SPAs) */
export function trackPageView(url: string, title?: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: url,
      page_title: title,
    });
  }
}

// ─── Domain-specific event helpers ───────────────────────────

/** Habit toggled (boolean) */
export function trackHabitToggle(habitId: string, completed: boolean) {
  trackEvent("habit_toggle", {
    habit_id: habitId,
    completed,
  });
}

/** Habit counter value set */
export function trackHabitValueSet(habitId: string, value: number) {
  trackEvent("habit_value_set", {
    habit_id: habitId,
    value,
  });
}

/** Day selected in the day selector strip */
export function trackDaySelect(day: number) {
  trackEvent("day_select", { day: day + 1 });
}

/** Habit block (category accordion) expanded / collapsed */
export function trackBlockToggle(categoryId: string, opened: boolean) {
  trackEvent("block_toggle", {
    category_id: categoryId,
    opened,
  });
}

/** Bottom navigation tab tapped */
export function trackNavTap(tab: string) {
  trackEvent("nav_tap", { tab });
}

/** Theme changed */
export function trackThemeChange(theme: string) {
  trackEvent("theme_change", { theme });
}

/** Data reset triggered */
export function trackDataReset() {
  trackEvent("data_reset");
}

/** Category added / edited / removed */
export function trackCategoryAction(
  action: "add" | "edit" | "remove",
  categoryId?: string,
) {
  trackEvent("category_action", { action, category_id: categoryId ?? "" });
}

/** Habit added / edited / removed */
export function trackHabitAction(
  action: "add" | "edit" | "remove",
  habitId?: string,
) {
  trackEvent("habit_action", { action, habit_id: habitId ?? "" });
}

/** All habits in a block completed (confetti moment) */
export function trackBlockCompleted(categoryId: string) {
  trackEvent("block_completed", { category_id: categoryId });
}

/** PWA install button clicked */
export function trackPwaInstallClick(source: "banner" | "profile") {
  trackEvent("pwa_install_click", { source });
}

/** PWA install banner dismissed */
export function trackPwaInstallDismiss() {
  trackEvent("pwa_install_dismiss");
}
