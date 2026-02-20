"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users } from "lucide-react";
import type { GroupResponse } from "@/services/api";
import GroupCard from "./GroupCard";

interface GroupsListPanelProps {
  groups: GroupResponse[];
  isLoading: boolean;
  onSelectGroup: (groupId: string) => void;
  onOpenCreateJoin: () => void;
}

export default function GroupsListPanel({
  groups,
  isLoading,
  onSelectGroup,
  onOpenCreateJoin,
}: GroupsListPanelProps) {
  if (isLoading) {
    return <GroupsListSkeleton />;
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Create/Join button */}
      <motion.button
        onClick={onOpenCreateJoin}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 py-4 text-amber-500 transition-all hover:border-amber-500/50 hover:bg-amber-500/10"
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-semibold">إنشاء أو انضمام لمجموعة</span>
      </motion.button>

      {/* Groups list */}
      {groups.length === 0 ? (
        <GroupsEmptyState />
      ) : (
        <AnimatePresence mode="popLayout">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onSelect={onSelectGroup}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────

function GroupsEmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 py-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-theme-subtle">
        <Users className="h-7 w-7 text-theme-secondary" />
      </div>
      <p className="text-sm font-medium text-theme-secondary">
        لا توجد مجموعات حالياً
      </p>
      <p className="max-w-[250px] text-xs text-theme-secondary/70">
        أنشئ مجموعة جديدة أو انضم لمجموعة موجودة عبر رمز الدعوة
      </p>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────

function GroupsListSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-theme-border bg-theme-card p-4"
        >
          <div className="h-12 w-12 animate-pulse rounded-xl bg-theme-subtle" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-32 animate-pulse rounded-lg bg-theme-subtle" />
            <div className="h-3 w-20 animate-pulse rounded-lg bg-theme-subtle" />
          </div>
        </div>
      ))}
    </div>
  );
}
