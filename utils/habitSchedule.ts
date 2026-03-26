import type { HabitItem, HabitRepeat } from "@/constants/habits";

/**
 * Checks whether a habit should be active on a given date based on its repeat schedule.
 * This is the client-side equivalent of the server's habitSchedule utility.
 */
export function isHabitActiveOnDate(habit: HabitItem, date: Date): boolean {
  const repeat: HabitRepeat = habit.repeat || "daily";

  // Check end date
  if (habit.repeatEndDate) {
    const endDate = new Date(habit.repeatEndDate + "T23:59:59");
    if (date > endDate) return false;
  }

  switch (repeat) {
    case "daily":
      return true;

    case "weekly": {
      if (!habit.repeatDays || habit.repeatDays.length === 0) return true;
      return habit.repeatDays.includes(date.getDay());
    }

    case "biweekly": {
      if (!habit.repeatDays || habit.repeatDays.length === 0) return true;
      if (!habit.repeatDays.includes(date.getDay())) return false;

      // Use Ramadan start as reference for biweekly cycle
      const reference = new Date("2026-02-18T00:00:00");
      reference.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const diffMs = targetDate.getTime() - reference.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(diffDays / 7);
      return weekNumber % 2 === 0;
    }

    case "monthly": {
      const targetDay = habit.repeatMonthDay;
      if (!targetDay) return true;

      if (habit.repeatMonthHijri) {
        try {
          const hijriDay = getHijriDayOfMonth(date);
          return hijriDay === targetDay;
        } catch {
          return date.getDate() === targetDay;
        }
      }
      return date.getDate() === targetDay;
    }

    case "yearly": {
      if (!habit.repeatYearlyDate) return true;
      const [month, day] = habit.repeatYearlyDate.split("-").map(Number);
      
      if (habit.repeatYearlyHijri) {
        try {
          const hijriMonth = getHijriMonthOfYear(date);
          const hijriDay = getHijriDayOfMonth(date);
          return hijriMonth === month && hijriDay === day;
        } catch {
          return date.getMonth() + 1 === month && date.getDate() === day;
        }
      } else {
        return date.getMonth() + 1 === month && date.getDate() === day;
      }
    }

    default:
      return true;
  }
}

function getHijriDayOfMonth(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-nu-latn", {
    day: "numeric",
  });
  return Number(formatter.format(date));
}

/** Gets the Hijri month of year using Intl.DateTimeFormat */
function getHijriMonthOfYear(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-nu-latn", {
    month: "numeric",
  });
  return Number(formatter.format(date));
}

/**
 * Filters habit items to only those active on the given date.
 */
export function filterHabitsForDate(
  items: HabitItem[],
  date: Date
): HabitItem[] {
  return items.filter((item) => isHabitActiveOnDate(item, date));
}
