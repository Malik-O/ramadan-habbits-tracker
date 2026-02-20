"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Crown,
  Settings,
  LogOut,
  Trash2,
  Copy,
  Check,
  Users,
  Link2,
} from "lucide-react";
import type { GroupResponse, GroupLeaderboardEntry } from "@/services/api";
import { useGroupLeaderboard } from "@/hooks/useGroupLeaderboard";
import ConfirmDialog from "@/components/ConfirmDialog";
import GroupLeaderboardRow from "./GroupLeaderboardRow";
import MemberProgressModal from "./MemberProgressModal";

// ─── Types ───────────────────────────────────────────────────────

interface GroupDetailViewProps {
  group: GroupResponse;
  onBack: () => void;
  onLeaveGroup: (groupId: string) => Promise<boolean>;
  onDeleteGroup: (groupId: string) => Promise<boolean>;
  onManageHabits: (group: GroupResponse) => void;
}

// ─── Component ───────────────────────────────────────────────────

export default function GroupDetailView({
  group,
  onBack,
  onLeaveGroup,
  onDeleteGroup,
  onManageHabits,
}: GroupDetailViewProps) {
  const { entries, isLoading, error, getMemberProgress } =
    useGroupLeaderboard(group._id);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMemberUid, setSelectedMemberUid] = useState<string | null>(null);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [group.inviteCode]);

  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/leaderboard?joinCode=${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [group.inviteCode]);

  const handleLeave = useCallback(async () => {
    const success = await onLeaveGroup(group._id);
    if (success) onBack();
  }, [group._id, onLeaveGroup, onBack]);

  const handleDelete = useCallback(async () => {
    const success = await onDeleteGroup(group._id);
    if (success) onBack();
  }, [group._id, onDeleteGroup, onBack]);

  const handleMemberClick = useCallback(
    (entry: GroupLeaderboardEntry) => {
      if (group.isAdmin) {
        setSelectedMemberUid(entry.uid);
      }
    },
    [group.isAdmin]
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
        >
          <ArrowRight className="h-4 w-4 text-theme-secondary" />
        </button>

        <div className="flex flex-1 items-center gap-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <Users className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-theme-primary">
              {group.name}
            </h2>
            <span className="flex items-center gap-1.5 text-sm text-theme-secondary">
              <Users className="h-3.5 w-3.5" />
              {group.memberCount} عضو
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Copy invite code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-xl bg-theme-subtle px-3 py-2.5 text-sm font-mono font-bold text-theme-secondary transition-colors hover:bg-theme-border"
            title="نسخ رمز الدعوة"
          >
            {copiedCode ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {group.inviteCode}
          </button>
        </div>
      </div>

      {/* Copy group link button */}
      <motion.button
        onClick={handleCopyLink}
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 py-2.5 text-sm font-semibold text-blue-500 transition-colors hover:bg-blue-500/20"
        whileTap={{ scale: 0.98 }}
      >
        {copiedLink ? (
          <Check className="h-4 w-4" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {copiedLink ? "تم نسخ الرابط!" : "نسخ رابط المجموعة"}
      </motion.button>

      {/* Admin actions bar */}
      {group.isAdmin && (
        <div className="flex gap-2">
          <motion.button
            onClick={() => onManageHabits(group)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-500 transition-colors hover:bg-amber-500/20"
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="h-3.5 w-3.5" />
            إدارة العادات
          </motion.button>
          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      )}

      {/* Non-admin leave button */}
      {!group.isAdmin && (
        <motion.button
          onClick={() => setShowLeaveConfirm(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 py-2.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="h-3.5 w-3.5" />
          مغادرة المجموعة
        </motion.button>
      )}

      {/* Leaderboard section */}
      <div className="rounded-2xl border border-theme-border bg-theme-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-theme-border px-4 py-3">
          <Crown className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold text-theme-primary">
            ترتيب الأعضاء
          </h3>
          {group.isAdmin && (
            <span className="mr-auto text-[10px] text-theme-secondary">
              اضغط على عضو لعرض التفاصيل
            </span>
          )}
        </div>

        {isLoading ? (
          <LeaderboardSkeleton />
        ) : error ? (
          <div className="px-4 py-6 text-center text-sm text-red-400">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-theme-secondary">
            لا توجد بيانات بعد
          </div>
        ) : (
          <div className="divide-y divide-theme-border/50">
            {entries.map((entry) => (
              <GroupLeaderboardRow
                key={entry.uid}
                entry={entry}
                isAdmin={group.isAdmin}
                onClick={() => handleMemberClick(entry)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="مغادرة المجموعة"
        message="هل أنت متأكد من مغادرة هذه المجموعة؟"
        confirmLabel="مغادرة"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف المجموعة"
        message="سيتم حذف المجموعة نهائياً لجميع الأعضاء. هل أنت متأكد؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Member progress modal (admin only) */}
      <AnimatePresence>
        {selectedMemberUid && (
          <MemberProgressModal
            groupId={group._id}
            memberUid={selectedMemberUid}
            getMemberProgress={getMemberProgress}
            onClose={() => setSelectedMemberUid(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="divide-y divide-theme-border/50">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-6 w-6 animate-pulse rounded-full bg-theme-subtle" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-theme-subtle" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-3.5 w-24 animate-pulse rounded bg-theme-subtle" />
            <div className="h-2 w-16 animate-pulse rounded bg-theme-subtle" />
          </div>
        </div>
      ))}
    </div>
  );
}
