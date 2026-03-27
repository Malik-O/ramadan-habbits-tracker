"use client";

import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface SignInPromptProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function SignInPrompt({ title, description, icon }: SignInPromptProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      {/* Animated icon container */}
      <motion.div
        className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-400/10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-xl font-extrabold text-theme-primary">
          {title}
        </h2>
        <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-theme-secondary">
          {description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
      >
        <Link
          href="/profile"
          className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-amber-300 active:scale-95"
        >
          <LogIn className="h-4 w-4" />
          <span>تسجيل الدخول</span>
        </Link>
      </motion.div>
    </div>
  );
}
