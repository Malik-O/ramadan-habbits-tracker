"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MinusCircle, Plus, Pencil } from "lucide-react";
import type { HabitCategory, HabitItem } from "@/constants/habits";
import { getIconComponent } from "@/utils/iconMap";
import ConfirmDialog from "@/components/ConfirmDialog";

interface CategoryCardProps {
  category: HabitCategory;
  isEditMode: boolean;
  onEditCategory: () => void;
  onRemoveCategory: () => void;
  onAddHabit: () => void;
  onEditHabit: (habit: HabitItem) => void;
  onRemoveHabit: (habitId: string) => void;
}

/** Renders a Lucide icon from an icon key string */
function CategoryIcon({ iconKey }: { iconKey: string }) {
  const Icon = getIconComponent(iconKey);
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10">
      <Icon className="h-4 w-4 text-amber-400" />
    </div>
  );
}

const isCustom = (id: string) => id.startsWith("custom-");

export default function CategoryCard({
  category,
  isEditMode,
  onEditCategory,
  onRemoveCategory,
  onAddHabit,
  onEditHabit,
  onRemoveHabit,
}: CategoryCardProps) {
  const [confirmRemoveCat, setConfirmRemoveCat] = useState(false);
  const [confirmRemoveHabitId, setConfirmRemoveHabitId] = useState<string | null>(
    null
  );

  const habitToRemove = confirmRemoveHabitId
    ? category.items.find((i) => i.id === confirmRemoveHabitId)
    : null;

  const isCustomCategory = isCustom(category.id);

  return (
    <>
      <motion.div
        layout
        className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card"
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      >
        {/* Category header */}
        <div className="flex items-center gap-3 border-b border-theme-border px-4 py-3">
          {/* Delete button (edit mode) - Only for custom categories */}
          {isEditMode && isCustomCategory && (
            <motion.button
              onClick={() => setConfirmRemoveCat(true)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex-shrink-0"
            >
              <MinusCircle className="h-5 w-5 text-red-400 transition-colors hover:text-red-300" />
            </motion.button>
          )}

          <CategoryIcon iconKey={category.icon} />

          <span className="flex-1 text-sm font-semibold text-theme-primary">
            {category.name}
          </span>

          <span className="text-xs text-theme-secondary">
            {category.items.length} عبادة
          </span>

          {/* Edit button - Only for custom categories */}
          {isEditMode && isCustomCategory && (
            <motion.button
              onClick={onEditCategory}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
            >
              <Pencil className="h-3.5 w-3.5 text-theme-secondary" />
            </motion.button>
          )}
        </div>

        {/* Habit items */}
        <div className="divide-y divide-theme-border">
          {category.items.map((item) => (
            <HabitItemRow
              key={item.id}
              item={item}
              isEditMode={isEditMode}
              onEdit={() => onEditHabit(item)}
              onRemove={() => setConfirmRemoveHabitId(item.id)}
            />
          ))}
        </div>

        {/* Add habit button */}
        <button
          onClick={onAddHabit}
          className="flex w-full items-center justify-center gap-2 py-3 text-theme-secondary transition-colors hover:bg-theme-subtle hover:text-amber-400"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs font-medium">إضافة عبادة</span>
        </button>
      </motion.div>

      {/* Confirm remove category */}
      <ConfirmDialog
        isOpen={confirmRemoveCat}
        title="حذف القسم"
        message={`هل أنت متأكد من حذف "${category.name}" وجميع عاداته؟`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={() => {
          setConfirmRemoveCat(false);
          onRemoveCategory();
        }}
        onCancel={() => setConfirmRemoveCat(false)}
      />

      {/* Confirm remove habit */}
      <ConfirmDialog
        isOpen={!!confirmRemoveHabitId}
        title="حذف العبادة"
        message={`هل أنت متأكد من حذف "${habitToRemove?.label ?? ""}"؟`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={() => {
          if (confirmRemoveHabitId) {
            onRemoveHabit(confirmRemoveHabitId);
          }
          setConfirmRemoveHabitId(null);
        }}
        onCancel={() => setConfirmRemoveHabitId(null)}
      />
    </>
  );
}

interface HabitItemRowProps {
  item: HabitItem;
  isEditMode: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

function HabitItemRow({
  item,
  isEditMode,
  onEdit,
  onRemove,
}: HabitItemRowProps) {
  const isCustomHabit = isCustom(item.id);

  return (
    <motion.div layout className="flex items-center gap-3 px-4 py-2.5">
      {/* Delete button - Only for custom habits */}
      {isEditMode && isCustomHabit && (
        <motion.button
          onClick={onRemove}
          initial={{ scale: 0, opacity: 0, width: 0 }}
          animate={{ scale: 1, opacity: 1, width: "auto" }}
          exit={{ scale: 0, opacity: 0, width: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex-shrink-0"
        >
          <MinusCircle className="h-4.5 w-4.5 text-red-400 transition-colors hover:text-red-300" />
        </motion.button>
      )}

      <span className="flex-1 text-sm text-theme-primary">{item.label}</span>

      {/* Type badge */}
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
          item.type === "number"
            ? "bg-sky-500/10 text-sky-400"
            : "bg-emerald-500/10 text-emerald-400"
        }`}
      >
        {item.type === "number" ? "رقم" : "تحقق"}
      </span>

      {/* Edit button - Only for custom habits */}
      {isEditMode && isCustomHabit && (
        <motion.button
          onClick={onEdit}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
        >
          <Pencil className="h-3 w-3 text-theme-secondary" />
        </motion.button>
      )}
    </motion.div>
  );
}

