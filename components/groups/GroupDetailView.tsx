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
  Pencil,
  MoreVertical,
} from "lucide-react";
import type { GroupResponse, GroupLeaderboardEntry } from "@/services/api";
import { useGroupLeaderboard } from "@/hooks/useGroupLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import ConfirmDialog from "@/components/ConfirmDialog";
import GroupLeaderboardRow from "./GroupLeaderboardRow";
import MemberProgressModal from "./MemberProgressModal";
import GroupTopThreePodium from "./GroupTopThreePodium";
import EditGroupInfoModal from "./EditGroupInfoModal";

// ─── Types ───────────────────────────────────────────────────────

interface GroupDetailViewProps {
  group: GroupResponse;
  onBack: () => void;
  onLeaveGroup: (groupId: string) => Promise<boolean>;
  onDeleteGroup: (groupId: string) => Promise<boolean>;
  onManageHabits: (group: GroupResponse) => void;
  onUpdateGroupInfo?: (groupId: string, data: { name?: string; description?: string }) => Promise<unknown>;
  onToggleMemberAdmin?: (groupId: string, memberUid: string, isAdmin: boolean) => Promise<boolean>;
}

// ─── Component ───────────────────────────────────────────────────

export default function GroupDetailView({
  group,
  onBack,
  onLeaveGroup,
  onDeleteGroup,
  onManageHabits,
  onUpdateGroupInfo,
  onToggleMemberAdmin,
}: GroupDetailViewProps) {
  const { entries, isLoading, error, getMemberProgress } =
    useGroupLeaderboard(group._id);
  const { user } = useAuth();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMemberUid, setSelectedMemberUid] = useState<string | null>(null);
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [group.inviteCode]);

  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/groups/join/${group.inviteCode}`;
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
          className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
        >
          <ArrowRight className="h-4 w-4 text-theme-secondary" />
        </button>

        <div className="flex flex-1 items-center gap-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <Users className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-theme-primary">
                {group.name}
              </h2>
            </div>
            <span className="flex items-center gap-1.5 text-sm text-theme-secondary">
              <Users className="h-3.5 w-3.5" />
              {group.memberCount} عضو
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
          >
            <MoreVertical className="h-5 w-5 text-theme-secondary" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowOptions(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute left-0 mt-2 w-56 z-50 rounded-2xl border border-theme-border bg-theme-card p-2 shadow-xl"
                  dir="rtl"
                >
                  <button
                    onClick={() => {
                      handleCopyLink();
                      setShowOptions(false);
                    }}
                    className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-theme-primary transition-colors hover:bg-theme-subtle"
                  >
                    {copiedLink ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    {copiedLink ? "تم نسخ الرابط" : "نسخ رابط الدعوة"}
                  </button>

                  <button
                    onClick={() => {
                      handleCopyCode();
                      setShowOptions(false);
                    }}
                    className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-theme-primary transition-colors hover:bg-theme-subtle"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedCode ? "تم نسخ الرمز" : "نسخ رمز المجموعة"}
                  </button>

                  {group.isAdmin && (
                    <>
                      <div className="my-1 border-t border-theme-border" />
                      
                      {onUpdateGroupInfo && (
                        <button
                          onClick={() => {
                            setShowEditInfo(true);
                            setShowOptions(false);
                          }}
                          className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-theme-primary transition-colors hover:bg-theme-subtle"
                        >
                          <Pencil className="h-4 w-4" />
                          تعديل معلومات المجموعة
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onManageHabits(group);
                          setShowOptions(false);
                        }}
                        className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-theme-primary transition-colors hover:bg-theme-subtle"
                      >
                        <Settings className="h-4 w-4" />
                        إدارة عبادات المجموعة
                      </button>
                    </>
                  )}

                  <div className="my-1 border-t border-theme-border" />

                  {group.isAdmin ? (
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowOptions(false);
                      }}
                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف المجموعة
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLeaveConfirm(true);
                        setShowOptions(false);
                      }}
                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      مغادرة المجموعة
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <p className="rounded-xl bg-theme-subtle/50 px-4 py-3 text-sm leading-relaxed text-theme-secondary" dir="rtl">
          {group.description}
        </p>
      )}

      {/* No Habits Banner for Admin */}
      {group.isAdmin && (!group.categories || group.categories.length === 0 || group.categories.every(c => !c.items || c.items.length === 0)) && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-center gap-3">
          <p className="text-sm font-medium text-amber-500">
            للحصول على أفضل استفادة من المجموعة، قم بإضافة عبادات ليقوم الأعضاء بتسجيلها والتنافس فيها!
          </p>
          <button
            onClick={() => onManageHabits(group)}
            className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            إضافة عبادات للمجموعة
          </button>
        </div>
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
          <div className="flex flex-col">
            {/* Top-3 podium */}
            {entries.length >= 2 && (
              <>
                <GroupTopThreePodium
                  entries={entries}
                  currentUserUid={user?.uid ?? null}
                />
                <div className="mx-4 my-3 border-t border-theme-border" />
              </>
            )}
            {(entries.length >= 2 ? entries.slice(3) : entries).map((entry) => {
              const isMemberAdmin = group.adminUid === entry.uid || (group.adminUids ?? []).includes(entry.uid);
              return (
                <GroupLeaderboardRow
                  key={entry.uid}
                  entry={entry}
                  isAdmin={group.isAdmin}
                  isMemberAdmin={isMemberAdmin}
                  onClick={() => handleMemberClick(entry)}
                />
              );
            })}
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
            isMemberAdmin={group.adminUid === selectedMemberUid || (group.adminUids ?? []).includes(selectedMemberUid)}
            isMainAdmin={group.adminUid === user?.uid}
            isSelf={selectedMemberUid === user?.uid}
            onToggleAdmin={onToggleMemberAdmin 
              ? (isAdmin) => onToggleMemberAdmin(group._id, selectedMemberUid, isAdmin)
              : undefined}
          />
        )}
      </AnimatePresence>

      {/* Edit group info modal (admin only) */}
      {onUpdateGroupInfo && (
        <EditGroupInfoModal
          isOpen={showEditInfo}
          initialName={group.name}
          initialDescription={group.description || ""}
          onClose={() => setShowEditInfo(false)}
          onSave={(data) => onUpdateGroupInfo(group._id, data)}
        />
      )}
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
