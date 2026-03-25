import { RAMADAN_START_DATE } from "@/constants/habits";

const HIJRI_DAY_NAMES_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"] as const;
const HIJRI_DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface HijriDateInfo {
  hijriDay: number;
  hijriMonth: string;
  hijriMonthAr: string;
  hijriYear: number;
  dayNameAr: string;
  dayNameEn: string;
  gregorianDate: Date;
}

/**
 * Derives the Hijri date for a given Ramadan day index (0-based).
 * Since RAMADAN_START_DATE maps to 1 Ramadan 1447 AH, we simply compute offsets.
 */
export function getHijriDateForDay(dayIndex: number): HijriDateInfo {
  const gregorianDate = new Date(RAMADAN_START_DATE);
  gregorianDate.setDate(gregorianDate.getDate() + dayIndex);

  const hijriDay = dayIndex + 1; // 1-indexed Hijri day of Ramadan
  const jsDay = gregorianDate.getDay(); // 0=Sun, 1=Mon ...

  return {
    hijriDay,
    hijriMonth: "Ramadan",
    hijriMonthAr: "رمضان",
    hijriYear: 1447,
    dayNameAr: HIJRI_DAY_NAMES_AR[jsDay],
    dayNameEn: HIJRI_DAY_NAMES_SHORT[jsDay],
    gregorianDate,
  };
}

/**
 * Formats a Gregorian date as a readable string.
 */
export function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats the Hijri date as a readable Arabic string.
 */
export function formatHijriDateAr(info: HijriDateInfo): string {
  // If within the assumed 30 days of Ramadan, use exact offsets to guarantee it lines up
  const isRamadan = info.hijriDay >= 1 && info.hijriDay <= 30;
  if (isRamadan) {
    return `${info.hijriDay} ${info.hijriMonthAr} ${info.hijriYear} هـ`;
  }
  
  // Otherwise, use JavaScript's native Intl Islamic calendar formatter
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(info.gregorianDate);
  } catch {
    // Fallback if browser doesn't support islamic calendar formatting
    return `${info.hijriDay} ${info.hijriMonthAr} ${info.hijriYear} هـ`;
  }
}

/**
 * Returns the Gregorian date for a given Ramadan day index (0-based).
 */
export function getGregorianDateForDay(dayIndex: number): Date {
  const date = new Date(RAMADAN_START_DATE);
  date.setDate(date.getDate() + dayIndex);
  return date;
}

/**
 * Returns a short Hijri representation (e.g., "5 رمـ" or "10 شوال") for the weekday circles.
 */
export function getHijriShortStr(info: HijriDateInfo): string {
  const isRamadan = info.hijriDay >= 1 && info.hijriDay <= 30;
  if (isRamadan) {
    return info.hijriDay.toString();
  }
  
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-nu-latn", {
      day: "numeric"
    }).format(info.gregorianDate);
  } catch {
    return info.hijriDay.toString();
  }
}

/**
 * Returns a YYYY-MM-DD date string for a given dayIndex.
 */
export function getDateStringForDayIndex(dayIndex: number): string {
  const date = getGregorianDateForDay(dayIndex);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the dayIndex given a YYYY-MM-DD date string.
 */
export function getDayIndexFromDateString(dateStr: string): number {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const start = new Date(RAMADAN_START_DATE);
  // Zero times to ensure accurate day comparison regardless of time
  date.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

