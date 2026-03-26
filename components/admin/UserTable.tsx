"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Calendar } from "lucide-react";
import type { AdminUser } from "@/services/adminApi";
import AdminSearchBar from "./AdminSearchBar";
import PaginationControls from "./PaginationControls";

// ─── Types ───────────────────────────────────────────────────────

interface UserTableProps {
  users: AdminUser[];
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onFetch: (page?: number) => void;
}

// ─── UserRow ─────────────────────────────────────────────────────

interface UserRowProps {
  user: AdminUser;
}

function UserRow({ user }: UserRowProps) {
  const date = new Date(user.createdAt);
  const formattedDate = date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex items-center gap-3 rounded-xl bg-theme-subtle p-3 transition-colors hover:bg-theme-card-hover"
    >
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-theme-card">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-theme-secondary" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col min-w-0">
        <span className="truncate text-sm font-medium text-theme-primary">
          {user.displayName}
        </span>
        <div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3 text-theme-secondary" />
          <span className="truncate text-[11px] text-theme-secondary">{user.email}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
            user.provider === "google"
              ? "bg-blue-500/10 text-blue-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {user.provider === "google" ? "Google" : "بريد"}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-theme-secondary">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </div>
      </div>
    </motion.div>
  );
}

// ─── UserTable ───────────────────────────────────────────────────

export default function UserTable({
  users,
  page,
  totalPages,
  totalCount,
  isLoading,
  search,
  onSearchChange,
  onFetch,
}: UserTableProps) {
  useEffect(() => {
    onFetch(1);
  }, [onFetch]);

  const handleSearch = useCallback(() => {
    onFetch(1);
  }, [onFetch]);

  return (
    <div className="flex flex-col gap-3">
      <AdminSearchBar
        value={search}
        onChange={onSearchChange}
        onSearch={handleSearch}
        placeholder="بحث بالاسم أو البريد..."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-theme-secondary">
          <User className="h-8 w-8 opacity-30" />
          <span className="text-sm">لا يوجد مستخدمون</span>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <UserRow key={user._id} user={user} />
            ))}
          </div>
        </AnimatePresence>
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isLoading}
        onPageChange={onFetch}
      />
    </div>
  );
}
