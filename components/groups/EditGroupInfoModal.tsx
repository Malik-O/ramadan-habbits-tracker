"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface EditGroupInfoModalProps {
  isOpen: boolean;
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSave: (data: { name?: string; description?: string }) => Promise<unknown>;
}

// ─── Component ───────────────────────────────────────────────────

export default function EditGroupInfoModal({
  isOpen,
  initialName,
  initialDescription,
  onClose,
  onSave,
}: EditGroupInfoModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = name !== initialName || description !== initialDescription;

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError("اسم المجموعة مطلوب");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSave({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }, [name, description, onSave, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
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

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-theme-card p-6 shadow-2xl sm:rounded-3xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title */}
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Pencil className="h-4 w-4 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-theme-primary">
                تعديل المجموعة
              </h3>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
                  اسم المجموعة
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسم المجموعة"
                  maxLength={50}
                  className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-3 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
                  وصف المجموعة{" "}
                  <span className="text-theme-secondary/50">(اختياري)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف قصير للمجموعة..."
                  maxLength={200}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-theme-border bg-theme-subtle px-4 py-3 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50"
                  dir="rtl"
                />
                <span className="mt-1 block text-left text-[10px] text-theme-secondary/50">
                  {description.length}/200
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 disabled:opacity-50"
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
