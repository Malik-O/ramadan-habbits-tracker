import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ManageHeaderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export default function ManageHeader({ isEditMode, onToggleEditMode }: ManageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
          >
            <ArrowRight className="h-4 w-4 text-theme-secondary" />
          </Link>
          <h1 className="text-lg font-bold text-theme-primary">إدارة العادات</h1>
        </div>
        <button
          onClick={onToggleEditMode}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            isEditMode
              ? "bg-amber-500 text-slate-950"
              : "bg-theme-subtle text-theme-secondary hover:bg-theme-border"
          }`}
        >
          {isEditMode ? "تم" : "تعديل"}
        </button>
      </div>
    </header>
  );
}
