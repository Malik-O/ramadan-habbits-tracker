"use client";

import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import TemplateHubSection from "@/components/manage/TemplateHubSection";
import SignInPrompt from "@/components/SignInPrompt";
import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";

export default function TemplatesPage() {
  const { user, isLoading } = useAuth();

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
      <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-4">
        {isLoading ? (
          <PageLoadingSkeleton />
        ) : user ? (
          <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
          >
            <TemplateHubSection currentUserUid={user.uid} />
          </motion.div>
        ) : (
          <div className="flex flex-1 flex-col justify-center py-10">
            <SignInPrompt
              title="مركز القوالب"
              description="سجّل دخولك لمشاركة قوالبك الخاصة واكتشاف قوالب الآخرين"
              icon={<Copy className="h-12 w-12 text-amber-500" />}
            />
          </div>
        )}
      </div>

      <BottomNav activeTab="templates" />
    </div>
  );
}
