"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LeaderboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header px-4 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
        >
          <ArrowRight className="h-4 w-4 text-theme-secondary" />
        </Link>
        <h1 className="text-lg font-bold text-theme-primary">
          لوحة المتصدرين
        </h1>
      </div>
    </header>
  );
}
