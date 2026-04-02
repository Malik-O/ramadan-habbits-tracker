"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, RefreshCw, Check, Minus, AlertTriangle, ChevronUp } from "lucide-react";
import type { TemplateCategory, TemplateHabitItem } from "@/services/api";
import { getIconComponent } from "@/utils/iconMap";

// ─── Types ───────────────────────────────────────────────────────

/** Tracks which habit items are selected, keyed by categoryId → Set of item ids */
export type SelectionMap = Record<string, Set<string>>;

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "merge" | "replace";
  templateName: string;
  categories: TemplateCategory[];
  onConfirm: (selection: SelectionMap) => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function TemplateSelectionModal({
  isOpen,
  onClose,
  mode,
  templateName,
  categories,
  onConfirm,
}: TemplateSelectionModalProps) {
  const [selection, setSelection] = useState<SelectionMap>(() =>
    buildFullSelection(categories)
  );

  // Reset selection to full whenever modal opens with new data
  const resetSelection = useCallback(() => {
    setSelection(buildFullSelection(categories));
  }, [categories]);

  const totalSelected = useMemo(
    () => Object.values(selection).reduce((sum, set) => sum + set.size, 0),
    [selection]
  );

  const totalItems = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories]
  );

  const allSelected = totalSelected === totalItems;
  const noneSelected = totalSelected === 0;

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      setSelection({});
    } else {
      setSelection(buildFullSelection(categories));
    }
  }, [allSelected, categories]);

  const handleToggleCategory = useCallback(
    (categoryId: string, items: TemplateHabitItem[]) => {
      setSelection((prev) => {
        const currentSet = prev[categoryId] ?? new Set<string>();
        const allInCategory = items.every((item) => currentSet.has(item.id));

        if (allInCategory) {
          // Deselect all in category
          const next = { ...prev };
          delete next[categoryId];
          return next;
        } else {
          // Select all in category
          return {
            ...prev,
            [categoryId]: new Set(items.map((item) => item.id)),
          };
        }
      });
    },
    []
  );

  const handleToggleItem = useCallback(
    (categoryId: string, itemId: string) => {
      setSelection((prev) => {
        const currentSet = new Set(prev[categoryId] ?? []);
        if (currentSet.has(itemId)) {
          currentSet.delete(itemId);
        } else {
          currentSet.add(itemId);
        }

        const next = { ...prev };
        if (currentSet.size === 0) {
          delete next[categoryId];
        } else {
          next[categoryId] = currentSet;
        }
        return next;
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    onConfirm(selection);
    onClose();
  }, [onConfirm, onClose, selection]);

  const isMerge = mode === "merge";

  return (
    <AnimatePresence onExitComplete={resetSelection}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            className="relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl border border-theme-border bg-theme-card shadow-2xl sm:max-h-[80vh] sm:max-w-md sm:rounded-2xl"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-theme-border p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 pl-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      isMerge
                        ? "bg-amber-500/10"
                        : "bg-orange-500/10"
                    }`}
                  >
                    {isMerge ? (
                      <Download className="h-4 w-4 text-amber-500" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-theme-primary">
                    {isMerge ? "دمج القالب" : "استبدال بالقالب"}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
                >
                  <X className="h-4 w-4 text-theme-secondary" />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-theme-secondary">
                {isMerge
                  ? `اختر العبادات التي تريد إضافتها من "${templateName}"`
                  : `اختر العبادات التي تريد استبدال عباداتك بها من "${templateName}"`}
              </p>
            </div>

            {/* Select All */}
            <div className="flex-shrink-0 border-b border-theme-border px-5 py-3">
              <SelectAllRow
                checked={allSelected}
                indeterminate={!allSelected && !noneSelected}
                totalSelected={totalSelected}
                totalItems={totalItems}
                onToggle={handleToggleAll}
              />
            </div>

            {/* Scrollable Category List */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <CategorySelectionCard
                    key={cat.categoryId}
                    category={cat}
                    selectedItems={selection[cat.categoryId] ?? new Set()}
                    onToggleCategory={handleToggleCategory}
                    onToggleItem={handleToggleItem}
                  />
                ))}
              </div>
            </div>

            {/* Warning Message for Replace Mode */}
            {!isMerge && (
              <div className="flex-shrink-0 bg-red-500/5 px-4 py-2 border-t border-red-500/10">
                <div className="flex items-center justify-center gap-1.5 text-red-500/90 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  <p className="text-[10px] leading-none">
                    سيتم حذف جميع عباداتك الحالية واستبدالها بالمحدد
                  </p>
                </div>
              </div>
            )}

            {/* Actions (Sticky to bottom) */}
            <div className="flex-shrink-0 flex border-t border-theme-border bg-theme-card relative pb-safe sm:pb-0">
              <button
                onClick={onClose}
                className="flex-1 cursor-pointer border-l border-theme-border py-3.5 text-sm font-medium text-theme-secondary transition-colors hover:bg-theme-subtle"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirm}
                disabled={noneSelected}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isMerge
                    ? "text-amber-500 hover:bg-amber-500/5"
                    : "text-red-500 hover:bg-red-500/5"
                }`}
              >
                {isMerge ? (
                  <Download className="h-4 w-4" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isMerge ? "دمج المحدد" : "استبدال بالمحدد"}
                <span className={`rounded-md px-1.5 py-0.5 text-[9px] ${
                  isMerge ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                }`}>
                  {totalSelected}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Select All Row ──────────────────────────────────────────────

interface SelectAllRowProps {
  checked: boolean;
  indeterminate: boolean;
  totalSelected: number;
  totalItems: number;
  onToggle: () => void;
}

function SelectAllRow({
  checked,
  indeterminate,
  totalSelected,
  totalItems,
  onToggle,
}: SelectAllRowProps) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-theme-subtle/50"
    >
      <CheckboxIcon checked={checked} indeterminate={indeterminate} />
      <span className="text-sm font-semibold text-theme-primary">تحديد الكل</span>
      <span className="mr-auto rounded-full bg-theme-subtle px-2.5 py-0.5 text-[10px] font-medium text-theme-secondary">
        {totalSelected} / {totalItems}
      </span>
    </button>
  );
}

