"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, CheckCircle } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import IosInstallGuide from "@/components/IosInstallGuide";

// ─── Props ───────────────────────────────────────────────────────

interface InstallStepProps {
  onContinue: () => void;
  onSkip: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function InstallStep({ onContinue, onSkip }: InstallStepProps) {
  const { isInstallable, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    if (isInstallable) {
      setInstalling(true);
      const accepted = await promptInstall();
      setInstalling(false);
      if (accepted) {
        // Auto-advance after a brief celebration delay
        setTimeout(onContinue, 800);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  // If already installed, auto-advance
  if (isInstalled) {
    return (
      <motion.div
        key="install"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.35 }}
        className="flex min-h-dvh flex-col items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-theme-primary">
            التطبيق مثبّت بالفعل
          </h2>
          <p className="text-center text-sm text-theme-secondary">
            رائع! التطبيق مثبّت على جهازك
          </p>
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onContinue}
            className="mt-4 w-full max-w-xs cursor-pointer rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-[0.98]"
          >
            متابعة
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        key="install"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.35 }}
        className="flex min-h-dvh flex-col"
      >
        {/* Header */}
        <div className="px-6 pt-10 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10"
          >
            <Download className="h-5 w-5 text-amber-500" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-xl font-bold text-theme-primary"
          >
            ثبّت التطبيق
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-1.5 text-sm leading-relaxed text-theme-secondary"
          >
            أضف همّة إلى شاشتك الرئيسية للوصول السريع وتجربة أفضل
          </motion.p>
        </div>

        {/* Benefits */}
        <div className="flex-1 px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card"
          >
            <div className="flex flex-col divide-y divide-theme-border">
              <BenefitRow
                icon={<Smartphone className="h-4.5 w-4.5 text-amber-500" />}
                title="تجربة كالتطبيقات الأصلية"
                description="افتح التطبيق مباشرة من شاشتك الرئيسية بدون متصفح"
              />
              <BenefitRow
                icon={<Download className="h-4.5 w-4.5 text-emerald-500" />}
                title="يعمل بدون إنترنت"
                description="تابع عباداتك حتى بدون اتصال بالإنترنت"
              />
              <BenefitRow
                icon={<CheckCircle className="h-4.5 w-4.5 text-sky-500" />}
                title="إشعارات وتذكيرات"
                description="لا تفوّت أي عبادة مع التذكيرات الذكية"
              />
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="sticky bottom-0 flex flex-col gap-2 bg-theme-bg px-6 pb-8 pt-4">
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={handleInstall}
            disabled={installing}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-[0.98] disabled:opacity-60"
          >
            {installing ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Download className="h-4 w-4" />
                تثبيت التطبيق
              </>
            )}
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onSkip}
            className="w-full cursor-pointer rounded-2xl py-2.5 text-xs font-medium text-theme-secondary transition-colors hover:text-theme-primary"
          >
            تخطّي — سأثبّته لاحقًا
          </motion.button>
        </div>
      </motion.div>

      {/* iOS Install Guide */}
      <IosInstallGuide
        isOpen={showIosGuide}
        onClose={() => setShowIosGuide(false)}
      />
    </>
  );
}

// ─── Benefit Row ─────────────────────────────────────────────────

interface BenefitRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitRow({ icon, title, description }: BenefitRowProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-theme-subtle">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-theme-primary">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-theme-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
