"use client";

import { WifiOff } from "lucide-react";

/**
 * Offline fallback page shown when the user is offline
 * and the requested page is not cached.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center bg-theme-bg px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
        <WifiOff className="h-10 w-10 text-amber-400" />
      </div>

      <h1 className="mb-3 text-2xl font-bold text-theme-primary">
        لا يوجد اتصال بالإنترنت
      </h1>

      <p className="mb-8 text-sm leading-relaxed text-theme-secondary">
        يبدو أنك غير متصل بالإنترنت. لا تقلق — بياناتك المحفوظة ستكون متاحة
        عند عودة الاتصال.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-amber-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
