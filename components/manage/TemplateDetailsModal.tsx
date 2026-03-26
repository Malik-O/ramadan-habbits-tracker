"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Layers } from "lucide-react";
import type { TemplateCategory } from "@/services/api";
import { getIconComponent } from "@/utils/iconMap";

// ─── Props ───────────────────────────────────────────────────────

interface TemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  categories: TemplateCategory[];
}

// ─── Component ───────────────────────────────────────────────────

export default function TemplateDetailsModal({
  isOpen,
  onClose,
  templateName,
  categories,
}: TemplateDetailsModalProps) {
  const totalHabits = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:pt-12"
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

          {/* Modal / Bottom Sheet */}
          <motion.div
            className="relative z-10 w-full max-h-[85vh] sm:max-h-[80vh] flex flex-col sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-theme-border bg-theme-card shadow-2xl overflow-hidden"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-theme-border p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-theme-primary truncate pl-2">
                  تفاصيل: {templateName}
                </h3>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
                >
                  <X className="h-4 w-4 text-theme-secondary" />
                </button>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-theme-secondary">
                <Layers className="h-3.5 w-3.5" />
                {categories.length} قسم · {totalHabits} عبادة
              </p>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 overscroll-contain">
              <div className="flex flex-col gap-3">
                {categories.map((cat) => {
                  const Icon = getIconComponent(cat.icon);
                  return (
                    <div
                      key={cat.categoryId}
                      className="rounded-2xl border border-theme-border bg-theme-subtle/50 p-4"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                          <Icon className="h-4 w-4 text-amber-500" />
                        </div>
                        <span className="text-sm font-semibold text-theme-primary">
                          {cat.name}
                        </span>
                        <span className="mr-auto rounded-full bg-theme-border px-2 py-0.5 text-[10px] font-medium text-theme-secondary">
                          {cat.items.length}
                        </span>
                      </div>
                      
                      <ul className="space-y-2">
                        {cat.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center gap-3 rounded-xl bg-theme-card px-3 py-2 text-sm text-theme-secondary shadow-sm ring-1 ring-theme-border/50"
                          >
                            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500/60" />
                            <span className="flex-1">{item.label}</span>
                            <span
                              className={`rounded-lg px-2 py-1 text-[10px] font-medium ${
                                item.type === "number"
                                  ? "bg-sky-500/10 text-sky-500"
                                  : "bg-emerald-500/10 text-emerald-500"
                              }`}
                            >
                              {item.type === "number" ? "رقم" : "تحقق"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Sticky Bottom padding for mobile */}
            <div className="sm:hidden pb-6" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
