"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookTemplate, Search, Upload, Loader2 } from "lucide-react";
import { useTemplateHub } from "@/hooks/useTemplateHub";
import TemplateCard from "./TemplateCard";
import PublishTemplateModal from "./PublishTemplateModal";

// ─── Props ───────────────────────────────────────────────────────

interface TemplateHubSectionProps {
  currentUserUid: string | null;
}

// ─── Component ───────────────────────────────────────────────────

export default function TemplateHubSection({ currentUserUid }: TemplateHubSectionProps) {
  const {
    templates,
    isLoading,
    error,
    isAuthenticated,
    fetchTemplates,
    publishTemplate,
    mergeTemplate,
    replaceWithTemplate,
    removeTemplate,
  } = useTemplateHub();

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchTemplates(query);
  };

  return (
    <div>
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <BookTemplate className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-theme-primary">مركز القوالب</h2>
            <p className="text-[10px] text-theme-secondary">
              شارك عاداتك أو استخدم قوالب الآخرين
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setPublishModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-3 py-2 text-xs font-medium text-amber-500 ring-1 ring-amber-500/20 transition-all hover:from-amber-500/25 hover:to-orange-500/25"
          >
            <Upload className="h-3.5 w-3.5" />
            نشر قالب
          </motion.button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="ابحث عن قالب..."
          className="w-full rounded-xl border border-theme-border bg-theme-subtle py-2.5 pr-9 pl-4 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      )}

      {/* Templates list */}
      {!isLoading && (
        <AnimatePresence mode="popLayout">
          {templates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-theme-border py-8 text-center"
            >
              <BookTemplate className="mx-auto mb-2 h-8 w-8 text-theme-secondary/40" />
              <p className="text-sm text-theme-secondary">
                {searchQuery ? "لا توجد قوالب مطابقة" : "لا توجد قوالب بعد"}
              </p>
              {!searchQuery && isAuthenticated && (
                <p className="mt-1 text-xs text-theme-secondary/70">
                  كن أول من ينشر قالبًا!
                </p>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  currentUserUid={currentUserUid}
                  onMerge={mergeTemplate}
                  onReplace={replaceWithTemplate}
                  onDelete={removeTemplate}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Publish Modal */}
      <PublishTemplateModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onSubmit={publishTemplate}
      />
    </div>
  );
}
