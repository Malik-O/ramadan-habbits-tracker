"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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

/** Page header height: py-4 (32px) + h-9 (36px) + border (1px) */
const HEADER_H = 69;

/* ─── Types ─── */

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

/* ─── Main Component ─── */

export default function HabitLineChart({
  categories,
  trackerState,
}: HabitLineChartProps) {
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
      const allOn = group.habits.every((h) => next.has(h.id));
      for (const h of group.habits) {
        if (allOn) next.delete(h.id);
        else next.add(h.id);
      }
      return next;
    });
  };

  /* ── Scroll-driven expansion ── */
  const cardRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const chartH = chartRef.current?.offsetHeight ?? 200;
        const topPast = rect.top <= HEADER_H;
        const enoughRoom = rect.bottom - HEADER_H > chartH + 60;
        setIsExpanded(topPast && enoughRoom);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Trim chart to last tracked day ── */
  const lastTrackedDay = useMemo(() => {
    for (let d = TOTAL_DAYS - 1; d >= 0; d--) {
      const rec = trackerState[d];
      if (rec && Object.values(rec).some(isHabitCompleted)) return d;
    }
    return 0;
  }, [trackerState]);

  const visibleDays = Math.max(7, Math.min(lastTrackedDay + 3, TOTAL_DAYS));

  /* ── Cumulative chart data (trimmed) ── */
  const chartData = useMemo(() => {
    const selected = allHabits.filter((h) => selectedIds.has(h.id));
    return selected.map((habit) => {
      let cum = 0;
      const points = Array.from({ length: visibleDays }, (_, d) => {
        const rec = trackerState[d];
        if (rec && isHabitCompleted(rec[habit.id])) cum++;
        return cum;
      });
      return { ...habit, points };
    });
  }, [allHabits, selectedIds, trackerState, visibleDays]);

  const maxValue = useMemo(
    () => Math.max(1, ...chartData.flatMap((d) => d.points)),
    [chartData]
  );

  return (
    <div
      ref={cardRef}
      className="border border-theme-border bg-theme-card"
      style={{
        marginLeft: isExpanded ? "-1rem" : 0,
        marginRight: isExpanded ? "-1rem" : 0,
        borderRadius: isExpanded ? 0 : "1rem",
        transition:
          "margin 350ms cubic-bezier(.4,0,.2,1), border-radius 350ms cubic-bezier(.4,0,.2,1)",
      }}
    >
      {/* ── Sticky chart header ── */}
      <div
        ref={chartRef}
        className="sticky z-30 border-b border-theme-border bg-theme-card"
        style={{ top: HEADER_H }}
      >
        <ChartHeader selectedCount={selectedIds.size} />
        <div className="px-4 pb-3">
          <ChartArea
            chartData={chartData}
            maxValue={maxValue}
            visibleDays={visibleDays}
          />
        </div>
      </div>

      {/* ── Habit toggles ── */}
      <div className="p-5">
        <p className="mb-4 text-xs font-semibold text-theme-secondary tracking-wide">
          اختر العادات لعرضها
        </p>
        <div className="flex flex-col gap-4">
          {categoryGroups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <CategoryChipGroup
                group={group}
                selectedIds={selectedIds}
                onToggleHabit={toggleHabit}
                onToggleCategory={() => toggleCategory(group)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Chart Header ─── */

function ChartHeader({ selectedCount }: { selectedCount: number }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      <h3 className="text-base font-bold text-theme-primary">مخطط التقدم</h3>
      <motion.span
        key={selectedCount}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-full bg-theme-subtle px-2.5 py-0.5 text-xs font-medium text-theme-secondary"
      >
        {selectedCount} محدد
      </motion.span>
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
      <button
        onClick={onToggleCategory}
        className={`mb-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-bold transition-all duration-200 ${
          allSelected
            ? "text-amber-400"
            : "text-theme-secondary hover:text-theme-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
        {group.name}
      </button>

      <div className="flex flex-wrap gap-2 pr-3">
        {group.habits.map((habit) => {
          const active = selectedIds.has(habit.id);
          return (
            <motion.button
              key={habit.id}
              onClick={() => onToggleHabit(habit.id)}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.03 }}
              layout
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-theme-card-hover text-theme-primary shadow-sm"
                  : "bg-theme-subtle text-theme-secondary hover:bg-theme-card-hover"
              }`}
            >
              <motion.span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: habit.color }}
                animate={{ opacity: active ? 1 : 0.25, scale: active ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
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
const CHART_H = 150;
const PAD = { l: 24, r: 8, t: 12, b: 22 };
const INNER_W = CHART_W - PAD.l - PAD.r;
const INNER_H = CHART_H - PAD.t - PAD.b;
const X_TICKS = [1, 5, 10, 15, 20, 25, 30];

interface ChartAreaProps {
  chartData: { id: string; color: string; label: string; points: number[] }[];
  maxValue: number;
  visibleDays: number;
}

function ChartArea({ chartData, maxValue, visibleDays }: ChartAreaProps) {
  const xScale = (d: number) => PAD.l + (d / (visibleDays - 1)) * INNER_W;
  const yScale = (v: number) => PAD.t + INNER_H - (v / maxValue) * INNER_H;

  const gridSteps = [0, 0.25, 0.5, 0.75, 1];
  const xLabels = X_TICKS.filter((d) => d <= visibleDays);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Gradient defs */}
      <defs>
        {chartData.map((s) => (
          <linearGradient
            key={`g-${s.id}`}
            id={`grad-${s.id}`}
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>

      {/* Horizontal grid */}
      {gridSteps.map((pct, i) => {
        const y = yScale(pct * maxValue);
        return (
          <g key={i}>
            <line
              x1={PAD.l}
              y1={y}
              x2={CHART_W - PAD.r}
              y2={y}
              className="stroke-theme-secondary"
              strokeOpacity={0.1}
              strokeWidth={0.5}
              strokeDasharray="3 3"
            />
            <text
              x={PAD.l - 4}
              y={y + 3}
              textAnchor="end"
              className="fill-theme-secondary"
              fontSize={7}
              opacity={0.45}
            >
              {Math.round(pct * maxValue)}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {xLabels.map((day) => {
        const x = xScale(day - 1);
        return (
          <g key={day}>
            <line
              x1={x}
              y1={PAD.t}
              x2={x}
              y2={PAD.t + INNER_H}
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
              opacity={0.45}
            >
              {day}
            </text>
          </g>
        );
      })}

      {/* Area fills + Lines */}
      <AnimatePresence>
        {chartData.map((series) => {
          const linePath = buildLinePath(series.points, xScale, yScale);
          const areaPath = buildAreaPath(series.points, xScale, yScale);

          return (
            <g key={series.id}>
              {/* Gradient fill */}
              <motion.path
                d={areaPath}
                fill={`url(#grad-${series.id})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              {/* Line */}
              <motion.path
                d={linePath}
                fill="none"
                stroke={series.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: `drop-shadow(0 0 3px ${series.color}50)`,
                }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </g>
          );
        })}
      </AnimatePresence>

      {/* End dots */}
      {chartData.map((series) => {
        const lastIdx = series.points.reduce(
          (acc, val, i) => (val > 0 ? i : acc),
          0
        );
        return (
          <motion.circle
            key={`dot-${series.id}`}
            cx={xScale(lastIdx)}
            cy={yScale(series.points[lastIdx])}
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

/* ─── SVG path helpers ─── */

function buildLinePath(
  points: number[],
  xScale: (d: number) => number,
  yScale: (v: number) => number
): string {
  return points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`)
    .join(" ");
}

function buildAreaPath(
  points: number[],
  xScale: (d: number) => number,
  yScale: (v: number) => number
): string {
  const line = buildLinePath(points, xScale, yScale);
  const last = points.length - 1;
  return `${line} L ${xScale(last)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;
}
