import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X } from "lucide-react";

interface EditToggleProps {
  isEditing: boolean;
  onToggle: () => void;
}

export default function EditToggle({ isEditing, onToggle }: EditToggleProps) {
  return (
    <div className="flex items-center justify-end px-5 pt-3 pb-1">
      <motion.button
        onClick={onToggle}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
          isEditing
            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            : "bg-theme-subtle text-theme-secondary hover:bg-amber-500/10 hover:text-amber-400"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isEditing ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              <span>إنهاء التعديل</span>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>تعديل</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
