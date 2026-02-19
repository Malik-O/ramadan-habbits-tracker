export default function QuoteBanner({ quote }: { quote: string }) {
  return (
    <div className="border-b border-theme-border px-4 py-2.5 text-center">
      <p className="text-xs leading-relaxed text-amber-500 italic">
        ❝ {quote} ❞
      </p>
    </div>
  );
}
