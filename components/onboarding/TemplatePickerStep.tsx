"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Download,
  ChevronDown,
  ChevronUp,
  Search,
  User,
  Loader2,
  Star,
} from "lucide-react";
import { HABIT_CATEGORIES } from "@/constants/habits";
import { listTemplates, type TemplateResponse } from "@/services/api";

// ─── Constants ───────────────────────────────────────────────────

/** Number of community templates to show per page */
const PAGE_SIZE = 5;

/** Special ID used for the built-in default template */
const DEFAULT_TEMPLATE_ID = "__default__";

// ─── Default Template Preview ────────────────────────────────────

interface DefaultTemplateCardProps {
  isSelected: boolean;
  onSelect: () => void;
}

function DefaultTemplateCard({ isSelected, onSelect }: DefaultTemplateCardProps) {
  const totalHabits = HABIT_CATEGORIES.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <motion.div
      layout
      className={`w-full overflow-hidden rounded-2xl border transition-all ${
        isSelected
          ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20"
          : "border-theme-border bg-theme-card"
      }`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={onSelect}
        className="w-full cursor-pointer px-4 py-3.5 text-right"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-semibold text-theme-primary">
                القالب الافتراضي
              </h4>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-theme-secondary">
              قالب شامل يغطي جميع أوقات الصلاة والأذكار والعبادات اليومية
            </p>
          </div>

          {/* Selection indicator */}
          <SelectionDot isSelected={isSelected} />
        </div>

        {/* Meta */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-theme-secondary">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {HABIT_CATEGORIES.length} قسم · {totalHabits} عبادة
          </span>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Community Template Card ─────────────────────────────────────

interface TemplatePreviewCardProps {
  template: TemplateResponse;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplatePreviewCard({
  template,
  isSelected,
  onSelect,
}: TemplatePreviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const totalHabits = template.categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <motion.div
      layout
      className={`w-full overflow-hidden rounded-2xl border text-right transition-all ${
        isSelected
          ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20"
          : "border-theme-border bg-theme-card"
      }`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={onSelect}
        className="w-full cursor-pointer px-4 py-3 text-right"
      >
        <div className="flex items-center justify-between">
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

          <SelectionDot isSelected={isSelected} />
        </div>

        {/* Meta */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-theme-secondary">
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
            {template.usageCount}
          </span>
        </div>
      </button>

      {/* Expand/collapse categories */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-center gap-1 border-t border-theme-border py-1.5 text-[11px] text-theme-secondary transition-colors hover:text-theme-primary"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3 w-3" />
            إخفاء الأقسام
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            عرض الأقسام
          </>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-theme-border"
          >
            <div className="px-4 py-2.5">
              {template.categories.map((cat) => (
                <div key={cat.categoryId} className="mb-2 last:mb-0">
                  <p className="text-xs font-semibold text-theme-primary">
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-theme-secondary">
                    {cat.items.map((i) => i.label).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Selection Dot ───────────────────────────────────────────────

function SelectionDot({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
        isSelected ? "border-amber-500 bg-amber-500" : "border-theme-border"
      }`}
    >
      {isSelected && (
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-3 w-3 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      )}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────

interface TemplatePickerStepProps {
  /** Called with the selected template (or null for default) */
  onContinue: (template: TemplateResponse | null) => void;
  onSkip: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function TemplatePickerStep({
  onContinue,
  onSkip,
}: TemplatePickerStepProps) {
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  /** DEFAULT_TEMPLATE_ID = built-in, otherwise a community template _id */
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_TEMPLATE_ID);

  // ── Fetch templates ──
  const fetchTemplates = useCallback(
    async (search = "", page = 1, append = false) => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const result = await listTemplates(page, PAGE_SIZE, search);
        setTemplates((prev) =>
          append ? [...prev, ...result.templates] : result.templates
        );
        setHasMore(result.page < result.totalPages);
        setCurrentPage(result.page);
      } catch {
        // Silently fail — user still has the default template
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Debounced search
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTemplates(searchQuery, 1, false);
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery, fetchTemplates]);

  const handleLoadMore = () => {
    fetchTemplates(searchQuery, currentPage + 1, true);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const selectedTemplate =
    selectedId === DEFAULT_TEMPLATE_ID
      ? null
      : templates.find((t) => t._id === selectedId) ?? null;

  return (
    <motion.div
      key="templates"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-dvh flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10"
        >
          <Layers className="h-5 w-5 text-amber-500" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 text-xl font-bold text-theme-primary"
        >
          اختر قالبًا لتبدأ
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-1.5 text-sm leading-relaxed text-theme-secondary"
        >
          ابدأ بالقالب الافتراضي أو اختر واحدًا من قوالب المجتمع
        </motion.p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Default template — always visible, pre-selected */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <DefaultTemplateCard
            isSelected={selectedId === DEFAULT_TEMPLATE_ID}
            onSelect={() => handleSelect(DEFAULT_TEMPLATE_ID)}
          />
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="my-4 flex items-center gap-3"
        >
          <div className="h-px flex-1 bg-theme-border" />
          <span className="text-xs font-medium text-theme-secondary">
            أو اختر من قوالب المجتمع
          </span>
          <div className="h-px flex-1 bg-theme-border" />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-3"
        >
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" />
            <input
              id="onboarding-template-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قالب..."
              className="w-full rounded-xl border border-theme-border bg-theme-subtle py-2.5 pr-10 pl-4 text-sm text-theme-primary placeholder:text-theme-secondary/50 outline-none transition-colors focus:border-amber-400/40"
            />
          </div>
        </motion.div>

        {/* Community Template List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <p className="mt-2 text-xs text-theme-secondary">
              جارِ تحميل القوالب...
            </p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Layers className="h-8 w-8 text-theme-secondary/30" />
            <p className="mt-2 text-sm text-theme-secondary">
              لا توجد قوالب متاحة حاليًا
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            {templates.map((template) => (
              <TemplatePreviewCard
                key={template._id}
                template={template}
                isSelected={selectedId === template._id}
                onSelect={() => handleSelect(template._id)}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-theme-border py-3 text-xs font-medium text-theme-secondary transition-all hover:border-amber-500/40 hover:text-amber-500 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "عرض المزيد"
                )}
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="sticky bottom-0 flex flex-col gap-2 bg-theme-bg px-6 pb-8 pt-4">
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          onClick={() => onContinue(selectedTemplate)}
          className="w-full cursor-pointer rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-[0.98]"
        >
          {selectedId === DEFAULT_TEMPLATE_ID
            ? "متابعة بالقالب الافتراضي"
            : "متابعة بهذا القالب"}
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onSkip}
          className="w-full cursor-pointer rounded-2xl py-2.5 text-xs font-medium text-theme-secondary transition-colors hover:text-theme-primary"
        >
          تخطّي
        </motion.button>
      </div>
    </motion.div>
  );
}
