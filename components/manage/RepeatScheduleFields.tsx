"use client";

import type { HabitRepeat } from "@/constants/habits";

// ─── WeekDayToggle ───────────────────────────────────────────────

const WEEK_DAYS = [
  { value: 6, label: "سبت" },
  { value: 0, label: "أحد" },
  { value: 1, label: "إثنين" },
  { value: 2, label: "ثلاثاء" },
  { value: 3, label: "أربعاء" },
  { value: 4, label: "خميس" },
  { value: 5, label: "جمعة" },
] as const;

interface WeekDayToggleProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export function WeekDayToggle({ selectedDays, onChange }: WeekDayToggleProps) {
  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      onChange(selectedDays.filter((d) => d !== dayValue));
    } else {
      onChange([...selectedDays, dayValue]);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
        أيام الأسبوع
      </label>
      <div className="flex flex-wrap gap-1.5">
        {WEEK_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40"
                  : "bg-theme-subtle text-theme-secondary hover:bg-theme-border hover:text-theme-primary"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── MonthDayPicker ──────────────────────────────────────────────

interface MonthDayPickerProps {
  selectedDay: number;
  isHijri: boolean;
  onDayChange: (day: number) => void;
  onHijriChange: (hijri: boolean) => void;
}

export function MonthDayPicker({
  selectedDay,
  isHijri,
  onDayChange,
  onHijriChange,
}: MonthDayPickerProps) {
  const maxDays = isHijri ? 30 : 31;

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar toggle */}
      <div>
        <label className="mb-2 block text-xs font-medium text-theme-secondary">
          نوع التقويم
        </label>
        <div className="flex w-full rounded-xl border border-theme-border bg-theme-subtle p-1">
          <button
            type="button"
            onClick={() => onHijriChange(false)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
              !isHijri
                ? "bg-theme-card text-amber-500 shadow-sm"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            ميلادي
          </button>
          <button
            type="button"
            onClick={() => onHijriChange(true)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
              isHijri
                ? "bg-theme-card text-amber-500 shadow-sm"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            هجري
          </button>
        </div>
      </div>

      {/* Day selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
          يوم الشهر
        </label>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: maxDays }, (_, i) => i + 1).map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => onDayChange(day)}
                className={`rounded-lg py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40"
                    : "bg-theme-subtle text-theme-secondary hover:bg-theme-border hover:text-theme-primary"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── YearlyDatePicker ────────────────────────────────────────────

interface YearlyDatePickerProps {
  value: string; // "MM-DD"
  onChange: (value: string) => void;
  isHijri: boolean;
  onHijriChange: (hijri: boolean) => void;
}

export function YearlyDatePicker({ value, onChange, isHijri, onHijriChange }: YearlyDatePickerProps) {
  // Parse current value
  const [currentMonth, currentDay] = value
    ? value.split("-").map(Number)
    : [1, 1];

  const GREGORIAN_MONTHS = [
    { value: 1, label: "يناير", days: 31 },
    { value: 2, label: "فبراير", days: 29 },
    { value: 3, label: "مارس", days: 31 },
    { value: 4, label: "أبريل", days: 30 },
    { value: 5, label: "مايو", days: 31 },
    { value: 6, label: "يونيو", days: 30 },
    { value: 7, label: "يوليو", days: 31 },
    { value: 8, label: "أغسطس", days: 31 },
    { value: 9, label: "سبتمبر", days: 30 },
    { value: 10, label: "أكتوبر", days: 31 },
    { value: 11, label: "نوفمبر", days: 30 },
    { value: 12, label: "ديسمبر", days: 31 },
  ];

  const HIJRI_MONTHS = [
    { value: 1, label: "محرم", days: 30 },
    { value: 2, label: "صفر", days: 30 },
    { value: 3, label: "ربيع الأول", days: 30 },
    { value: 4, label: "ربيع الآخر", days: 30 },
    { value: 5, label: "جمادى الأولى", days: 30 },
    { value: 6, label: "جمادى الآخرة", days: 30 },
    { value: 7, label: "رجب", days: 30 },
    { value: 8, label: "شعبان", days: 30 },
    { value: 9, label: "رمضان", days: 30 },
    { value: 10, label: "شوال", days: 30 },
    { value: 11, label: "ذو القعدة", days: 30 },
    { value: 12, label: "ذو الحجة", days: 30 },
  ];

  const MONTHS = isHijri ? HIJRI_MONTHS : GREGORIAN_MONTHS;
  const selectedMonthInfo = MONTHS.find((m) => m.value === currentMonth) || MONTHS[0];

  const handleMonthChange = (month: number) => {
    const monthInfo = MONTHS.find((m) => m.value === month) || MONTHS[0];
    const clampedDay = Math.min(currentDay, monthInfo.days);
    onChange(
      `${String(month).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`
    );
  };

  const handleDayChange = (day: number) => {
    onChange(
      `${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar toggle */}
      <div>
        <label className="mb-2 block text-xs font-medium text-theme-secondary">
          نوع التقويم
        </label>
        <div className="flex w-full rounded-xl border border-theme-border bg-theme-subtle p-1">
          <button
            type="button"
            onClick={() => !isHijri || onHijriChange(false)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
              !isHijri
                ? "bg-theme-card text-amber-500 shadow-sm"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            ميلادي
          </button>
          <button
            type="button"
            onClick={() => isHijri || onHijriChange(true)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
              isHijri
                ? "bg-theme-card text-amber-500 shadow-sm"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            هجري
          </button>
        </div>
      </div>

      {/* Month selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
          الشهر
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {MONTHS.map((month) => {
            const isSelected = currentMonth === month.value;
            return (
              <button
                key={month.value}
                type="button"
                onClick={() => handleMonthChange(month.value)}
                className={`rounded-lg px-2 py-1.5 text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40"
                    : "bg-theme-subtle text-theme-secondary hover:bg-theme-border hover:text-theme-primary"
                }`}
              >
                {month.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day of month */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
          اليوم
        </label>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: selectedMonthInfo.days }, (_, i) => i + 1).map(
            (day) => {
              const isSelected = currentDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayChange(day)}
                  className={`rounded-lg py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40"
                      : "bg-theme-subtle text-theme-secondary hover:bg-theme-border hover:text-theme-primary"
                  }`}
                >
                  {day}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EndDatePicker ───────────────────────────────────────────────

interface EndDatePickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
}

export function EndDatePicker({ value, onChange }: EndDatePickerProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-theme-border bg-theme-subtle/30 p-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-theme-secondary">
          تاريخ انتهاء التكرار (اختياري)
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            إزالة
          </button>
        )}
      </div>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
      />
      {!value && (
        <p className="text-[10px] text-theme-secondary">
          العبادة مستمرة بدون تاريخ انتهاء. اختر تاريخاً لإيقافها.
        </p>
      )}
    </div>
  );
}
