import { getHijriDateForDay, formatHijriDateAr } from "@/utils/hijri";

interface DayLabelProps {
  day: number;
}

export default function DayLabel({ day }: DayLabelProps) {
  const hijriInfo = getHijriDateForDay(day);

  const isRamadan = day >= 0 && day <= 29;

  return (
    <div className="flex flex-wrap items-baseline gap-2 px-4 pt-3 pb-1">
      {isRamadan ? (
        <>
          <h2 className="text-base font-bold text-theme-primary">
            اليوم {day + 1}
            <span className="mr-1 text-sm font-normal text-theme-secondary">
              {" "}من رمضان
            </span>
          </h2>
          <span className="text-xs text-theme-secondary/70">
            • {formatHijriDateAr(hijriInfo)}
          </span>
        </>
      ) : (
        <h2 className="text-base font-bold text-theme-primary">
          {formatHijriDateAr(hijriInfo)}
        </h2>
      )}
    </div>
  );
}
