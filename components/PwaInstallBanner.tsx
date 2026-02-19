"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaInstall } from "@/hooks/usePwaInstall";

/**
 * Floating PWA install banner that slides up from the bottom.
 * - Shows on all platforms when the app is not installed as a standalone PWA.
 * - On Chrome/Edge: uses the native `beforeinstallprompt` to install.
 * - On iOS Safari: shows manual "Add to Home Screen" instructions.
 * - Dismissal is stored in localStorage so it doesn't nag.
 */

const DISMISS_KEY = "hemma-pwa-dismissed";
const SHOW_DELAY_MS = 2000;

export default function PwaInstallBanner() {
  const { isInstallable, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [visible, setVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Hide if already installed as standalone
    if (isInstalled) return;

    const wasDismissed = localStorage.getItem(DISMISS_KEY) === "true";
    if (wasDismissed) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleInstall = async () => {
    if (isInstallable) {
      // Chrome/Edge — native prompt
      await promptInstall();
      setVisible(false);
    } else if (isIos) {
      // iOS — show manual instructions
      setShowIosGuide(true);
    } else {
      // Fallback — try opening the manifest or just hide
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setShowIosGuide(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="pwa-install-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-20 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-theme-card shadow-lg shadow-amber-400/10">
            {/* Glow accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <div className="flex items-center gap-3 px-4 py-3">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15">
                <Download className="h-5 w-5 text-amber-400" />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-theme-primary">
                  ثبّت التطبيق
                </p>
                <p className="text-xs text-theme-secondary">
                  أضف همّة إلى شاشتك الرئيسية للوصول السريع
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  id="pwa-install-btn"
                  onClick={handleInstall}
                  className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition-transform active:scale-95"
                >
                  تثبيت
                </button>

                <button
                  id="pwa-dismiss-btn"
                  onClick={handleDismiss}
                  aria-label="إغلاق"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-theme-secondary transition-colors hover:bg-theme-subtle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* iOS manual instructions */}
            <AnimatePresence>
              {showIosGuide && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-theme-border"
                >
                  <div className="flex items-start gap-2 px-4 py-3">
                    <Share className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <p className="text-xs leading-relaxed text-theme-secondary">
                      اضغط على زر{" "}
                      <span className="font-semibold text-theme-primary">
                        المشاركة
                      </span>{" "}
                      في المتصفح، ثم اختر{" "}
                      <span className="font-semibold text-theme-primary">
                        إضافة إلى الشاشة الرئيسية
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
