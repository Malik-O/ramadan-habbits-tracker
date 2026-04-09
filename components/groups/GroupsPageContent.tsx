"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import LeaderboardSignInPrompt from "@/components/leaderboard/LeaderboardSignInPrompt";
import LeaderboardSkeleton from "@/components/leaderboard/LeaderboardSkeleton";
import GroupsManager from "@/components/groups/GroupsManager";

const PENDING_JOIN_KEY = "pendingGroupJoinCode";

export default function GroupsPageContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const joinCodeParam = searchParams.get("joinCode");
  const isSignedIn = !!user;

  // Store joinCode in localStorage when user is not signed in
  useEffect(() => {
    if (isAuthLoading) return;

    if (joinCodeParam && !isSignedIn) {
      localStorage.setItem(PENDING_JOIN_KEY, joinCodeParam);
    }
  }, [joinCodeParam, isSignedIn, isAuthLoading]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Users className="h-4 w-4" />
             </div>
             <h1 className="text-lg font-bold text-theme-primary">المجموعات</h1>
          </div>
        </div>
      </header>

      {isAuthLoading ? (
        <LeaderboardSkeleton />
      ) : isSignedIn ? (
        <GroupsManager />
      ) : (
        <LeaderboardSignInPrompt />
      )}

      <BottomNav activeTab="groups" />
    </div>
  );
}
