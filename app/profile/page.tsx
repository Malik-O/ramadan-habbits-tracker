"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Moon as MoonIcon,
  Sun,
  RotateCcw,
  Heart,
  Github,
  Info,
  Download,
} from "lucide-react";
import Link from "next/link";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useTheme } from "@/hooks/useTheme";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RAMADAN_YEAR } from "@/constants/habits";
import ConfirmDialog from "@/components/ConfirmDialog";
import SignInSection from "@/components/SignInSection";
import { trackDataReset } from "@/utils/analytics";

export default function ProfilePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg">
      {/* Header */}
      <ProfileHeader />

      <div className="flex flex-col gap-6 p-4">
        {/* App info card */}
        <AppInfoCard />

        {/* Sign in / Sign up */}
        <SignInSection />

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
          <MoonIcon className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-theme-primary">
            همة
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
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();

  const handleInstall = async () => {
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

function DangerSection() {
  const [, setTracker] = useLocalStorage("hemma-tracker", {});
  const [, setDay] = useLocalStorage("hemma-current-day", 0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleReset = () => {
    trackDataReset();
    setTracker({});
    setDay(0);
    setIsConfirmOpen(false);
    window.location.reload();
  };

  return (
    <>
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
          onClick={() => setIsConfirmOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-red-400 transition-colors hover:bg-red-500/5"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="text-sm">إعادة تعيين جميع البيانات</span>
        </button>
      </motion.div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="حذف جميع البيانات"
        message="هل أنت متأكد؟ سيتم حذف جميع بياناتك بشكل نهائي."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
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
