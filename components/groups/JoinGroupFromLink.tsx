"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, X, Loader2, AlertCircle } from "lucide-react";
import {
  getGroupInfoByCode,
  joinGroupByCode,
  getMyGroups,
  type GroupPublicInfo,
} from "@/services/api";

interface JoinGroupFromLinkProps {
  inviteCode: string;
  onJoined?: () => void;
}

export default function JoinGroupFromLink({ inviteCode, onJoined }: JoinGroupFromLinkProps) {
  const router = useRouter();

  const [groupInfo, setGroupInfo] = useState<GroupPublicInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Close entirely (remove search param)
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      // We do router.replace instead of push to not bloat history
      router.replace("/leaderboard", { scroll: false });
    }, 300); // Wait for exit animation
  }, [router]);

  // Fetch group info
  useEffect(() => {
    if (!inviteCode) return;

    setIsLoadingInfo(true);
    setError(null);

    getGroupInfoByCode(inviteCode)
      .then(setGroupInfo)
      .catch((err) => setError(err.message || "المجموعة غير موجودة"))
      .finally(() => setIsLoadingInfo(false));
  }, [inviteCode]);

  // Check if they are already a member
  useEffect(() => {
    if (!groupInfo || isLoadingInfo) return;

    getMyGroups()
      .then((groups) => {
        const alreadyMember = groups.find((g) => g._id === groupInfo._id);
        if (alreadyMember) {
          // Already a member → open the group and close sheet
          setIsOpen(false);
          router.replace(`/leaderboard?group=${groupInfo._id}`, { scroll: false });
        }
      })
      .catch(() => {
        // Silently fail — they'll see the regular join prompt
      });
  }, [groupInfo, isLoadingInfo, router]);

  // Handle join
  const handleJoin = useCallback(async () => {
    if (!groupInfo) return;
    setIsJoining(true);

    try {
      const joined = await joinGroupByCode(groupInfo.inviteCode);
      onJoined?.();
      setIsOpen(false);
      setTimeout(() => {
        router.replace(`/leaderboard?group=${joined._id}`, { scroll: false });
      }, 300);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الانضمام";
      if (msg.includes("عضو بالفعل")) {
        setIsOpen(false);
        setTimeout(() => {
          router.replace(`/leaderboard?group=${groupInfo._id}`, { scroll: false });
        }, 300);
        return;
      }
      setError(msg);
    } finally {
      setIsJoining(false);
    }
  }, [groupInfo, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl bg-theme-card shadow-2xl sm:rounded-3xl"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-4 px-6 pb-8 pt-10">
              {isLoadingInfo ? (
                <SheetSkeleton />
              ) : error ? (
                <SheetError message={error} />
              ) : groupInfo ? (
                <>
                  {/* Group icon */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10">
                    <Users className="h-9 w-9 text-amber-500" />
                  </div>

                  {/* Group info */}
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-lg font-bold text-theme-primary">
                      {groupInfo.name}
                    </h2>
                    <span className="flex items-center gap-1.5 text-sm text-theme-secondary">
                      <Users className="h-3.5 w-3.5" />
                      {groupInfo.memberCount} عضو
                    </span>
                  </div>

                  <p className="text-center text-sm text-theme-secondary">
                    تم دعوتك للانضمام إلى هذه المجموعة
                  </p>

                  {/* Join button */}
                  <motion.button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 disabled:opacity-50"
                    whileTap={{ scale: 0.98 }}
                  >
                    {isJoining ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {isJoining ? "جاري الانضمام..." : "انضمام للمجموعة"}
                  </motion.button>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="h-20 w-20 animate-pulse rounded-2xl bg-theme-subtle" />
      <div className="h-5 w-40 animate-pulse rounded-lg bg-theme-subtle" />
      <div className="h-4 w-24 animate-pulse rounded-lg bg-theme-subtle" />
      <div className="h-12 w-full animate-pulse rounded-2xl bg-theme-subtle" />
    </div>
  );
}

function SheetError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="h-7 w-7 text-red-400" />
      </div>
      <p className="text-sm font-medium text-red-400">{message}</p>
    </div>
  );
}
