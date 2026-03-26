"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";

interface PublishTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
}

export default function PublishTemplateModal({
  isOpen,
  onClose,
  onSubmit,
}: PublishTemplateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), description.trim());
      setName("");
      setDescription("");
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-10 w-full max-w-sm rounded-2xl border border-theme-border bg-theme-card p-5 shadow-2xl"
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-theme-primary">
                نشر قالب جديد
              </h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
              >
                <X className="h-4 w-4 text-theme-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  اسم القالب
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عادات رمضان المكثفة"
                  autoFocus
                  className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  وصف القالب (اختياري)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="صف محتوى هذا القالب..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                />
              </div>

              <p className="text-[11px] text-theme-secondary/70">
                سيتم نشر جميع أقسامك وعاداتك الحالية كقالب يمكن للآخرين استخدامه.
              </p>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={!name.trim() || isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                {isSubmitting ? "جاري النشر..." : "نشر القالب"}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
