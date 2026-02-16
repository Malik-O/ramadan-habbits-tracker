"use client";

import { motion } from "framer-motion";
import { Sparkles, Flame, CalendarDays, Target } from "lucide-react";

interface OverviewCardsProps {
  totalXp: number;
  streak: number;
  activeDays: number;
  overallRate: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  delay: number;
}

function StatCard({ icon, label, value, accent, delay }: StatCardProps) {
  return (
    <motion.div
      className={`flex flex-col items-center gap-2 rounded-2xl border border-theme-border bg-theme-card p-4`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3, type: "spring", stiffness: 200 }}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
      >
        {icon}
      </div>
      <span className="text-xl font-bold text-theme-primary">{value}</span>
      <span className="text-[11px] text-theme-secondary">{label}</span>
    </motion.div>
  );
}

export default function OverviewCards({
  totalXp,
  streak,
  activeDays,
  overallRate,
}: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<Sparkles className="h-5 w-5 text-amber-400" />}
        label="إجمالي النقاط"
        value={`${totalXp}`}
        accent="bg-amber-500/10"
        delay={0}
      />
      <StatCard
        icon={<Flame className="h-5 w-5 text-orange-400" />}
        label="أيام متتالية"
        value={`${streak}`}
        accent="bg-orange-500/10"
        delay={0.05}
      />
      <StatCard
        icon={<CalendarDays className="h-5 w-5 text-emerald-400" />}
        label="أيام نشطة"
        value={`${activeDays}/30`}
        accent="bg-emerald-500/10"
        delay={0.1}
      />
      <StatCard
        icon={<Target className="h-5 w-5 text-sky-400" />}
        label="نسبة الإنجاز"
        value={`${Math.round(overallRate * 100)}%`}
        accent="bg-sky-500/10"
        delay={0.15}
      />
    </div>
  );
}
