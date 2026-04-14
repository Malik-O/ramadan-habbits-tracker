"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { ChevronDown, Plus, Pencil, Trash2, Folder, GripVertical } from "lucide-react";
import type { HabitCategory, HabitItem } from "@/constants/habits";
import { getIconComponent } from "@/utils/iconMap";
import ConfirmDialog from "@/components/ConfirmDialog";
import FolderHabitRow from "./FolderHabitRow";

// ─── Props ───────────────────────────────────────────────────────

interface FolderCardProps {
  category: HabitCategory;
  defaultOpen?: boolean;
  onEditCategory: () => void;
  onRemoveCategory: () => void;
  onAddHabit: () => void;
  onEditHabit: (habit: HabitItem) => void;
  onRemoveHabit: (habitId: string) => void;
  onReorderHabits: (newItems: HabitItem[]) => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function FolderCard({
  category,
  defaultOpen = false,
  onEditCategory,
  onRemoveCategory,
  onAddHabit,
  onEditHabit,
  onRemoveHabit,
  onReorderHabits,
}: FolderCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const dragControls = useDragControls();
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(false);
  const [confirmDeleteHabitId, setConfirmDeleteHabitId] = useState<string | null>(null);

  const habitToDelete = confirmDeleteHabitId
    ? category.items.find((i) => i.id === confirmDeleteHabitId)
    : null;

  const IconComponent = getIconComponent(category.icon);

  return (
    <>
      <Reorder.Item
        value={category}
        dragListener={false}
        dragControls={dragControls}
        layout
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card"
      >
        {/* ── Folder Header ───────────────────────────────────── */}
        <FolderHeader
          name={category.name}
          itemCount={category.items.length}
          isOpen={isOpen}
          dragControls={dragControls}
          icon={<IconComponent className="h-4 w-4 text-amber-400" />}
          onToggle={() => setIsOpen((p) => !p)}
          onEdit={onEditCategory}
          onDelete={() => setConfirmDeleteCat(true)}
        />

        {/* ── Folder Body (habits) ────────────────────────────── */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-theme-border">
                {category.items.length === 0 ? (
                  <EmptyFolderMessage />
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={category.items}
                    onReorder={onReorderHabits}
                    className="divide-y divide-[#00000020]"
                  >
                    {category.items.map((item) => (
                      <FolderHabitRow
                        key={item.id}
                        item={item}
                        onEdit={() => onEditHabit(item)}
                        onDelete={() => setConfirmDeleteHabitId(item.id)}
                      />
                    ))}
                  </Reorder.Group>
                )}

                {/* Add habit button */}
                <button
                  onClick={onAddHabit}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-[#00000020] py-2.5 text-theme-secondary/60 transition-colors hover:bg-amber-500/5 hover:text-amber-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">إضافة عبادة</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Reorder.Item>

      {/* ── Confirm: Delete Category ──────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmDeleteCat}
        title="حذف القسم"
        message={`هل أنت متأكد من حذف "${category.name}" وجميع عباداته؟`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={() => {
          setConfirmDeleteCat(false);
          onRemoveCategory();
        }}
        onCancel={() => setConfirmDeleteCat(false)}
      />

      {/* ── Confirm: Delete Habit ─────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!confirmDeleteHabitId}
        title="حذف العبادة"
        message={`هل أنت متأكد من حذف "${habitToDelete?.label ?? ""}"؟`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteHabitId) onRemoveHabit(confirmDeleteHabitId);
          setConfirmDeleteHabitId(null);
        }}
        onCancel={() => setConfirmDeleteHabitId(null)}
      />
    </>
  );
}

// ─── FolderHeader ────────────────────────────────────────────────

interface FolderHeaderProps {
  name: string;
  itemCount: number;
  isOpen: boolean;
  icon: React.ReactNode;
  dragControls: any;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function FolderHeader({
  name,
  itemCount,
  isOpen,
  icon,
  dragControls,
  onToggle,
  onEdit,
  onDelete,
}: FolderHeaderProps) {
  return (
    <div className="flex items-center gap-0 px-1 py-1">
      {/* Drag handle */}
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          dragControls.start(e);
        }}
        className="flex h-8 w-6 cursor-grab touch-none items-center justify-center rounded-lg text-theme-secondary/30 transition-colors hover:text-theme-secondary/60 active:cursor-grabbing"
        title="اسحب لإعادة ترتيب القسم"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Clickable area: icon + name + count + chevron */}
      <button
        onClick={onToggle}
        className="flex flex-1 cursor-pointer items-center gap-3 py-3 pr-3 pl-3 transition-colors"
      >
        {/* Folder icon */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 transition-colors">
          {icon}
        </div>

        {/* Name & count */}
        <div className="flex flex-1 flex-col items-start">
          <span className="text-sm font-semibold text-theme-primary">
            {name}
          </span>
          <span className="text-[11px] text-theme-secondary/70">
            {itemCount} {itemCount === 1 ? "عبادة" : "عبادات"}
          </span>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-theme-secondary/50" />
        </motion.div>
      </button>

      {/* Action buttons (always visible) */}
      <div className="flex items-center gap-0.5 pl-2 pr-2">
        <button
          onClick={onEdit}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-theme-secondary/40 transition-colors hover:bg-amber-500/10 hover:text-amber-400"
          title="تعديل القسم"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-theme-secondary/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
          title="حذف القسم"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── EmptyFolderMessage ──────────────────────────────────────────

function EmptyFolderMessage() {
  return (
    <div className="flex flex-col items-center gap-1 py-6 text-center">
      <Folder className="h-8 w-8 text-theme-secondary/20" />
      <p className="text-xs text-theme-secondary/50">هذا القسم فارغ</p>
    </div>
  );
}
