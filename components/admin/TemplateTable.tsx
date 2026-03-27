"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Trash2, Eye, X, Plus } from "lucide-react";
import Link from "next/link";
import { getIconComponent } from "@/utils/iconMap";
import type { AdminTemplate } from "@/services/adminApi";
import AdminSearchBar from "./AdminSearchBar";
import PaginationControls from "./PaginationControls";
import ConfirmDialog from "@/components/ConfirmDialog";

// ─── Types ───────────────────────────────────────────────────────

interface TemplateTableProps {
  templates: AdminTemplate[];
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onFetch: (page?: number) => void;
  onDelete: (id: string) => Promise<void>;
}

// ─── Template Detail Modal ───────────────────────────────────────

interface TemplateDetailModalProps {
  template: AdminTemplate | null;
  onClose: () => void;
}

function TemplateDetailModal({ template, onClose }: TemplateDetailModalProps) {
  if (!template) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-theme-border bg-theme-card p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-theme-primary">{template.name}</h3>
              <p className="text-xs text-theme-secondary mt-0.5">
                بواسطة {template.authorName} · {template.usageCount} استخدام
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-theme-secondary hover:bg-theme-subtle transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {template.description && (
            <p className="mb-4 text-sm text-theme-secondary">{template.description}</p>
          )}

          {/* Categories */}
          <div className="flex flex-col gap-3">
            {template.categories.map((cat) => {
              const Icon = getIconComponent(cat.icon);
              return (
                <div
                  key={cat.categoryId}
                  className="rounded-xl bg-theme-subtle p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                      <Icon className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="text-sm font-semibold text-theme-primary">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-theme-secondary">
                      ({cat.items.length} عنصر)
                    </span>
                  </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item) => (
                    <span
                      key={item.id}
                      className="rounded-md bg-theme-card px-2 py-1 text-[11px] text-theme-secondary"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── TemplateRow ─────────────────────────────────────────────────

interface TemplateRowProps {
  template: AdminTemplate;
  onView: () => void;
  onDelete: () => void;
}

function TemplateRow({ template, onView, onDelete }: TemplateRowProps) {
  const totalHabits = template.categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex items-center gap-3 rounded-xl bg-theme-subtle p-3 transition-colors hover:bg-theme-card-hover"
    >
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
        <FileText className="h-4 w-4 text-amber-500" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col min-w-0">
        <span className="truncate text-sm font-medium text-theme-primary">
          {template.name}
        </span>
        <span className="text-[11px] text-theme-secondary">
          {template.authorName} · {template.categories.length} أقسام · {totalHabits} عبادة · {template.usageCount} استخدام
        </span>
      </div>

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

// ─── TemplateTable ───────────────────────────────────────────────

export default function TemplateTable({
  templates,
  page,
  totalPages,
  totalCount,
  isLoading,
  search,
  onSearchChange,
  onFetch,
  onDelete,
}: TemplateTableProps) {
  const [viewingTemplate, setViewingTemplate] = useState<AdminTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTemplate | null>(null);

  useEffect(() => {
    onFetch(1);
  }, [onFetch]);

  const handleSearch = useCallback(() => {
    onFetch(1);
  }, [onFetch]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await onDelete(deleteTarget._id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <AdminSearchBar
            value={search}
            onChange={onSearchChange}
            onSearch={handleSearch}
            placeholder="بحث في القوالب..."
          />
        </div>
        <Link
          href="/templates/publish"
          className="flex h-[42px] items-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-amber-400 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">إضافة قالب</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-theme-secondary">
          <FileText className="h-8 w-8 opacity-30" />
          <span className="text-sm">لا يوجد قوالب</span>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-2">
            {templates.map((template) => (
              <TemplateRow
                key={template._id}
                template={template}
                onView={() => setViewingTemplate(template)}
                onDelete={() => setDeleteTarget(template)}
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
      {viewingTemplate && (
        <TemplateDetailModal
          template={viewingTemplate}
          onClose={() => setViewingTemplate(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="حذف القالب"
        message={`هل أنت متأكد من حذف القالب "${deleteTarget?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
