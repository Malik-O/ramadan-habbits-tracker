"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import TemplateHubSection from "@/components/manage/TemplateHubSection";

export default function TemplatesPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-theme-primary">مركز القوالب</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-4">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
          <TemplateHubSection currentUserUid={user?.uid ?? null} />
        </motion.div>
      </div>

      <BottomNav activeTab="templates" />
    </div>
  );
}
