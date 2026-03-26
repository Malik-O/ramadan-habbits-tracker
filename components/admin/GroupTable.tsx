"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trash2, Calendar, Hash, Eye } from "lucide-react";
import type { AdminGroup } from "@/services/adminApi";
import PaginationControls from "./PaginationControls";
import ConfirmDialog from "@/components/ConfirmDialog";
import AdminGroupDetailModal from "./AdminGroupDetailModal";

// ─── Types ───────────────────────────────────────────────────────

interface GroupTableProps {
  groups: AdminGroup[];
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  onFetch: (page?: number) => void;
  onDelete: (id: string) => Promise<void>;
}

// ─── GroupRow ─────────────────────────────────────────────────────

interface GroupRowProps {
  group: AdminGroup;
  onView: () => void;
  onDelete: () => void;
}

function GroupRow({ group, onView, onDelete }: GroupRowProps) {
  const date = new Date(group.createdAt);
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
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
        <Users className="h-4 w-4 text-purple-400" />
      </div>

      {/* Info via click */}
      <button
        onClick={onView}
        className="flex flex-1 flex-col min-w-0 text-right"
      >
        <span className="truncate text-sm font-medium text-theme-primary transition-colors hover:text-amber-500">
          {group.name}
        </span>
        <div className="flex items-center gap-3 text-[11px] text-theme-secondary mt-1">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {group.memberCount} عضو
          </span>
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {group.inviteCode}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>
      </button>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-theme-secondary transition-colors hover:bg-blue-500/10 hover:text-blue-400"
          title="عرض التفاصيل"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-theme-secondary transition-colors hover:bg-red-500/10 hover:text-red-400"
          title="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── GroupTable ───────────────────────────────────────────────────

export default function GroupTable({
  groups,
  page,
  totalPages,
  totalCount,
  isLoading,
  onFetch,
  onDelete,
}: GroupTableProps) {
  const [viewingGroup, setViewingGroup] = useState<AdminGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminGroup | null>(null);

  useEffect(() => {
    onFetch(1);
  }, [onFetch]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await onDelete(deleteTarget._id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-theme-secondary">
          <Users className="h-8 w-8 opacity-30" />
          <span className="text-sm">لا يوجد مجموعات</span>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-2">
            {groups.map((group) => (
              <GroupRow
                key={group._id}
                group={group}
                onView={() => setViewingGroup(group)}
                onDelete={() => setDeleteTarget(group)}
              />
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

      {/* Detail Modal */}
      {viewingGroup && (
        <AdminGroupDetailModal
          groupId={viewingGroup._id}
          onClose={() => setViewingGroup(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="حذف المجموعة"
        message={`هل أنت متأكد من حذف المجموعة "${deleteTarget?.name}"؟ سيتم إزالة جميع أعضائها. هذا الإجراء لا يمكن التراجع عنه.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
