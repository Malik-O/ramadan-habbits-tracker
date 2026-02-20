"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

interface LeaderboardErrorProps {
  message: string;
  onRetry: () => void;
}

export default function LeaderboardError({ message, onRetry }: LeaderboardErrorProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <motion.div
        className="flex flex-col items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-red-400">{message}</p>
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-theme-subtle px-4 py-2 text-xs font-medium text-theme-primary transition-colors hover:bg-theme-border"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </motion.div>
    </div>
  );
}
