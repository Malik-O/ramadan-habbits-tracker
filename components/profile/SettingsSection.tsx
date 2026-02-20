"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Moon as MoonIcon, Sun, Download, Trophy } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { trackPwaInstallClick } from "@/utils/analytics";
import { useAuth } from "@/hooks/useAuth";
import { toggleLeaderboardVisibility, getProfile } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────

interface SettingsSectionProps {
  theme: string;
  onToggleTheme: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function SettingsSection({ theme, onToggleTheme }: SettingsSectionProps) {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const { user } = useAuth();
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Load current preference from profile
  useEffect(() => {
    if (!user) return;

    getProfile()
      .then((profile) => {
        if (typeof profile.showOnLeaderboard === "boolean") {
          setShowOnLeaderboard(profile.showOnLeaderboard);
        }
      })
      .catch(() => {
        /* silent — default to true */
      });
  }, [user]);

  const handleInstall = async () => {
    trackPwaInstallClick("profile");
    if (isInstallable) {
      await promptInstall();
    }
  };

  const handleToggleLeaderboard = useCallback(async () => {
    if (isToggling) return;
    setIsToggling(true);

    const newValue = !showOnLeaderboard;
    // Optimistic update
    setShowOnLeaderboard(newValue);

    try {
      const result = await toggleLeaderboardVisibility(newValue);
      setShowOnLeaderboard(result.showOnLeaderboard);
    } catch {
      // Revert on failure
      setShowOnLeaderboard(!newValue);
    } finally {
      setIsToggling(false);
    }
  }, [showOnLeaderboard, isToggling]);

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h3 className="border-b border-theme-border px-4 py-3 text-sm font-semibold text-theme-primary">
        الإعدادات
      </h3>

      {/* Theme toggle */}
      <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />

      {/* Leaderboard visibility — only for signed-in users */}
      {user && (
        <LeaderboardVisibilityToggle
          isVisible={showOnLeaderboard}
          isToggling={isToggling}
          onToggle={handleToggleLeaderboard}
        />
      )}

      {/* Install app — only visible when not already installed */}
      {!isInstalled && <InstallAppButton onInstall={handleInstall} />}
    </motion.div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────

function ThemeToggleButton({
  theme,
  onToggle,
}: {
  theme: string;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-theme-subtle"
    >
      <div className="flex items-center gap-3">
        {theme === "dark" ? (
          <MoonIcon className="h-5 w-5 text-amber-400" />
        ) : (
          <Sun className="h-5 w-5 text-amber-500" />
        )}
        <span className="text-sm text-theme-primary">المظهر</span>
      </div>
      <span className="rounded-full bg-theme-subtle px-3 py-1 text-xs font-medium text-theme-secondary">
        {theme === "dark" ? "داكن" : "فاتح"}
      </span>
    </button>
  );
}

function LeaderboardVisibilityToggle({
  isVisible,
  isToggling,
  onToggle,
}: {
  isVisible: boolean;
  isToggling: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isToggling}
      className="flex w-full items-center justify-between border-t border-theme-border px-4 py-3.5 transition-colors hover:bg-theme-subtle disabled:opacity-70"
    >
      <div className="flex items-center gap-3">
        <Trophy className="h-5 w-5 text-amber-400" />
        <span className="text-sm text-theme-primary">الظهور في لوحة المتصدرين</span>
      </div>
      {/* Toggle switch */}
      <div
        className={`relative h-6 w-11 rounded-full transition-colors ${
          isVisible ? "bg-amber-400" : "bg-theme-subtle"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            isVisible ? "right-0.5" : "right-[22px]"
          }`}
        />
      </div>
    </button>
  );
}

function InstallAppButton({ onInstall }: { onInstall: () => void }) {
  return (
    <button
      onClick={onInstall}
      className="flex w-full items-center justify-between border-t border-theme-border px-4 py-3.5 transition-colors hover:bg-theme-subtle"
    >
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 text-amber-400" />
        <span className="text-sm text-theme-primary">تثبيت التطبيق</span>
      </div>
      <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-500">
        تثبيت
      </span>
    </button>
  );
}
