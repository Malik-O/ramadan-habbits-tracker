"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { HabitCategory } from "@/constants/habits";
import { AVAILABLE_ICONS, getIconComponent } from "@/utils/iconMap";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, icon: string) => void;
  initialValues: HabitCategory | null;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Heart");

  useEffect(() => {
    if (isOpen) {
      setName(initialValues?.name || "");
      setIcon(initialValues?.icon || "Heart");
    }
  }, [isOpen, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), icon);
  };

  const isEditing = !!initialValues;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal — positioned at top for keyboard room */}
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
                {isEditing ? "تعديل القسم" : "إضافة قسم جديد"}
              </h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
              >
                <X className="h-4 w-4 text-theme-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name input */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  اسم القسم
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: صلاة الظهر"
                  autoFocus
                  className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                />
              </div>

              {/* Icon picker */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  الأيقونة
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_ICONS.map(({ value, component: IconComp }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIcon(value)}
                      className={`flex h-10 items-center justify-center rounded-xl transition-all ${
                        icon === value
                          ? "bg-amber-500/20 ring-2 ring-amber-500/50 scale-110"
                          : "bg-theme-subtle hover:bg-theme-border"
                      }`}
                    >
                      <IconComp
                        className={`h-4.5 w-4.5 ${
                          icon === value
                            ? "text-amber-400"
                            : "text-theme-secondary"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={!name.trim()}
                className="w-full rounded-xl bg-amber-500 py-3 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isEditing ? "حفظ التعديل" : "إضافة"}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
