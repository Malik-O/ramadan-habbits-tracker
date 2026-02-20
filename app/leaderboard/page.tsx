"use client";

import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import BottomNav from "@/components/BottomNav";
import LeaderboardHeader from "@/components/leaderboard/LeaderboardHeader";
import LeaderboardSignInPrompt from "@/components/leaderboard/LeaderboardSignInPrompt";
import LeaderboardSkeleton from "@/components/leaderboard/LeaderboardSkeleton";
import LeaderboardEmpty from "@/components/leaderboard/LeaderboardEmpty";
import TopThreePodium from "@/components/leaderboard/TopThreePodium";
import LeaderboardList from "@/components/leaderboard/LeaderboardList";
import CurrentUserRankBanner from "@/components/leaderboard/CurrentUserRankBanner";
import LeaderboardError from "@/components/leaderboard/LeaderboardError";

export default function LeaderboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isSignedIn = !!user;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      <LeaderboardHeader />

      {isAuthLoading ? (
        <LeaderboardSkeleton />
      ) : isSignedIn ? (
        <LeaderboardContent currentUserUid={user.uid} />
      ) : (
        <LeaderboardSignInPrompt />
      )}

      <BottomNav activeTab="leaderboard" />
    </div>
  );
}

// ─── Authenticated Content ───────────────────────────────────────

interface LeaderboardContentProps {
  currentUserUid: string;
}

function LeaderboardContent({ currentUserUid }: LeaderboardContentProps) {
  const {
    entries,
    isLoading,
    isLoadingMore,
    error,
    totalCount,
    currentUserRank,
    hasMore,
    loadMore,
    refresh,
  } = useLeaderboard();

  if (isLoading) return <LeaderboardSkeleton />;

  if (error) {
    return <LeaderboardError message={error} onRetry={refresh} />;
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4">
        <LeaderboardEmpty />
      </div>
    );
  }

  const topThree = entries.slice(0, 3);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Current user rank banner */}
      {currentUserRank !== null && (
        <CurrentUserRankBanner rank={currentUserRank} totalCount={totalCount} />
      )}

      {/* Top 3 podium */}
      <TopThreePodium entries={topThree} currentUserUid={currentUserUid} />

      {/* Remaining entries list */}
      <LeaderboardList
        entries={entries}
        currentUserUid={currentUserUid}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
