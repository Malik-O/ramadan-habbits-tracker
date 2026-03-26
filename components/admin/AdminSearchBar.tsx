"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export default function AdminSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "بحث...",
}: AdminSearchBarProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch();
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-theme-border bg-theme-subtle py-2.5 pr-10 pl-4 text-sm text-theme-primary placeholder:text-theme-secondary/50 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
      />
    </div>
  );
}
