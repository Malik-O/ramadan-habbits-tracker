"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Upload, FolderPlus, Loader2, FileText, Pencil, ChevronUp } from "lucide-react";
import { useCustomHabits, type RepeatSchedule } from "@/hooks/useCustomHabits";
import { useCategoryEditorModals } from "@/hooks/useCategoryEditorModals";
import type { HabitCategory, HabitItem } from "@/constants/habits";
import { createTemplate, type TemplateCategory } from "@/services/api";
import FolderCard from "@/components/manage/FolderCard";
import CategoryFormModal from "@/components/manage/CategoryFormModal";
import HabitFormModal from "@/components/manage/HabitFormModal";
import BottomNav from "@/components/BottomNav";

// ─── Helpers ─────────────────────────────────────────────────────

function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toTemplateCategories(categories: HabitCategory[]): TemplateCategory[] {
  return categories.map((cat) => ({
    categoryId: cat.id,
    name: cat.name,
    icon: cat.icon,
    items: cat.items.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      repeat: item.repeat || "daily",
      repeatDays: item.repeatDays,
      repeatMonthDay: item.repeatMonthDay,
      repeatMonthHijri: item.repeatMonthHijri,
      repeatYearlyDate: item.repeatYearlyDate,
      repeatYearlyHijri: item.repeatYearlyHijri,
      repeatEndDate: item.repeatEndDate,
    })),
  }));
}

