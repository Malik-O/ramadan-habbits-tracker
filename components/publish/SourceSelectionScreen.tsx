"use client";

import { motion } from "framer-motion";
import { ClipboardList, FilePlus2, ChevronLeft } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface SourceSelectionScreenProps {
  onSelectCurrent: () => void;
  onSelectEmpty: () => void;
  habitsCount: number;
  categoriesCount: number;
}

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  delay: number;
}

// ─── Component ───────────────────────────────────────────────────

export default function SourceSelectionScreen({
  onSelectCurrent,
  onSelectEmpty,
  habitsCount,
  categoriesCount,
}: SourceSelectionScreenProps) {
  const hasHabits = habitsCount > 0;

  return (
    <motion.div
      className="flex flex-1 flex-col px-5 pt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero section */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10"
        >
          <FilePlus2 className="h-8 w-8 text-amber-500" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-2 text-xl font-bold text-theme-primary"
        >
          كيف تريد البدء؟
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm leading-relaxed text-theme-secondary"
        >
          اختر طريقة إنشاء القالب الخاص بك
        </motion.p>
      </div>

      {/* Option cards */}
      <div className="flex flex-col gap-4">
        <OptionCard
          icon={<ClipboardList className="h-6 w-6" />}
          title="تحميل عباداتي الحالية"
          description={
            hasHabits
              ? `استيراد ${categoriesCount} أقسام و ${habitsCount} عبادة من صفحتك الرئيسية`
              : "لا توجد عبادات حالية لتحميلها"
          }
          onClick={onSelectCurrent}
          disabled={!hasHabits}
          gradientFrom="from-amber-500/15"
          gradientTo="to-orange-500/5"
          iconBg="bg-amber-500/15 text-amber-500"
          delay={0.25}
        />

        <OptionCard
          icon={<FilePlus2 className="h-6 w-6" />}
          title="بدء قالب فارغ"
          description="ابدأ من الصفر وأضف أقسام وعبادات جديدة"
          onClick={onSelectEmpty}
          gradientFrom="from-emerald-500/15"
          gradientTo="to-teal-500/5"
          iconBg="bg-emerald-500/15 text-emerald-500"
          delay={0.35}
        />
      </div>
    </motion.div>
  );
}

// ─── OptionCard ──────────────────────────────────────────────────

function OptionCard({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  gradientFrom,
  gradientTo,
  iconBg,
  delay,
}: OptionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      className={`group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-theme-border bg-theme-card p-5 text-right transition-all active:bg-theme-subtle ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
      }`}
    >
      {/* Gradient background accent */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-l ${gradientFrom} ${gradientTo} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} transition-transform duration-200 group-active:scale-95`}
        >
          {icon}
        </div>

        {/* Text content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[15px] font-bold text-theme-primary">
            {title}
          </span>
          <span className="text-xs leading-relaxed text-theme-secondary/70">
            {description}
          </span>
        </div>

        {/* Arrow indicator */}
        {!disabled && (
          <ChevronLeft className="h-5 w-5 shrink-0 text-theme-secondary/40 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-amber-500" />
        )}
      </div>
    </motion.button>
  );
}
