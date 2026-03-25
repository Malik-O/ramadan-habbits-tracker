"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import LeaderboardSkeleton from "@/components/leaderboard/LeaderboardSkeleton";
import LeaderboardEmpty from "@/components/leaderboard/LeaderboardEmpty";
import TopThreePodium from "@/components/leaderboard/TopThreePodium";
import LeaderboardList from "@/components/leaderboard/LeaderboardList";
import CurrentUserRankBanner from "@/components/leaderboard/CurrentUserRankBanner";
import LeaderboardError from "@/components/leaderboard/LeaderboardError";

interface StatsLeaderboardProps {
  currentUserUid: string;
}

export default function StatsLeaderboard({ currentUserUid }: StatsLeaderboardProps) {
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
    <div className="flex flex-col gap-4 py-4">
      {currentUserRank !== null && (
        <CurrentUserRankBanner rank={currentUserRank} totalCount={totalCount} />
      )}
      <TopThreePodium entries={topThree} currentUserUid={currentUserUid} />
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