export default function PublishTemplatePage() {
  const router = useRouter();
  const { categories: userCategories } = useCustomHabits();

  // Local copy of categories (editable, does NOT mutate user's habits)
  const [categories, setCategories] = useState<HabitCategory[]>(() =>
    JSON.parse(JSON.stringify(userCategories))
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editBeforePublish, setEditBeforePublish] = useState(false);

  // ── Local category mutations ───────────────────────────────
  const mutations = useMemo(
    () => ({
      addCategory: (catName: string, icon: string) => {
        setCategories((prev) => [
          ...prev,
          { id: generateId(), name: catName, icon, items: [] },
        ]);
      },
      updateCategory: (id: string, catName: string, icon: string) => {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: catName, icon } : c))
        );
      },
      removeCategory: (id: string) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      },
      addHabit: (
        catId: string,
        label: string,
        type: "boolean" | "number",
        schedule?: RepeatSchedule
      ) => {
        const newItem: HabitItem = {
          id: generateId(),
          label,
          type,
          repeat: schedule?.repeat || "daily",
          repeatDays: schedule?.repeatDays,
          repeatMonthDay: schedule?.repeatMonthDay,
          repeatMonthHijri: schedule?.repeatMonthHijri,
          repeatYearlyDate: schedule?.repeatYearlyDate,
          repeatYearlyHijri: schedule?.repeatYearlyHijri,
          repeatEndDate: schedule?.repeatEndDate,
        };
        setCategories((prev) =>
          prev.map((c) =>
            c.id === catId ? { ...c, items: [...c.items, newItem] } : c
          )
        );
      },
      updateHabit: (
        catId: string,
        habitId: string,
        label: string,
        type: "boolean" | "number",
        schedule?: RepeatSchedule
      ) => {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  items: c.items.map((item) =>
                    item.id === habitId
                      ? {
                          ...item,
                          label,
                          type,
                          repeat: schedule?.repeat || "daily",
                          repeatDays: schedule?.repeatDays,
                          repeatMonthDay: schedule?.repeatMonthDay,
                          repeatMonthHijri: schedule?.repeatMonthHijri,
                          repeatYearlyDate: schedule?.repeatYearlyDate,
                          repeatYearlyHijri: schedule?.repeatYearlyHijri,
                          repeatEndDate: schedule?.repeatEndDate,
                        }
                      : item
                  ),
                }
              : c
          )
        );
      },
      removeHabit: (catId: string, habitId: string) => {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === catId
              ? { ...c, items: c.items.filter((i) => i.id !== habitId) }
              : c
          )
        );
      },
    }),
    []
  );

  // Shared modal orchestration
  const editor = useCategoryEditorModals(mutations);

  // ── Publish handler ────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (!name.trim() || isPublishing) return;
    setIsPublishing(true);
    setError(null);
    try {
      await createTemplate({
        name: name.trim(),
        description: description.trim(),
        categories: toTemplateCategories(categories),
      });
      router.push("/manage");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل نشر القالب";
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  }, [name, description, categories, isPublishing, router]);

  const totalHabits = categories.reduce((sum, c) => sum + c.items.length, 0);
  const canPublish = name.trim().length > 0 && categories.length > 0;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-24">
      {/* Header */}
      <PublishHeader onBack={() => router.back()} />

      <div className="flex flex-col gap-4 px-4 pt-4">
        {/* Template info card */}
        <TemplateInfoCard
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
        />

        {/* Summary + Edit toggle */}
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-l from-amber-500/5 to-transparent px-4 py-2.5">
          <span className="text-xs text-theme-secondary">
            {categories.length} أقسام · {totalHabits} عبادة
          </span>
          <button
            onClick={() => setEditBeforePublish((p) => !p)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
              editBeforePublish
                ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                : "bg-theme-subtle text-theme-secondary hover:text-theme-primary"
            }`}
          >
            {editBeforePublish ? (
              <>
                <ChevronUp className="h-3 w-3" />
                إخفاء
              </>
            ) : (
              <>
                <Pencil className="h-3 w-3" />
                تعديل قبل النشر
              </>
            )}
          </button>
        </div>

        {/* Editable folder section (toggled) */}
        <AnimatePresence initial={false}>
          {editBeforePublish && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              {/* Folder cards */}
              <AnimatePresence mode="popLayout">
                {categories.map((category) => (
                  <FolderCard
                    key={category.id}
                    category={category}
                    defaultOpen
                    onEditCategory={() => editor.handleEditCategory(category)}
                    onRemoveCategory={() =>
                      editor.handleRemoveCategory(category.id)
                    }
                    onAddHabit={() => editor.handleAddHabit(category.id)}
                    onEditHabit={(habit) =>
                      editor.handleEditHabit(category.id, habit)
                    }
                    onRemoveHabit={(habitId) =>
                      editor.handleRemoveHabit(category.id, habitId)
                    }
                  />
                ))}
              </AnimatePresence>

              {/* Add folder */}
              <motion.button
                onClick={editor.handleAddCategory}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-theme-border/50 py-4 text-theme-secondary/60 transition-colors hover:border-amber-500/40 hover:text-amber-400"
                whileTap={{ scale: 0.98 }}
              >
                <FolderPlus className="h-5 w-5" />
                <span className="text-sm font-medium">إضافة قسم جديد</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Publish button */}
        <motion.button
          onClick={handlePublish}
          disabled={!canPublish || isPublishing}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري النشر...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              نشر القالب
            </>
          )}
        </motion.button>
      </div>

      {/* Shared modals (reused from manage page) */}
      <CategoryFormModal
        isOpen={editor.categoryModalOpen}
        onClose={editor.closeCategoryModal}
        onSubmit={editor.handleCategorySubmit}
        initialValues={editor.editingCategory}
      />

      <HabitFormModal
        isOpen={editor.habitModalOpen}
        onClose={editor.closeHabitModal}
        onSubmit={editor.handleHabitSubmit}
        initialValues={editor.editingHabit}
      />

      <BottomNav activeTab="manage" />
    </div>
  );
}

// ─── PublishHeader ───────────────────────────────────────────────

interface PublishHeaderProps {
  onBack: () => void;
}

function PublishHeader({ onBack }: PublishHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-theme-primary">نشر قالب جديد</h1>
      </div>
    </header>
  );
}

// ─── TemplateInfoCard ────────────────────────────────────────────

interface TemplateInfoCardProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

function TemplateInfoCard({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: TemplateInfoCardProps) {
  return (
    <div className="rounded-2xl border border-theme-border bg-theme-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-semibold text-theme-primary">
          معلومات القالب
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
            اسم القالب <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="مثال: عادات رمضان المكثفة"
            autoFocus
            className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
            وصف القالب (اختياري)
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="صف محتوى هذا القالب..."
            rows={2}
            className="w-full resize-none rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
          />
        </div>

        <p className="text-[11px] leading-relaxed text-theme-secondary/60">
          يمكنك تعديل الأقسام والعادات أدناه قبل النشر. التغييرات هنا لن تؤثر على عاداتك الشخصية.
        </p>
      </div>
    </div>
  );
}
