"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookTemplate, Search, Upload, Loader2, ChevronDown } from "lucide-react";
import { useTemplateHub } from "@/hooks/useTemplateHub";
import TemplateCard from "./TemplateCard";

// ─── Props ───────────────────────────────────────────────────────

interface TemplateHubSectionProps {
  currentUserUid: string | null;
}

// ─── Component ───────────────────────────────────────────────────

export default function TemplateHubSection({ currentUserUid }: TemplateHubSectionProps) {
  const router = useRouter();
  const {
    templates,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    isAuthenticated,
    fetchTemplates,
    loadMore,
    mergeTemplate,
    replaceWithTemplate,
    removeTemplate,
  } = useTemplateHub();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchTemplates(query);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Section header card */}
      <SectionHeader
        isAuthenticated={isAuthenticated}
        onPublish={() => router.push("/templates/publish")}
      />

      {/* Search bar */}
      <SearchBar value={searchQuery} onChange={handleSearch} />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Loading (initial) */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      )}

      {/* Templates list */}
      {!isLoading && (
        <AnimatePresence mode="popLayout">
          {templates.length === 0 ? (
            <EmptyState
              hasSearch={!!searchQuery}
              isAuthenticated={isAuthenticated}
            />
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

              {/* Load more button */}
              {hasMore && (
                <LoadMoreButton
                  isLoading={isLoadingMore}
                  onLoadMore={loadMore}
                />
              )}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── SectionHeader ───────────────────────────────────────────────

interface SectionHeaderProps {
  isAuthenticated: boolean;
  onPublish: () => void;
}

function SectionHeader({ isAuthenticated, onPublish }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-theme-border bg-gradient-to-l from-amber-500/5 via-transparent to-transparent px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <BookTemplate className="h-4.5 w-4.5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-theme-primary">مركز القوالب</h2>
          <p className="text-[10px] leading-relaxed text-theme-secondary">
            شارك عباداتك أو استخدم قوالب الآخرين
          </p>
        </div>
      </div>

      {isAuthenticated && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onPublish}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-3 py-2 text-xs font-medium text-amber-500 ring-1 ring-amber-500/20 transition-all hover:from-amber-500/25 hover:to-orange-500/25"
        >
          <Upload className="h-3.5 w-3.5" />
          نشر قالب
        </motion.button>
      )}
    </div>
  );
}

// ─── SearchBar ───────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary/50" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ابحث عن قالب..."
        className="w-full rounded-xl border border-theme-border bg-theme-subtle py-2.5 pr-9 pl-4 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
      />
    </div>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────

interface EmptyStateProps {
  hasSearch: boolean;
  isAuthenticated: boolean;
}

function EmptyState({ hasSearch, isAuthenticated }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-theme-border py-10"
    >
      <BookTemplate className="h-10 w-10 text-theme-secondary/30" />
      <p className="text-sm text-theme-secondary">
        {hasSearch ? "لا توجد قوالب مطابقة" : "لا توجد قوالب بعد"}
      </p>
      {!hasSearch && isAuthenticated && (
        <p className="text-xs text-theme-secondary/60">
          كن أول من ينشر قالبًا!
        </p>
      )}
    </motion.div>
  );
}

// ─── LoadMoreButton ──────────────────────────────────────────────

interface LoadMoreButtonProps {
  isLoading: boolean;
  onLoadMore: () => void;
}

function LoadMoreButton({ isLoading, onLoadMore }: LoadMoreButtonProps) {
  return (
    <motion.button
      onClick={onLoadMore}
      disabled={isLoading}
      whileTap={{ scale: 0.98 }}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-theme-border bg-theme-card py-3 text-sm font-medium text-theme-secondary transition-all hover:border-amber-500/30 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري التحميل...
        </>
      ) : (
        <>
          <ChevronDown className="h-4 w-4" />
          عرض المزيد
        </>
      )}
    </motion.button>
  );
}
