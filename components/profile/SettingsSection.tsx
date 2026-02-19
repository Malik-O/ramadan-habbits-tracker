"use client";

import { motion } from "framer-motion";
import { Moon as MoonIcon, Sun, Download } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { trackPwaInstallClick } from "@/utils/analytics";

interface SettingsSectionProps {
  theme: string;
  onToggleTheme: () => void;
}

export default function SettingsSection({ theme, onToggleTheme }: SettingsSectionProps) {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();

  const handleInstall = async () => {
    trackPwaInstallClick("profile");
    if (isInstallable) {
      await promptInstall();
    }
  };

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
      <button
        onClick={onToggleTheme}
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

      {/* Install app — only visible when not already installed */}
      {!isInstalled && (
        <button
          onClick={handleInstall}
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
      )}
    </motion.div>
  );
}
