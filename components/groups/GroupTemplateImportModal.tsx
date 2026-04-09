"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Download,
  BookOpen,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { listTemplates, type TemplateResponse } from "@/services/api";
import { getIconComponent } from "@/utils/iconMap";

// ─── Types ───────────────────────────────────────────────────────

interface GroupTemplateImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: TemplateResponse) => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function GroupTemplateImportModal({
  isOpen,
  onClose,
  onImport,
}: GroupTemplateImportModalProps) {
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] =
    useState<TemplateResponse | null>(null);

  const fetchTemplates = useCallback(async (search = "") => {
    setIsLoading(true);
    try {
      const result = await listTemplates(1, 50, search);
      setTemplates(result.templates);
    } catch {
      // Silently fail — empty list shown
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setSearchQuery("");
      setPreviewTemplate(null);
    }
  }, [isOpen, fetchTemplates]);

  const handleSearch = useCallback(() => {
    fetchTemplates(searchQuery);
  }, [fetchTemplates, searchQuery]);

  const handleImport = useCallback(
    (template: TemplateResponse) => {
      onImport(template);
      onClose();
    },
    [onImport, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-theme-border bg-theme-card shadow-2xl sm:rounded-2xl"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-theme-border px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                  </div>
                  <h3 className="text-base font-semibold text-theme-primary">
                    {previewTemplate ? "تفاصيل القالب" : "استيراد من القوالب"}
                  </h3>
                </div>
                <button
                  onClick={previewTemplate ? () => setPreviewTemplate(null) : onClose}
                  className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
                >
                  {previewTemplate ? (
                    <ChevronLeft className="h-4 w-4 text-theme-secondary" />
                  ) : (
                    <X className="h-4 w-4 text-theme-secondary" />
                  )}
                </button>
              </div>

              {/* Search — only on list view */}
              {!previewTemplate && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="ابحث عن قالب..."
                    className="flex-1 rounded-xl border border-theme-border bg-theme-subtle px-3 py-2 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50"
                    dir="rtl"
                  />
                  <button
                    onClick={handleSearch}
                    className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-colors hover:bg-amber-500/20"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              <AnimatePresence mode="wait">
                {previewTemplate ? (
                  <TemplatePreview
                    key="preview"
                    template={previewTemplate}
                    onImport={handleImport}
                  />
                ) : (
                  <TemplateList
                    key="list"
                    templates={templates}
                    isLoading={isLoading}
                    onSelect={setPreviewTemplate}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Template List ───────────────────────────────────────────────

interface TemplateListProps {
  templates: TemplateResponse[];
  isLoading: boolean;
  onSelect: (t: TemplateResponse) => void;
}

function TemplateList({ templates, isLoading, onSelect }: TemplateListProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-12 text-theme-secondary"
      >
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="mt-2 text-sm">جاري التحميل...</span>
      </motion.div>
    );
  }

  if (templates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-12 text-theme-secondary"
      >
        <BookOpen className="h-8 w-8 opacity-40" />
        <span className="mt-2 text-sm">لا توجد قوالب</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-2"
    >
      {templates.map((template) => (
        <TemplateCard
          key={template._id}
          template={template}
          onClick={() => onSelect(template)}
        />
      ))}
    </motion.div>
  );
}

// ─── Template Card ───────────────────────────────────────────────

interface TemplateCardProps {
  template: TemplateResponse;
  onClick: () => void;
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  const habitCount = template.categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <motion.button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-theme-border bg-theme-subtle/30 px-4 py-3.5 text-start transition-colors hover:bg-theme-subtle/60"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
        <BookOpen className="h-5 w-5 text-amber-500" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-theme-primary">
          {template.name}
        </span>
        {template.description && (
          <span className="truncate text-xs text-theme-secondary">
            {template.description}
          </span>
        )}
        <div className="flex items-center gap-2 text-[10px] text-theme-secondary/70">
          <span>{template.categories.length} أقسام</span>
          <span>·</span>
          <span>{habitCount} عبادة</span>
          <span>·</span>
          <span>{template.authorName}</span>
        </div>
      </div>
      <ChevronLeft className="h-4 w-4 flex-shrink-0 text-theme-secondary/50" />
    </motion.button>
  );
}

// ─── Template Preview ────────────────────────────────────────────

interface TemplatePreviewProps {
  template: TemplateResponse;
  onImport: (t: TemplateResponse) => void;
}

function TemplatePreview({ template, onImport }: TemplatePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-3"
    >
      {/* Info header */}
      <div className="rounded-2xl bg-theme-subtle/40 p-4">
        <h4 className="text-sm font-bold text-theme-primary">
          {template.name}
        </h4>
        {template.description && (
          <p className="mt-1 text-xs leading-relaxed text-theme-secondary">
            {template.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-theme-secondary/70">
          <span>بواسطة {template.authorName}</span>
          <span>·</span>
          <span>{template.usageCount} استخدام</span>
        </div>
      </div>

      {/* Categories & habits */}
      {template.categories.map((cat) => (
        <PreviewCategoryCard key={cat.categoryId} category={cat} />
      ))}

      {/* Import button */}
      <motion.button
        onClick={() => onImport(template)}
        className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-600"
        whileTap={{ scale: 0.98 }}
      >
        <Download className="h-4 w-4" />
        استيراد وتعديل قبل الحفظ
      </motion.button>

      <p className="text-center text-[10px] leading-relaxed text-theme-secondary/70">
        سيتم إضافة عبادات القالب إلى محرر المجموعة لتعديلها قبل الحفظ
      </p>
    </motion.div>
  );
}

// ─── Preview Category Card ───────────────────────────────────────

interface PreviewCategoryCardProps {
  category: TemplateResponse["categories"][number];
}

function PreviewCategoryCard({ category }: PreviewCategoryCardProps) {
  const Icon = getIconComponent(category.icon);

  return (
    <div className="overflow-hidden rounded-2xl border border-theme-border bg-theme-subtle/30">
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
          <Icon className="h-4 w-4 text-amber-500" />
        </div>
        <span className="flex-1 text-sm font-semibold text-theme-primary">
          {category.name}
        </span>
        <span className="rounded-full bg-theme-border px-2 py-0.5 text-[10px] font-medium text-theme-secondary">
          {category.items.length}
        </span>
      </div>
      <ul className="border-t border-theme-border/50">
        {category.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 border-t border-theme-border/30 px-5 py-2 first:border-t-0"
          >
            <span className="flex-1 text-xs text-theme-secondary">
              {item.label}
            </span>
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium ${
                item.type === "number"
                  ? "bg-sky-500/10 text-sky-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {item.type === "number" ? "رقم" : "تحقق"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
