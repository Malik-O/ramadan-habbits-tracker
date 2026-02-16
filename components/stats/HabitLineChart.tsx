"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getIconComponent } from "@/utils/iconMap";
import type { HabitCategory } from "@/constants/habits";
import type { TrackerState } from "@/hooks/useHabitTracker";
import { isHabitCompleted } from "@/hooks/useHabitTracker";
import { TOTAL_DAYS } from "@/constants/habits";

/** Color palette — one per habit, rotating */
const LINE_COLORS = [
  "#fbbf24", "#34d399", "#38bdf8", "#f472b6",
  "#a78bfa", "#fb923c", "#22d3ee", "#f87171",
  "#4ade80", "#e879f9", "#facc15", "#818cf8",
];

interface HabitOption {
  id: string;
  label: string;
  categoryId: string;
  color: string;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  habits: HabitOption[];
}

interface HabitLineChartProps {
  categories: HabitCategory[];
  trackerState: TrackerState;
}

export default function HabitLineChart({
  categories,
  trackerState,
}: HabitLineChartProps) {
  /** Build grouped list of habits by category */
  const categoryGroups: CategoryGroup[] = useMemo(() => {
    let colorIdx = 0;
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      habits: cat.items.map((item) => {
        const opt: HabitOption = {
          id: item.id,
          label: item.label,
          categoryId: cat.id,
          color: LINE_COLORS[colorIdx % LINE_COLORS.length],
        };
        colorIdx++;
        return opt;
      }),
    }));
  }, [categories]);

  /** Flat list for easy lookup */
  const allHabits = useMemo(
    () => categoryGroups.flatMap((g) => g.habits),
    [categoryGroups]
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (allHabits.length > 0) return new Set([allHabits[0].id]);
    return new Set();
  });

  const toggleHabit = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (group: CategoryGroup) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = group.habits.every((h) => next.has(h.id));
      for (const h of group.habits) {
        if (allSelected) next.delete(h.id);
        else next.add(h.id);
      }
      return next;
    });
  };

  /** Compute cumulative data for selected habits */
  const chartData = useMemo(() => {
    const selected = allHabits.filter((h) => selectedIds.has(h.id));
    return selected.map((habit) => {
      let cumulative = 0;
      const points = Array.from({ length: TOTAL_DAYS }, (_, d) => {
        const record = trackerState[d];
        if (record && isHabitCompleted(record[habit.id])) cumulative++;
        return cumulative;
      });
      return { ...habit, points };
    });
  }, [allHabits, selectedIds, trackerState]);

  const maxValue = useMemo(
    () => Math.max(1, ...chartData.flatMap((d) => d.points)),
    [chartData]
  );

  return (
    <div className="rounded-2xl border border-theme-border bg-theme-card">
      <h3 className="border-b border-theme-border px-4 py-3 text-sm font-semibold text-theme-primary">
        مخطط التقدم
      </h3>

      {/* SVG chart */}
      <div className="px-4 pt-4">
        <ChartArea chartData={chartData} maxValue={maxValue} />
      </div>

      {/* Habit toggles grouped by category */}
      <div className="p-4">
        <p className="mb-3 text-[11px] font-medium text-theme-secondary">
          اختر العادات لعرضها
        </p>
        <div className="flex flex-col gap-3">
          {categoryGroups.map((group) => (
            <CategoryChipGroup
              key={group.id}
              group={group}
              selectedIds={selectedIds}
              onToggleHabit={toggleHabit}
              onToggleCategory={() => toggleCategory(group)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Category Chip Group ─── */

interface CategoryChipGroupProps {
  group: CategoryGroup;
  selectedIds: Set<string>;
  onToggleHabit: (id: string) => void;
  onToggleCategory: () => void;
}

function CategoryChipGroup({
  group,
  selectedIds,
  onToggleHabit,
  onToggleCategory,
}: CategoryChipGroupProps) {
  const Icon = getIconComponent(group.icon);
  const allSelected = group.habits.every((h) => selectedIds.has(h.id));

  return (
    <div>
      {/* Category header chip */}
      <button
        onClick={onToggleCategory}
        className={`mb-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
          allSelected
            ? "text-amber-400"
            : "text-theme-secondary hover:text-theme-primary"
        }`}
      >
        <Icon className="h-3 w-3" />
        {group.name}
      </button>

      {/* Habit chips */}
      <div className="flex flex-wrap gap-1.5 pr-3">
        {group.habits.map((habit) => {
          const isActive = selectedIds.has(habit.id);
          return (
            <motion.button
              key={habit.id}
              onClick={() => onToggleHabit(habit.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                isActive
                  ? "bg-theme-card-hover text-theme-primary"
                  : "bg-theme-subtle text-theme-secondary hover:bg-theme-card-hover"
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full transition-opacity"
                style={{
                  backgroundColor: habit.color,
                  opacity: isActive ? 1 : 0.25,
                }}
              />
              {habit.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Chart Area (SVG) ─── */

const CHART_W = 300;
const CHART_H = 140;
const PAD_L = 24;
const PAD_R = 8;
const PAD_T = 10;
const PAD_B = 20;
const INNER_W = CHART_W - PAD_L - PAD_R;
const INNER_H = CHART_H - PAD_T - PAD_B;

/** Day labels to show on x-axis */
const X_LABELS = [1, 5, 10, 15, 20, 25, 30];

interface ChartAreaProps {
  chartData: { id: string; color: string; label: string; points: number[] }[];
  maxValue: number;
}

function ChartArea({ chartData, maxValue }: ChartAreaProps) {
  const xScale = (d: number) => PAD_L + (d / (TOTAL_DAYS - 1)) * INNER_W;
  const yScale = (v: number) => PAD_T + INNER_H - (v / maxValue) * INNER_H;

  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Horizontal grid lines */}
      {gridSteps.map((pct, i) => {
        const y = yScale(pct * maxValue);
        const label = Math.round(pct * maxValue);
        return (
          <g key={i}>
            <line
              x1={PAD_L}
              y1={y}
              x2={CHART_W - PAD_R}
              y2={y}
              className="stroke-theme-secondary"
              strokeOpacity={0.12}
              strokeWidth={0.5}
              strokeDasharray="3 3"
            />
            <text
              x={PAD_L - 4}
              y={y + 3}
              textAnchor="end"
              className="fill-theme-secondary"
              fontSize={7}
              opacity={0.5}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Vertical grid lines + X-axis day labels */}
      {X_LABELS.map((day) => {
        const x = xScale(day - 1);
        return (
          <g key={day}>
            <line
              x1={x}
              y1={PAD_T}
              x2={x}
              y2={PAD_T + INNER_H}
              className="stroke-theme-secondary"
              strokeOpacity={0.06}
              strokeWidth={0.5}
            />
            <text
              x={x}
              y={CHART_H - 6}
              textAnchor="middle"
              className="fill-theme-secondary"
              fontSize={7}
              opacity={0.5}
            >
              {day}
            </text>
          </g>
        );
      })}

      {/* Lines */}
      <AnimatePresence>
        {chartData.map((series) => {
          const pathD = series.points
            .map((val, i) => {
              const x = xScale(i);
              const y = yScale(val);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");

          return (
            <motion.path
              key={series.id}
              d={pathD}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>

      {/* Dots at latest active day */}
      {chartData.map((series) => {
        const lastIdx = series.points.reduce(
          (acc, val, i) => (val > 0 ? i : acc),
          0
        );
        const cx = xScale(lastIdx);
        const cy = yScale(series.points[lastIdx]);
        return (
          <motion.circle
            key={`dot-${series.id}`}
            cx={cx}
            cy={cy}
            r={3}
            fill={series.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
          />
        );
      })}
    </svg>
  );
}
