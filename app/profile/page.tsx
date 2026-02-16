"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Moon,
  Sun,
  RotateCcw,
  Heart,
  Github,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RAMADAN_YEAR } from "@/constants/habits";

export default function ProfilePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg">
      {/* Header */}
      <ProfileHeader />

      <div className="flex flex-col gap-6 p-4">
        {/* App info card */}
        <AppInfoCard />

        {/* Settings */}
        <SettingsSection theme={theme} onToggleTheme={toggleTheme} />

        {/* Danger zone */}
        <DangerSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

function ProfileHeader() {
  return (
    <header className="border-b border-theme-border bg-theme-header px-4 py-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
        >
          <ArrowRight className="h-4 w-4 text-theme-secondary" />
        </Link>
        <h1 className="text-lg font-bold text-theme-primary">الإعدادات</h1>
      </div>
    </header>
  );
}

function AppInfoCard() {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
          <span className="text-2xl">🌙</span>
        </div>
        <div>
          <h2 className="text-base font-bold text-theme-primary">
            متابع رمضان
          </h2>
          <p className="text-xs text-theme-secondary">{RAMADAN_YEAR}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-theme-secondary">
        تطبيق متابعة العبادات والأذكار في شهر رمضان المبارك. تتبّع عباداتك
        اليومية واكسب نقاط الخبرة!
      </p>
    </motion.div>
  );
}

interface SettingsSectionProps {
  theme: string;
  onToggleTheme: () => void;
}

function SettingsSection({ theme, onToggleTheme }: SettingsSectionProps) {
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
            <Moon className="h-5 w-5 text-amber-400" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500" />
          )}
          <span className="text-sm text-theme-primary">المظهر</span>
        </div>
        <span className="rounded-full bg-theme-subtle px-3 py-1 text-xs font-medium text-theme-secondary">
          {theme === "dark" ? "داكن" : "فاتح"}
        </span>
      </button>
    </motion.div>
  );
}

function DangerSection() {
  const [, setTracker] = useLocalStorage("ramadan-tracker", {});
  const [, setDay] = useLocalStorage("ramadan-current-day", 0);

  const handleReset = () => {
    if (window.confirm("هل أنت متأكد؟ سيتم حذف جميع بياناتك.")) {
      setTracker({});
      setDay(0);
      window.location.reload();
    }
  };

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-red-500/20 bg-theme-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3 className="border-b border-red-500/20 px-4 py-3 text-sm font-semibold text-red-400">
        منطقة الخطر
      </h3>
      <button
        onClick={handleReset}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-red-400 transition-colors hover:bg-red-500/5"
      >
        <RotateCcw className="h-5 w-5" />
        <span className="text-sm">إعادة تعيين جميع البيانات</span>
      </button>
    </motion.div>
  );
}

function Footer() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-1 text-xs text-theme-secondary">
        <span>صنع بـ</span>
        <Heart className="h-3 w-3 text-red-400" />
        <span>لشهر رمضان المبارك</span>
      </div>
      <div className="flex items-center gap-3">
        <Info className="h-3.5 w-3.5 text-theme-secondary" />
        <Github className="h-3.5 w-3.5 text-theme-secondary" />
      </div>
    </motion.div>
  );
}
