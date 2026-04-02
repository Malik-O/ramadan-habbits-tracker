"use client";

import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SignInSection from "@/components/SignInSection";

// ─── Props ───────────────────────────────────────────────────────

interface LoginStepProps {
  onContinue: () => void;
  onSkip: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function LoginStep({ onContinue, onSkip }: LoginStepProps) {
  const { user } = useAuth();

  // Auto-advance once user is signed in
  if (user) {
    // Small delay so user sees the success state briefly
    setTimeout(onContinue, 600);
  }

  return (
    <motion.div
      key="login"
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
          <LogIn className="h-5 w-5 text-amber-500" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 text-xl font-bold text-theme-primary"
        >
          سجّل دخولك
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-1.5 text-sm leading-relaxed text-theme-secondary"
        >
          سجّل دخولك لحفظ تقدمك ومزامنته عبر أجهزتك، أو تخطَّ هذه الخطوة
          وسجّل لاحقًا
        </motion.p>
      </div>

      {/* Sign In Card */}
      <div className="flex-1 px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SignInSection />
        </motion.div>
      </div>

      {/* CTA — Skip */}
      <div className="sticky bottom-0 bg-theme-bg px-6 pb-8 pt-4">
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onSkip}
          className="w-full cursor-pointer rounded-2xl border border-theme-border bg-theme-card py-3.5 text-sm font-bold text-theme-primary transition-all hover:bg-theme-card-hover active:scale-[0.98]"
        >
          تخطّي — سجّل لاحقًا
        </motion.button>
      </div>
    </motion.div>
  );
}
