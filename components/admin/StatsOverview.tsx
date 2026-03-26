"use client";

import { motion } from "framer-motion";
import { Users, FileText, FolderOpen, TrendingUp, UserPlus, Layers } from "lucide-react";
import type { AdminDashboardStats } from "@/services/adminApi";

// ─── Types ───────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  accentColor: string;
  delay?: number;
}

interface StatsOverviewProps {
  stats: AdminDashboardStats;
}

// ─── StatCard ────────────────────────────────────────────────────

function StatCard({ icon, label, value, subtitle, accentColor, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-theme-card border border-theme-border p-5"
    >
      {/* Accent glow */}
      <div
        className="absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-15 blur-2xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-theme-secondary">{label}</span>
          <span className="text-2xl font-bold text-theme-primary">{value}</span>
          {subtitle && (
            <span className="text-[11px] text-theme-secondary">{subtitle}</span>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── StatsOverview ───────────────────────────────────────────────

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const googleUsers = stats.users.byProvider?.google ?? 0;
  const localUsers = stats.users.byProvider?.local ?? 0;

  const cards: StatCardProps[] = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "إجمالي المستخدمين",
      value: stats.users.total.toLocaleString(),
      subtitle: `Google: ${googleUsers} · Local: ${localUsers}`,
      accentColor: "#3b82f6",
    },
    {
      icon: <UserPlus className="h-5 w-5" />,
      label: "مستخدمون جدد (7 أيام)",
      value: stats.users.newThisWeek,
      accentColor: "#10b981",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "القوالب",
      value: stats.templates.total,
      accentColor: "#f59e0b",
    },
    {
      icon: <FolderOpen className="h-5 w-5" />,
      label: "المجموعات",
      value: stats.groups.total,
      subtitle: `${stats.groups.totalMembers} عضو · معدل ${stats.groups.avgSize}`,
      accentColor: "#8b5cf6",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "إجمالي الإدخالات",
      value: stats.habits.totalEntries.toLocaleString(),
      accentColor: "#ef4444",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: "الأقسام المحفوظة",
      value: stats.habits.totalCategories.toLocaleString(),
      accentColor: "#06b6d4",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card, index) => (
        <StatCard key={card.label} {...card} delay={index * 0.06} />
      ))}
    </div>
  );
}
