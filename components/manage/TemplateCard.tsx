"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  RefreshCw,
  Trash2,
  User,
  Layers,
  Eye,
} from "lucide-react";
import type { TemplateResponse } from "@/services/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import TemplateDetailsModal from "./TemplateDetailsModal";

// ─── Props ───────────────────────────────────────────────────────

interface TemplateCardProps {
  template: TemplateResponse;
  currentUserUid: string | null;
  onMerge: (template: TemplateResponse) => void;
  onReplace: (template: TemplateResponse) => void;
  onDelete: (templateId: string) => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function TemplateCard({
  template,
  currentUserUid,
  onMerge,
  onReplace,
  onDelete,
}: TemplateCardProps) {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmMerge, setConfirmMerge] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = currentUserUid === template.authorUid;
  const totalHabits = template.categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <>
      <motion.div
        layout
        className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {/* Header */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-theme-primary">
                {template.name}
              </h4>
              {template.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-theme-secondary">
                  {template.description}
                </p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-theme-secondary">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {template.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {template.categories.length} قسم · {totalHabits} عبادة
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {template.usageCount} استخدام
            </span>
          </div>
        </div>

        {/* Show details */}
        <button
          onClick={() => setDetailsModalOpen(true)}
          className="mx-4 mb-3 mt-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-theme-subtle py-2 text-[11px] font-medium text-theme-secondary transition-all hover:bg-amber-500/10 hover:text-amber-400"
        >
          <Eye className="h-3.5 w-3.5" />
          عرض التفاصيل
        </button>

        {/* Modal content */}
        <TemplateDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          templateName={template.name}
          categories={template.categories}
        />

        {/* Actions */}
        <div className="flex border-t border-theme-border">
          <button
            onClick={() => setConfirmMerge(true)}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/5"
          >
            <Download className="h-3.5 w-3.5" />
            دمج
          </button>

          <button
            onClick={() => setConfirmReplace(true)}
            className="flex flex-1 items-center justify-center gap-1.5 border-r border-theme-border py-2.5 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            استبدال
          </button>

          {isOwner && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center gap-1.5 border-r border-theme-border px-4 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/5"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Confirm merge */}
      <ConfirmDialog
        isOpen={confirmMerge}
        title="دمج القالب"
        message={`سيتم إضافة ${template.categories.length} قسم و ${totalHabits} عبادة من "${template.name}" إلى عاداتك الحالية. هل تريد المتابعة؟`}
        confirmLabel="دمج"
        cancelLabel="إلغاء"
        variant="warning"
        onConfirm={() => {
          setConfirmMerge(false);
          onMerge(template);
        }}
        onCancel={() => setConfirmMerge(false)}
      />

      {/* Confirm replace */}
      <ConfirmDialog
        isOpen={confirmReplace}
        title="استبدال العادات"
        message={`سيتم استبدال جميع عاداتك الحالية بمحتوى "${template.name}" (${template.categories.length} قسم و ${totalHabits} عبادة). هذا الإجراء لا يمكن التراجع عنه.`}
        confirmLabel="استبدال"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={() => {
          setConfirmReplace(false);
          onReplace(template);
        }}
        onCancel={() => setConfirmReplace(false)}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={confirmDelete}
        title="حذف القالب"
        message={`هل أنت متأكد من حذف القالب "${template.name}"؟ لا يمكن التراجع.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete(template._id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
