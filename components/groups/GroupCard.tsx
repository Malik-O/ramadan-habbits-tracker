"use client";

import { motion } from "framer-motion";
import { Users, ChevronLeft, Crown, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import type { GroupResponse } from "@/services/api";

interface GroupCardProps {
  group: GroupResponse;
  onSelect: (groupId: string) => void;
}

export default function GroupCard({ group, onSelect }: GroupCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [group.inviteCode]
  );

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(group._id)}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(group._id); }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-theme-border bg-theme-card p-4 text-right transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Group icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
        <Users className="h-5 w-5 text-amber-500" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-theme-primary">
            {group.name}
          </span>
          {group.isAdmin && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500">
              <Crown className="h-3.5 w-3.5" />
              مسؤول
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-theme-secondary">
            <Users className="h-3.5 w-3.5" />
            {group.memberCount} عضو
          </span>

          {/* Invite code chip */}
          <span
            role="button"
            tabIndex={0}
            onClick={handleCopyCode}
            onKeyDown={(e) => { if (e.key === "Enter") handleCopyCode(e as unknown as React.MouseEvent); }}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-theme-subtle px-3 py-1.5 text-xs font-mono font-bold text-theme-secondary transition-colors hover:bg-theme-border"
            title="نسخ رمز الدعوة"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {group.inviteCode}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronLeft className="h-5 w-5 flex-shrink-0 text-theme-secondary" />
    </motion.div>
  );
}
