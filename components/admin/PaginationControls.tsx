"use client";

import { Loader2 } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  isLoading?: boolean;
}

export default function PaginationControls({
  page,
  totalPages,
  onPageChange,
  totalCount,
  isLoading,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center pt-6 pb-4">
      <span className="mb-4 text-xs font-medium text-theme-secondary/70">
        تم عرض {Math.min(page * 20, totalCount)} من أصل {totalCount} عنصر
      </span>
      {page < totalPages && (
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={isLoading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-theme-border bg-theme-subtle px-6 text-sm font-semibold text-theme-secondary transition-colors hover:bg-theme-card-hover hover:text-theme-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري التحميل...
            </>
          ) : (
            "عرض المزيد"
          )}
        </button>
      )}
    </div>
  );
}
