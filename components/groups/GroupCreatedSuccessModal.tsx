"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Link, Check } from "lucide-react";
import confetti from "canvas-confetti";

// ─── Types ───────────────────────────────────────────────────────

interface GroupCreatedSuccessModalProps {
  isOpen: boolean;
  groupName: string;
  inviteCode: string;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function GroupCreatedSuccessModal({
  isOpen,
  groupName,
  inviteCode,
  onClose,
}: GroupCreatedSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const firePartyConfetti = useCallback(() => {
    const colors = ["#f59e0b", "#10b981", "#f97316", "#eab308", "#a855f7"];
    const defaults = { spread: 360, ticks: 80, gravity: 0.7, decay: 0.92, startVelocity: 25, colors };

    confetti({ ...defaults, particleCount: 50, scalar: 1.2, shapes: ["star"], origin: { x: 0.5, y: 0.35 } });

    setTimeout(() => {
      confetti({ ...defaults, particleCount: 25, scalar: 0.9, shapes: ["circle"], origin: { x: 0.3, y: 0.5 } });
      confetti({ ...defaults, particleCount: 25, scalar: 0.9, shapes: ["circle"], origin: { x: 0.7, y: 0.5 } });
    }, 200);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(firePartyConfetti, 150);
    return () => clearTimeout(timer);
  }, [isOpen, firePartyConfetti]);

  // Reset copied state when modal opens
  useEffect(() => {
    if (isOpen) setCopied(false);
  }, [isOpen]);

  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/groups/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [inviteCode]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
         >
           {/* Backdrop */}
           <motion.div
             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
             onClick={onClose}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
           />
 
           {/* Card */}
           <motion.div
             className="relative z-10 w-full max-w-md rounded-t-3xl bg-theme-card p-6 shadow-2xl sm:rounded-3xl"
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 100, opacity: 0 }}
             transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
           >
             <div className="flex flex-col items-center pt-2">
              {/* Icon */}
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/25"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.4, delay: 0.1 }}
              >
                <PartyPopper className="h-7 w-7 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                className="mt-4 text-lg font-bold text-theme-primary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                تم إنشاء المجموعة! 🎉
              </motion.h2>

              {/* Group name */}
              <motion.p
                className="mt-1.5 text-sm font-semibold text-amber-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                dir="rtl"
              >
                {groupName}
              </motion.p>

              {/* Copy invite link button */}
              <motion.button
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-theme-border bg-theme-subtle py-3 text-sm font-semibold text-theme-primary transition-colors hover:bg-theme-border"
                onClick={handleCopyLink}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileTap={{ scale: 0.97 }}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">تم نسخ الرابط</span>
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4" />
                    <span>نسخ رابط الدعوة</span>
                  </>
                )}
              </motion.button>

              {/* Continue button */}
              <motion.button
                className="mt-3 w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600"
                onClick={onClose}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.97 }}
              >
                متابعة
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
