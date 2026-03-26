"use client";

import { Suspense } from "react";
import LeaderboardSkeleton from "@/components/leaderboard/LeaderboardSkeleton";
import GroupsPageContent from "@/components/groups/GroupsPageContent";

export default function GroupsPage() {
  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <GroupsPageContent />
    </Suspense>
  );
}
