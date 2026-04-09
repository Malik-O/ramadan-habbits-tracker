"use client";

import { useState } from "react";
import { Reorder, useDragControls, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, CheckCircle2, Hash, MoreHorizontal, GripVertical } from "lucide-react";
import type { HabitItem } from "@/constants/habits";

// ─── Constants ───────────────────────────────────────────────────

const REPEAT_LABELS: Record<string, string> = {
  daily: "يومياً",
  weekly: "أسبوعياً",
  biweekly: "كل أسبوعين",
  monthly: "شهرياً",
  yearly: "سنوياً",
};

// ─── Props ───────────────────────────────────────────────────────

interface FolderHabitRowProps {
  item: HabitItem;
  onEdit: () => void;
  onDelete: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function FolderHabitRow({
  item,
  onEdit,
  onDelete,
}: FolderHabitRowProps) {
  const [showActions, setShowActions] = useState(false);
  const dragControls = useDragControls();

  const repeatValue = item.repeat || "daily";
  const showRepeatBadge = repeatValue !== "daily";

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="group relative flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-white/[0.02]"
      style={{ touchAction: "none" }}
    >
      {/* Drag handle */}
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          dragControls.start(e);
        }}
        className="flex h-6 w-5 flex-shrink-0 cursor-grab touch-none items-center justify-center rounded text-theme-secondary/25 transition-colors hover:text-theme-secondary/60 active:cursor-grabbing"
        title="اسحب لإعادة الترتيب"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Type indicator dot */}
      <div
        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
          item.type === "number" ? "bg-sky-400" : "bg-emerald-400"
        }`}
      />

      {/* Label + repeat badge */}
      <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
        <span className="text-sm text-theme-primary leading-snug">{item.label}</span>
        {showRepeatBadge && (
          <span className="inline-flex w-fit rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-violet-400">
            {REPEAT_LABELS[repeatValue]}
          </span>
        )}
      </div>

      {/* Type badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
            item.type === "number"
              ? "bg-sky-500/10 text-sky-400"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {item.type === "number" ? (
            <>
              <Hash className="h-2.5 w-2.5" />
              {item.goal ? `رقم (${item.goal})` : "رقم"}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-2.5 w-2.5" />
              تحقق
            </>
          )}
        </span>
      </div>

      {/* Actions toggle */}
      <button
        onClick={() => setShowActions((prev) => !prev)}
        className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg text-theme-secondary/50 transition-colors hover:bg-theme-subtle hover:text-theme-secondary"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {/* Inline action buttons */}
      <AnimatePresence>
        {showActions && (
          <Reorder.Item
            value={item}
            as="div"
            dragListener={false}
            style={{}}
            className="flex items-center gap-1 overflow-hidden"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={() => {
                setShowActions(false);
                onEdit();
              }}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 transition-colors hover:bg-amber-500/20"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setShowActions(false);
                onDelete();
              }}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </Reorder.Item>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
