"use client";

import { motion } from "framer-motion";
import { Heart, Github, Info } from "lucide-react";

export default function Footer() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-1 text-xs text-theme-secondary">
        <span>صنع بـ</span>
        <Heart className="h-3 w-3 text-red-400" />
        <span>لشهر رمضان المبارك</span>
      </div>
      <div className="flex items-center gap-3">
        <Info className="h-3.5 w-3.5 text-theme-secondary" />
        <Github className="h-3.5 w-3.5 text-theme-secondary" />
      </div>
    </motion.div>
  );
}
