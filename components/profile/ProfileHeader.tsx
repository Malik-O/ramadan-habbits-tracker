import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProfileHeader() {
  return (
    <header className="border-b border-theme-border bg-theme-header px-4 py-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
        >
          <ArrowRight className="h-4 w-4 text-theme-secondary" />
        </Link>
        <h1 className="text-lg font-bold text-theme-primary">الإعدادات</h1>
      </div>
    </header>
  );
}
