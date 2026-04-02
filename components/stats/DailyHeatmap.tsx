"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RAMADAN_START_DATE } from "@/constants/habits";
import { getMonthCells, addMonths, formatMonthLabel } from "@/utils/calendar";

// ─── Types ───────────────────────────────────────────────────────

interface DayCompletion {
  day: number;   // 0-indexed tracker day
  value: number; // 0–1 completion ratio
}

interface DailyHeatmapProps {
  dailyCompletions: DayCompletion[];
}

// ─── Utils ───────────────────────────────────────────────────────

function getDayDate(dayIndex: number): Date {
  const d = new Date(RAMADAN_START_DATE);
  d.setDate(d.getDate() + dayIndex);
  d.setHours(12, 0, 0, 0);
  return d;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getHeatColor(value: number): string {
  if (value <= 0) return "bg-theme-subtle";
  if (value < 0.25) return "bg-emerald-500/20";
  if (value < 0.5) return "bg-emerald-500/40";
  if (value < 0.75) return "bg-emerald-500/60";
  if (value < 1) return "bg-emerald-500/80";
  return "bg-emerald-500";
}

// ─── Component ───────────────────────────────────────────────────

export default function DailyHeatmap({ dailyCompletions }: DailyHeatmapProps) {
  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [isHijri, setIsHijri] = useState(false);

  // Build a date-string → completion-value lookup
  const completionMap = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const { day, value } of dailyCompletions) {
      map.set(toDateKey(getDayDate(day)), value);
    }
    return map;
  }, [dailyCompletions]);

  // Get month cells using shared calendar utils (Hijri-aware)
  const cells = useMemo(() => {
    const baseCells = getMonthCells(viewDate, isHijri);
    return baseCells.map((c) => {
      const key = toDateKey(c.date);
      const value = completionMap.has(key) ? (completionMap.get(key) as number) : -1;
      return { ...c, value };
    });
  }, [viewDate, isHijri, completionMap]);

  const activeDaysThisMonth = cells.filter((c) => c.value > 0).length;

  const prevMonth = () => setViewDate((d) => addMonths(d, -1, isHijri));
  const nextMonth = () => setViewDate((d) => addMonths(d, 1, isHijri));

  return (
    <div className="rounded-2xl border border-theme-border bg-theme-card p-4">
      {/* ── Header ── */}
      <div className="mb-3 flex items-center gap-2">
        <h3 className="flex-1 text-sm font-semibold text-theme-primary">
          خريطة الأيام
        </h3>

        {/* Hijri / Gregorian toggle */}
        <button
          onClick={() => setIsHijri((h) => !h)}
          className={`cursor-pointer rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
            isHijri
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
              : "bg-theme-subtle text-theme-secondary hover:bg-theme-border"
          }`}
        >
          {isHijri ? "هجري" : "ميلادي"}
        </button>

        {/* Month navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            aria-label="الشهر السابق"
            className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-lg bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <span className="min-w-[88px] text-center text-[10px] font-medium text-theme-secondary">
            {formatMonthLabel(viewDate, isHijri)}
          </span>

          <button
            onClick={nextMonth}
            aria-label="الشهر التالي"
            className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-lg bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Active-days pill */}
      {activeDaysThisMonth > 0 && (
        <p className="mb-2.5 text-[10px] text-emerald-500 font-medium">
          ✦ {activeDaysThisMonth} يوم نشط هذا الشهر
        </p>
      )}

      {/* ── Day Grid ── */}
      <div className="grid grid-cols-10 gap-1.5" dir="ltr">
        {cells.map(({ date, value, dayNum }, i) => (
          <motion.div
            key={toDateKey(date)}
            className={`relative flex aspect-square items-center justify-center rounded-lg transition-colors ${
              value === -1 ? "bg-neutral-200/80 dark:bg-neutral-800/10" : getHeatColor(value)
            }`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.012, duration: 0.18 }}
            title={
              value >= 0
                ? `${dayNum}: ${Math.round(value * 100)}%`
                : "لا توجد بيانات"
            }
          >
            <span className={`text-[9px] font-medium ${
              value === -1 ? "text-neutral-500 dark:text-neutral-400" : "text-theme-secondary"
            }`}>
              {dayNum}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <span className="text-[10px] text-theme-secondary">أقل</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div key={i} className={`h-3 w-3 rounded ${getHeatColor(v)}`} />
        ))}
        <span className="text-[10px] text-theme-secondary">أكثر</span>
      </div>
    </div>
  );
}
