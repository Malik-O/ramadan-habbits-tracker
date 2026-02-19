export default function DayLabel({ day }: { day: number }) {
  return (
    <div className="px-4 pt-2 pb-1">
      <h2 className="text-base font-bold text-theme-primary">
        اليوم {day + 1}
        <span className="mr-2 text-sm font-normal text-theme-secondary">
          {" "}
          من رمضان
        </span>
      </h2>
    </div>
  );
}
