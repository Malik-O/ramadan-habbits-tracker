"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X, Check, Minus } from "lucide-react";
import type { MemberProgressResponse, GroupCategory } from "@/services/api";
import { getIconComponent } from "@/utils/iconMap";
import { TOTAL_DAYS } from "@/constants/habits";

// ─── Types ───────────────────────────────────────────────────────

interface MemberProgressModalProps {
  groupId: string;
  memberUid: string;
  getMemberProgress: (memberUid: string) => Promise<MemberProgressResponse | null>;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function MemberProgressModal({
  memberUid,
  getMemberProgress,
  onClose,
}: MemberProgressModalProps) {
  const [data, setData] = useState<MemberProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const result = await getMemberProgress(memberUid);
      setData(result);
      setIsLoading(false);
    })();
  }, [memberUid, getMemberProgress]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-theme-card shadow-2xl sm:rounded-3xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-theme-border px-5 py-4">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
          >
            <X className="h-4 w-4" />
          </button>

          {data?.member && (
            <div className="flex items-center gap-2">
              <MemberAvatar member={data.member} />
              <span className="text-sm font-bold text-theme-primary">
                {data.member.displayName}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <ProgressSkeleton />
          ) : !data ? (
            <div className="py-8 text-center text-sm text-red-400">
              حدث خطأ أثناء تحميل البيانات
            </div>
          ) : data.categories.length === 0 ? (
            <div className="py-8 text-center text-sm text-theme-secondary">
              لا توجد عادات محددة في هذه المجموعة
            </div>
          ) : (
            <DayByDayProgress
              categories={data.categories}
              dayMap={data.dayMap}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Day-by-Day Progress ─────────────────────────────────────────

function DayByDayProgress({
  categories,
  dayMap,
}: {
  categories: GroupCategory[];
  dayMap: Record<number, Record<string, boolean | number>>;
}) {
  const allHabits = categories.flatMap((cat) =>
    cat.items.map((item) => ({
      ...item,
      categoryName: cat.name,
      categoryIcon: cat.icon,
    }))
  );

  // Show days that have any data, plus today
  const today = Math.min(
    Math.floor(
      (Date.now() - new Date("2026-02-18T00:00:00").getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    TOTAL_DAYS - 1
  );

  const daysToShow = Array.from(
    new Set([
      ...Object.keys(dayMap).map(Number),
      today,
    ])
  )
    .filter((d) => d >= 0 && d < TOTAL_DAYS)
    .sort((a, b) => b - a); // newest first

  return (
    <div className="flex flex-col gap-3">
      {/* Summary cards per category */}
      {categories.map((cat) => (
        <CategorySummary
          key={cat.categoryId}
          category={cat}
          dayMap={dayMap}
          totalDays={daysToShow.length}
        />
      ))}

      {/* Day-by-day detail */}
      <h4 className="mt-2 text-xs font-semibold text-theme-secondary">
        التفاصيل اليومية
      </h4>

      {daysToShow.map((dayIndex) => {
        const dayData = dayMap[dayIndex] || {};
        const completed = allHabits.filter((h) => {
          const val = dayData[h.id];
          return val === true || (typeof val === "number" && val > 0);
        }).length;

        return (
          <div
            key={dayIndex}
            className="rounded-xl border border-theme-border bg-theme-card/50 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-theme-primary">
                اليوم {dayIndex + 1}
              </span>
              <span className="text-[10px] font-semibold text-theme-secondary">
                {completed}/{allHabits.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {allHabits.map((habit) => {
                const val = dayData[habit.id];
                const isDone =
                  val === true || (typeof val === "number" && val > 0);

                return (
                  <div
                    key={habit.id}
                    title={habit.label}
                    className={`flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] font-medium ${
                      isDone
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-theme-subtle text-theme-secondary/60"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : (
                      <Minus className="h-2.5 w-2.5" />
                    )}
                    <span className="max-w-[80px] truncate">{habit.label}</span>
                    {typeof val === "number" && val > 0 && (
                      <span className="font-bold">{val}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Category Summary ────────────────────────────────────────────

function CategorySummary({
  category,
  dayMap,
  totalDays,
}: {
  category: GroupCategory;
  dayMap: Record<number, Record<string, boolean | number>>;
  totalDays: number;
}) {
  const IconComponent = getIconComponent(category.icon);

  // Calculate completion across all days
  let totalCompleted = 0;
  let totalPossible = 0;

  Object.values(dayMap).forEach((dayData) => {
    category.items.forEach((item) => {
      totalPossible++;
      const val = dayData[item.id];
      if (val === true || (typeof val === "number" && val > 0)) {
        totalCompleted++;
      }
    });
  });

  const rate =
    totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-theme-border bg-theme-card p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
        <IconComponent className="h-4 w-4 text-amber-500" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-xs font-semibold text-theme-primary">
          {category.name}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-theme-subtle">
            <motion.div
              className={`h-full rounded-full ${
                rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-theme-secondary"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${rate}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] font-bold tabular-nums text-theme-secondary">
            {rate}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub Components ──────────────────────────────────────────────

function MemberAvatar({
  member,
}: {
  member: { displayName: string; photoURL: string | null };
}) {
  return (
    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-amber-500/10">
      {member.photoURL ? (
        <Image
          src={member.photoURL}
          alt={member.displayName}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-amber-500">
          {member.displayName.charAt(0)}
        </span>
      )}
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl bg-theme-subtle"
        />
      ))}
    </div>
  );
}