// ─── Category Card ───────────────────────────────────────────────

interface CategorySelectionCardProps {
  category: TemplateCategory;
  selectedItems: Set<string>;
  onToggleCategory: (categoryId: string, items: TemplateHabitItem[]) => void;
  onToggleItem: (categoryId: string, itemId: string) => void;
}

function CategorySelectionCard({
  category,
  selectedItems,
  onToggleCategory,
  onToggleItem,
}: CategorySelectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = getIconComponent(category.icon);
  const allInCategorySelected = category.items.every((item) =>
    selectedItems.has(item.id)
  );
  const someInCategorySelected =
    !allInCategorySelected && category.items.some((item) => selectedItems.has(item.id));

  return (
    <div className="overflow-hidden rounded-2xl border border-theme-border bg-theme-subtle/30">
      {/* Category Header */}
      <div className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-theme-subtle/50">
        <button
          onClick={() => onToggleCategory(category.categoryId, category.items)}
          className="flex items-center justify-center cursor-pointer"
        >
          <CheckboxIcon
            checked={allInCategorySelected}
            indeterminate={someInCategorySelected}
          />
        </button>
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-1 items-center gap-3 cursor-pointer text-start"
        >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Icon className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-sm font-semibold text-theme-primary flex-1">
              {category.name}
            </span>
            <span className="rounded-full bg-theme-border px-2 py-0.5 text-[10px] font-medium text-theme-secondary">
              {selectedItems.size} / {category.items.length}
            </span>
            <ChevronUp className={`h-4 w-4 text-theme-secondary transition-transform ${isExpanded ? "" : "rotate-180"}`} />
        </button>
      </div>

      {/* Habit Items */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#00000020] overflow-hidden"
          >
            {category.items.map((item) => (
              <HabitSelectionRow
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onToggle={() => onToggleItem(category.categoryId, item.id)}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Habit Row ───────────────────────────────────────────────────

interface HabitSelectionRowProps {
  item: TemplateHabitItem;
  isSelected: boolean;
  onToggle: () => void;
}

function HabitSelectionRow({ item, isSelected, onToggle }: HabitSelectionRowProps) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-3 border-t border-[#00000010] px-5 py-2.5 transition-colors first:border-t-0 hover:bg-theme-subtle/40"
    >
      <CheckboxIcon checked={isSelected} indeterminate={false} />
      <span
        className={`flex-1 text-start text-sm transition-colors ${
          isSelected ? "text-theme-primary" : "text-theme-secondary/60"
        }`}
      >
        {item.label}
      </span>
      <span
        className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${
          item.type === "number"
            ? "bg-sky-500/10 text-sky-500"
            : "bg-emerald-500/10 text-emerald-500"
        }`}
      >
        {item.type === "number" ? "رقم" : "تحقق"}
      </span>
    </button>
  );
}

// ─── Checkbox Icon ───────────────────────────────────────────────

interface CheckboxIconProps {
  checked: boolean;
  indeterminate: boolean;
}

function CheckboxIcon({ checked, indeterminate }: CheckboxIconProps) {
  return (
    <div
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
        checked
          ? "border-amber-500 bg-amber-500 shadow-sm shadow-amber-500/30"
          : indeterminate
            ? "border-amber-500/60 bg-amber-500/20"
            : "border-theme-border bg-transparent"
      }`}
    >
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      {indeterminate && !checked && (
        <Minus className="h-3 w-3 text-amber-500" strokeWidth={3} />
      )}
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────

/** Build a full selection map (every item selected) */
function buildFullSelection(categories: TemplateCategory[]): SelectionMap {
  const map: SelectionMap = {};
  for (const cat of categories) {
    if (cat.items.length > 0) {
      map[cat.categoryId] = new Set(cat.items.map((item) => item.id));
    }
  }
  return map;
}
