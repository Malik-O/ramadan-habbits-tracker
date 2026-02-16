"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Delete } from "lucide-react";

interface NumpadModalProps {
  isOpen: boolean;
  label: string;
  currentValue: number;
  onConfirm: (value: number) => void;
  onClose: () => void;
}

const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;

export default function NumpadModal({
  isOpen,
  label,
  currentValue,
  onConfirm,
  onClose,
}: NumpadModalProps) {
  const [inputValue, setInputValue] = useState(String(currentValue || ""));

  const handleKeyPress = useCallback((key: string) => {
    setInputValue((prev) => {
      const next = prev + key;
      // Limit to 5 digits
      return next.length <= 5 ? next : prev;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setInputValue("");
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(parseInt(inputValue, 10) || 0);
    onClose();
  }, [inputValue, onConfirm, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-t-3xl border border-theme-border bg-theme-card p-5 shadow-2xl sm:rounded-3xl"
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-theme-primary">
                {label}
              </h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
              >
                <X className="h-4 w-4 text-theme-secondary" />
              </button>
            </div>

            {/* Display */}
            <div className="mb-5 rounded-2xl bg-theme-subtle px-4 py-4 text-center">
              <span className="text-4xl font-bold tabular-nums text-amber-500">
                {inputValue || "0"}
              </span>
            </div>

            {/* Numpad grid */}
            <div className="mb-3 grid grid-cols-3 gap-2">
              {NUMPAD_KEYS.slice(0, 9).map((key) => (
                <NumpadKey key={key} value={key} onPress={handleKeyPress} />
              ))}
              <button
                onClick={handleClear}
                className="flex h-14 items-center justify-center rounded-xl bg-theme-subtle text-sm font-medium text-theme-secondary transition-all active:scale-95"
              >
                C
              </button>
              <NumpadKey value="0" onPress={handleKeyPress} />
              <button
                onClick={handleDelete}
                className="flex h-14 items-center justify-center rounded-xl bg-theme-subtle text-theme-secondary transition-all active:scale-95"
              >
                <Delete className="h-5 w-5" />
              </button>
            </div>

            {/* Confirm */}
            <motion.button
              onClick={handleConfirm}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl bg-amber-500 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-400"
            >
              تأكيد
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NumpadKey({
  value,
  onPress,
}: {
  value: string;
  onPress: (key: string) => void;
}) {
  return (
    <motion.button
      onClick={() => onPress(value)}
      whileTap={{ scale: 0.9 }}
      className="flex h-14 items-center justify-center rounded-xl bg-theme-subtle text-xl font-semibold text-theme-primary transition-all hover:bg-theme-border active:bg-amber-500/20"
    >
      {value}
    </motion.button>
  );
}
