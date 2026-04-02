export interface CalendarCell {
  date: Date;
  dayNum: number; // The day number for display (1-31 or 1-30)
}

function getHijriInfo(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
    month: "numeric",
    year: "numeric",
    day: "numeric",
  });
  const parts = fmt.formatToParts(date);
  const m = parts.find((p) => p.type === "month")?.value;
  const y = parts.find((p) => p.type === "year")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return { y: Number(y), m: Number(m), d: Number(d) };
}

export function getMonthCells(viewDate: Date, isHijri: boolean): CalendarCell[] {
  // Normalize time to noon to avoid daylight saving issues
  const baseDate = new Date(viewDate);
  baseDate.setHours(12, 0, 0, 0);

  const cells: CalendarCell[] = [];

  if (!isHijri) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= days; i++) {
      cells.push({
        date: new Date(year, month, i, 12, 0, 0, 0),
        dayNum: i,
      });
    }
  } else {
    // Determine start of Hijri month
    const start = new Date(baseDate);
    while (getHijriInfo(start).d !== 1) {
      start.setDate(start.getDate() - 1);
    }

    const startM = getHijriInfo(start).m;
    const curr = new Date(start);

    while (getHijriInfo(curr).m === startM) {
      cells.push({
        date: new Date(curr),
        dayNum: getHijriInfo(curr).d,
      });
      curr.setDate(curr.getDate() + 1);
    }
  }

  return cells;
}

export function addMonths(date: Date, offset: number, isHijri: boolean): Date {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);

  if (!isHijri) {
    result.setMonth(result.getMonth() + offset);
    return result;
  }

  // Adjust Hijri month
  const targetOffset = offset > 0 ? 1 : -1;
  const steps = Math.abs(offset);

  for (let i = 0; i < steps; i++) {
    const currentM = getHijriInfo(result).m;
    // Step by ±15 days repeatedly until the month changes
    let safeGuard = 0;
    while (getHijriInfo(result).m === currentM && safeGuard < 10) {
      result.setDate(result.getDate() + targetOffset * 15);
      safeGuard++;
    }
    // Snap to day 1 of the new month to avoid skipping short months if we started near the end
    while (getHijriInfo(result).d !== 1 && safeGuard < 20) {
      result.setDate(result.getDate() - 1);
      safeGuard++;
    }
  }

  return result;
}

export function formatMonthLabel(date: Date, isHijri: boolean): string {
  const opts: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
  return isHijri
    ? new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", opts).format(date)
    : new Intl.DateTimeFormat("ar", opts).format(date);
}
