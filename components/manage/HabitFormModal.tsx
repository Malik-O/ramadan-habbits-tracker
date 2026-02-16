"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Hash } from "lucide-react";
import type { HabitItem } from "@/constants/habits";

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (label: string, type: "boolean" | "number") => void;
  initialValues: HabitItem | null;
}

export default function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: HabitFormModalProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"boolean" | "number">("boolean");

  useEffect(() => {
    if (isOpen) {
      setLabel(initialValues?.label || "");
      setType(initialValues?.type || "boolean");
    }
  }, [isOpen, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSubmit(label.trim(), type);
  };

  const isEditing = !!initialValues;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-12"
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
                {isEditing ? "تعديل العادة" : "إضافة عادة جديدة"}
              </h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
              >
                <X className="h-4 w-4 text-theme-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Label input */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  اسم العادة
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="مثال: أذكار بعد الصلاة"
                  autoFocus
                  className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                />
              </div>

              {/* Type toggle */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  نوع العادة
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <TypeOption
                    selected={type === "boolean"}
                    onSelect={() => setType("boolean")}
                    icon={<CheckCircle2 className={`h-5 w-5 ${type === "boolean" ? "text-emerald-400" : "text-theme-secondary"}`} />}
                    title="تحقق"
                    description="تم أو لم يتم"
                  />
                  <TypeOption
                    selected={type === "number"}
                    onSelect={() => setType("number")}
                    icon={<Hash className={`h-5 w-5 ${type === "number" ? "text-sky-400" : "text-theme-secondary"}`} />}
                    title="رقم"
                    description="عدد مرات"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={!label.trim()}
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

interface TypeOptionProps {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TypeOption({ selected, onSelect, icon, title, description }: TypeOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 transition-all ${
        selected
          ? "border-amber-500/50 bg-amber-500/10"
          : "border-theme-border bg-theme-subtle hover:border-theme-border"
      }`}
    >
      {icon}
      <span className={`text-xs font-semibold ${selected ? "text-amber-400" : "text-theme-primary"}`}>
        {title}
      </span>
      <span className="text-[10px] text-theme-secondary">{description}</span>
    </button>
  );
}
