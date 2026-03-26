"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { AdminDashboardStats } from "@/services/adminApi";

interface TopTemplatesCardProps {
  topTemplates: AdminDashboardStats["templates"]["topTemplates"];
}

export default function TopTemplatesCard({ topTemplates }: TopTemplatesCardProps) {
  if (!topTemplates.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-2xl border border-theme-border bg-theme-card p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-theme-primary">أكثر القوالب استخداماً</h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {topTemplates.map((template, index) => (
          <div
            key={template._id}
            className="flex items-center gap-3 rounded-xl bg-theme-subtle p-3"
          >
            {/* Rank */}
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                index === 0
                  ? "bg-amber-500/15 text-amber-500"
                  : index === 1
                  ? "bg-slate-400/15 text-slate-400"
                  : index === 2
                  ? "bg-orange-400/15 text-orange-400"
                  : "bg-theme-subtle text-theme-secondary"
              }`}
            >
              {index + 1}
            </span>

            {/* Info */}
            <div className="flex flex-1 flex-col min-w-0">
              <span className="truncate text-sm font-medium text-theme-primary">
                {template.name}
              </span>
              <span className="text-[11px] text-theme-secondary">
                بواسطة {template.authorName}
              </span>
            </div>

            {/* Usage count */}
            <span className="text-sm font-semibold text-amber-500">
              {template.usageCount}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
