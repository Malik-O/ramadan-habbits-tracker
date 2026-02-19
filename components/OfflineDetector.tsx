"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";

/**
 * Client-side offline detector overlay.
 * Shows a full-screen offline UI when the browser loses connection,
 * acting as a safety net on top of the service worker fallback.
 */
export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    // Check initial state
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-theme-bg/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center px-6 text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
              <WifiOff className="h-10 w-10 text-amber-400" />
            </div>

            <h1 className="mb-3 text-2xl font-bold text-theme-primary">
              لا يوجد اتصال بالإنترنت
            </h1>

            <p className="mb-8 max-w-xs text-sm leading-relaxed text-theme-secondary">
              يبدو أنك غير متصل بالإنترنت. لا تقلق — بياناتك المحفوظة ستكون
              متاحة عند عودة الاتصال.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-amber-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
            >
              إعادة المحاولة
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
