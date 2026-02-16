"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative z-10 w-full max-w-[320px] overflow-hidden rounded-2xl border border-theme-border bg-theme-card shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Content */}
            <div className="flex flex-col items-center px-6 pt-6 pb-5">
              <div
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                  isDanger ? "bg-red-500/10" : "bg-amber-500/10"
                }`}
              >
                <AlertTriangle
                  className={`h-6 w-6 ${
                    isDanger ? "text-red-400" : "text-amber-400"
                  }`}
                />
              </div>
              <h3 className="mb-1 text-base font-semibold text-theme-primary">
                {title}
              </h3>
              <p className="text-center text-sm leading-relaxed text-theme-secondary">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex border-t border-theme-border">
              <button
                onClick={onCancel}
                className="flex-1 border-l border-theme-border py-3 text-sm font-medium text-theme-secondary transition-colors hover:bg-theme-subtle"
              >
                {cancelLabel}
              </button>
              <motion.button
                onClick={onConfirm}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  isDanger
                    ? "text-red-400 hover:bg-red-500/5"
                    : "text-amber-400 hover:bg-amber-500/5"
                }`}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
