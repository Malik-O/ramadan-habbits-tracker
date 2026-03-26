"use client";

import { motion } from "framer-motion";
import type { TemplateCategory } from "@/services/api";
import { getIconComponent } from "@/utils/iconMap";

// ─── Props ───────────────────────────────────────────────────────

interface TemplateCardDetailsProps {
  categories: TemplateCategory[];
}

// ─── Component ───────────────────────────────────────────────────

export default function TemplateCardDetails({
  categories,
}: TemplateCardDetailsProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="border-t border-theme-border"
    >
      {categories.map((cat) => {
        const Icon = getIconComponent(cat.icon);
        return (
          <div
            key={cat.categoryId}
            className="border-b border-theme-border/50 px-4 py-2 last:border-0"
          >
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10">
                <Icon className="h-3 w-3 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-theme-primary">
                {cat.name}
              </span>
              <span className="text-[10px] text-theme-secondary">
                ({cat.items.length})
              </span>
            </div>
            <ul className="mr-7 space-y-0.5">
              {cat.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 text-[11px] text-theme-secondary"
                >
                  <span className="h-1 w-1 rounded-full bg-theme-secondary/40" />
                  <span className="flex-1">{item.label}</span>
                  <span
                    className={`rounded px-1.5 py-px text-[9px] font-medium ${
                      item.type === "number"
                        ? "bg-sky-500/10 text-sky-400"
                        : "bg-emerald-500/10 text-emerald-400"
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
    </motion.div>
  );
}
