import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
            <Shield className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-base font-bold text-theme-primary">لوحة التحكم</h1>
            <p className="text-[11px] text-theme-secondary">إدارة النظام</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-theme-secondary transition-colors hover:bg-theme-subtle hover:text-theme-primary"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          الرئيسية
        </Link>
      </div>
    </header>
  );
}
