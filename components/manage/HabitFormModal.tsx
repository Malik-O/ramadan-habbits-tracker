"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Hash, Repeat } from "lucide-react";
import type { HabitItem, HabitRepeat } from "@/constants/habits";
import type { RepeatSchedule } from "@/hooks/useCustomHabits";
import {
  WeekDayToggle,
  MonthDayPicker,
  YearlyDatePicker,
  EndDatePicker,
} from "./RepeatScheduleFields";

// ─── Constants ───────────────────────────────────────────────────

const REPEAT_OPTIONS: { value: HabitRepeat; label: string; description: string }[] = [
  { value: "daily", label: "يومياً", description: "كل يوم" },
  { value: "weekly", label: "أسبوعياً", description: "كل أسبوع" },
  { value: "biweekly", label: "كل أسبوعين", description: "مرة كل ١٤ يوم" },
  { value: "monthly", label: "شهرياً", description: "كل شهر" },
  { value: "yearly", label: "سنوياً", description: "كل سنة" },
];

// ─── Props ───────────────────────────────────────────────────────

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (label: string, type: "boolean" | "number", schedule: RepeatSchedule, goal?: number) => void;
  initialValues: HabitItem | null;
}

// ─── Component ───────────────────────────────────────────────────

export default function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: HabitFormModalProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"boolean" | "number">("boolean");
  const [goal, setGoal] = useState<string>("");
  const [repeat, setRepeat] = useState<HabitRepeat>("daily");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [repeatMonthDay, setRepeatMonthDay] = useState(1);
  const [repeatMonthHijri, setRepeatMonthHijri] = useState(false);
  const [repeatYearlyDate, setRepeatYearlyDate] = useState("01-01");
  const [repeatYearlyHijri, setRepeatYearlyHijri] = useState(false);
  const [repeatEndDate, setRepeatEndDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLabel(initialValues?.label || "");
      setType(initialValues?.type || "boolean");
      setGoal(initialValues?.goal ? String(initialValues.goal) : "");
      setRepeat(initialValues?.repeat || "daily");
      setRepeatDays(initialValues?.repeatDays || []);
      setRepeatMonthDay(initialValues?.repeatMonthDay || 1);
      setRepeatMonthHijri(initialValues?.repeatMonthHijri || false);
      setRepeatYearlyDate(initialValues?.repeatYearlyDate || "01-01");
      setRepeatYearlyHijri(initialValues?.repeatYearlyHijri || false);
      setRepeatEndDate(initialValues?.repeatEndDate || "");
    }
  }, [isOpen, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const schedule: RepeatSchedule = { repeat };

    if (repeat === "weekly" || repeat === "biweekly") {
      schedule.repeatDays = repeatDays;
    }
    if (repeat === "monthly") {
      schedule.repeatMonthDay = repeatMonthDay;
      schedule.repeatMonthHijri = repeatMonthHijri;
    }
    if (repeat === "yearly") {
      schedule.repeatYearlyDate = repeatYearlyDate;
      schedule.repeatYearlyHijri = repeatYearlyHijri;
    }
    if (repeatEndDate) {
      schedule.repeatEndDate = repeatEndDate;
    }

    const parsedGoal = type === "number" && goal ? parseInt(goal, 10) : undefined;
    const finalGoal = parsedGoal && parsedGoal > 0 ? parsedGoal : undefined;

    onSubmit(label.trim(), type, schedule, finalGoal);
  };

  const isEditing = !!initialValues;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pt-0 sm:pt-12"
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

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full sm:max-w-sm h-[92vh] sm:h-auto sm:max-h-[85vh] overflow-y-auto rounded-t-[32px] sm:rounded-2xl border border-theme-border bg-theme-card p-5 shadow-2xl pb-8 sm:pb-5"
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-theme-primary">
                {isEditing ? "تعديل العبادة" : "إضافة عبادة جديدة"}
              </h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
              >
                <X className="h-4 w-4 text-theme-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Label input */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  اسم العبادة
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="مثال: أذكار بعد الصلاة"
                  autoFocus
                  className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                />
              </div>

              {/* Type toggle */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                  نوع العبادة
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <TypeOption
                    selected={type === "boolean"}
                    onSelect={() => setType("boolean")}
                    icon={<CheckCircle2 className={`h-5 w-5 ${type === "boolean" ? "text-emerald-400" : "text-theme-secondary"}`} />}
                    title="تحقق"
                    description="تم أو لم يتم"
                  />
                  <TypeOption
                    selected={type === "number"}
                    onSelect={() => setType("number")}
                    icon={<Hash className={`h-5 w-5 ${type === "number" ? "text-sky-400" : "text-theme-secondary"}`} />}
                    title="رقم"
                    description="عدد مرات"
                  />
                </div>
              </div>

              {/* Goal input (only for number type) */}
              <AnimatePresence>
                {type === "number" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                        الهدف (اختياري)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="مثال: 100"
                        className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Repeat frequency */}
              <RepeatSelector value={repeat} onChange={setRepeat} />

              {/* Conditional scheduling UI */}
              {(repeat === "weekly" || repeat === "biweekly") && (
                <WeekDayToggle selectedDays={repeatDays} onChange={setRepeatDays} />
              )}

              {repeat === "monthly" && (
                <MonthDayPicker
                  selectedDay={repeatMonthDay}
                  isHijri={repeatMonthHijri}
                  onDayChange={setRepeatMonthDay}
                  onHijriChange={setRepeatMonthHijri}
                />
              )}

              {repeat === "yearly" && (
                <YearlyDatePicker 
                  value={repeatYearlyDate} 
                  onChange={setRepeatYearlyDate}
                  isHijri={repeatYearlyHijri}
                  onHijriChange={setRepeatYearlyHijri}
                />
              )}

              {/* End date */}
              <EndDatePicker value={repeatEndDate} onChange={setRepeatEndDate} />

              {/* Submit */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={!label.trim()}
                className="w-full rounded-xl bg-amber-500 py-3 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isEditing ? "حفظ التعديل" : "إضافة"}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── TypeOption ──────────────────────────────────────────────────

interface TypeOptionProps {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TypeOption({ selected, onSelect, icon, title, description }: TypeOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 transition-all cursor-pointer ${
        selected
          ? "border-amber-500/50 bg-amber-500/10"
          : "border-theme-border bg-theme-subtle hover:border-theme-border"
      }`}
    >
      {icon}
      <span className={`text-xs font-semibold ${selected ? "text-amber-400" : "text-theme-primary"}`}>
        {title}
      </span>
      <span className="text-[10px] text-theme-secondary">{description}</span>
    </button>
  );
}

// ─── RepeatSelector ─────────────────────────────────────────────

interface RepeatSelectorProps {
  value: HabitRepeat;
  onChange: (value: HabitRepeat) => void;
}

function RepeatSelector({ value, onChange }: RepeatSelectorProps) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-theme-secondary">
        <Repeat className="h-3.5 w-3.5" />
        التكرار
      </label>
      <div className="flex flex-wrap gap-1.5">
        {REPEAT_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40"
                  : "bg-theme-subtle text-theme-secondary hover:bg-theme-border hover:text-theme-primary"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
