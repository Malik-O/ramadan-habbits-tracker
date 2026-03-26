import { RotateCcw } from "lucide-react";

interface ManageHeaderProps {
  onReset?: () => void;
  showReset?: boolean;
}

export default function ManageHeader({ onReset, showReset = false }: ManageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-theme-primary">إدارة العبادات</h1>
        </div>
        {showReset && onReset && (
          <button
            onClick={onReset}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-theme-subtle px-3 py-1.5 text-xs font-medium text-theme-secondary transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <RotateCcw className="h-3 w-3" />
            استعادة
          </button>
        )}
      </div>
    </header>
  );
}
