"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export default function AnimatedCheckbox({
  checked,
  onToggle,
}: AnimatedCheckboxProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      className={`relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
        checked
          ? "border-emerald-500 bg-emerald-500 shadow-md shadow-emerald-500/25"
          : "border-theme-checkbox-border bg-transparent hover:border-emerald-400/50"
      }`}
      aria-label="Toggle habit"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      </motion.div>

      {/* Ripple on check */}
      {checked && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-emerald-400"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.button>
  );
}
