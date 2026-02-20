"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useGroups } from "@/hooks/useGroups";
import type { GroupResponse } from "@/services/api";
import BottomNav from "@/components/BottomNav";
import LeaderboardHeader from "@/components/leaderboard/LeaderboardHeader";
import LeaderboardSignInPrompt from "@/components/leaderboard/LeaderboardSignInPrompt";
import LeaderboardSkeleton from "@/components/leaderboard/LeaderboardSkeleton";
import LeaderboardEmpty from "@/components/leaderboard/LeaderboardEmpty";
import TopThreePodium from "@/components/leaderboard/TopThreePodium";
import LeaderboardList from "@/components/leaderboard/LeaderboardList";
import CurrentUserRankBanner from "@/components/leaderboard/CurrentUserRankBanner";
import LeaderboardError from "@/components/leaderboard/LeaderboardError";
import LeaderboardTabSwitcher, {
  type LeaderboardTab,
} from "@/components/groups/LeaderboardTabSwitcher";
import GroupsListPanel from "@/components/groups/GroupsListPanel";
import GroupDetailView from "@/components/groups/GroupDetailView";
import GroupHabitsManager from "@/components/groups/GroupHabitsManager";
import CreateJoinGroupModal from "@/components/groups/CreateJoinGroupModal";
import JoinGroupFromLink from "@/components/groups/JoinGroupFromLink";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <LeaderboardPageContent />
    </Suspense>
  );
}

function LeaderboardPageContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isSignedIn = !!user;
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupParam = searchParams.get("group");
  const joinCodeParam = searchParams.get("joinCode");

  // Groups hook (lifted here so JoinGroupFromLink can trigger refresh)
  const groupsHook = useGroups();

  const [activeTab, setActiveTab] = useState<LeaderboardTab>(
    groupParam ? "groups" : "leaderboard"
  );

  // React to URL param changes (e.g. after joining from invite link)
  useEffect(() => {
    if (groupParam) {
      setActiveTab("groups");
    }
  }, [groupParam]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      <LeaderboardHeader />

      {isAuthLoading ? (
        <LeaderboardSkeleton />
      ) : isSignedIn ? (
        <>
          <LeaderboardTabSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {activeTab === "leaderboard" ? (
            <LeaderboardContent currentUserUid={user.uid} />
          ) : (
            <GroupsContent
              initialGroupId={groupParam}
              groupsHook={groupsHook}
            />
          )}

          {joinCodeParam && (
            <JoinGroupFromLink
              inviteCode={joinCodeParam}
              onJoined={groupsHook.refresh}
            />
          )}
        </>
      ) : (
        <LeaderboardSignInPrompt />
      )}

      <BottomNav activeTab="leaderboard" />
    </div>
  );
}

// ─── Global Leaderboard Content ──────────────────────────────────

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

// ─── Groups Content ──────────────────────────────────────────────

interface GroupsContentProps {
  initialGroupId: string | null;
  groupsHook: ReturnType<typeof useGroups>;
}

function GroupsContent({ initialGroupId, groupsHook }: GroupsContentProps) {
  const router = useRouter();
  const {
    groups,
    isLoading,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    updateHabits,
    refresh,
  } = groupsHook;

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    initialGroupId
  );

  // React to prop changes (e.g. URL changed via join redirect)
  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    }
  }, [initialGroupId]);

  const [showCreateJoinModal, setShowCreateJoinModal] = useState(false);
  const [managingGroup, setManagingGroup] = useState<GroupResponse | null>(null);

  const selectedGroup = groups.find((g) => g._id === selectedGroupId) || null;

  // Sync URL when group selection changes
  const selectGroup = useCallback(
    (groupId: string | null) => {
      setSelectedGroupId(groupId);
      if (groupId) {
        router.replace(`/leaderboard?group=${groupId}`, { scroll: false });
      } else {
        router.replace("/leaderboard", { scroll: false });
      }
    },
    [router]
  );

  // If initialGroupId is set but the group isn't in the list yet (still loading),
  // wait for groups to load and then auto-select or clear
  useEffect(() => {
    if (initialGroupId && !isLoading && groups.length > 0 && !selectedGroup) {
      // Group not found in user's groups — clear the param
      router.replace("/leaderboard", { scroll: false });
      setSelectedGroupId(null);
    }
  }, [initialGroupId, isLoading, groups, selectedGroup, router]);

  const handleCreateGroup = useCallback(
    async (name: string) => {
      const group = await createGroup(name);
      if (group) {
        selectGroup(group._id);
      }
    },
    [createGroup, selectGroup]
  );

  const handleJoinGroup = useCallback(
    async (inviteCode: string) => {
      const group = await joinGroup(inviteCode);
      if (group) {
        selectGroup(group._id);
      }
    },
    [joinGroup, selectGroup]
  );

  const handleLeaveGroup = useCallback(
    async (groupId: string) => {
      const success = await leaveGroup(groupId);
      if (success) {
        selectGroup(null);
      }
      return success;
    },
    [leaveGroup, selectGroup]
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      const success = await deleteGroup(groupId);
      if (success) {
        selectGroup(null);
      }
      return success;
    },
    [deleteGroup, selectGroup]
  );

  const handleSaveHabits = useCallback(
    async (groupId: string, categories: GroupResponse["categories"]) => {
      const result = await updateHabits(groupId, categories);
      if (result) {
        setManagingGroup(null);
        refresh();
      }
      return result;
    },
    [updateHabits, refresh]
  );

  // Show group detail view if a group is selected
  if (selectedGroup) {
    return (
      <>
        <GroupDetailView
          group={selectedGroup}
          onBack={() => selectGroup(null)}
          onLeaveGroup={handleLeaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onManageHabits={setManagingGroup}
        />

        <AnimatePresence>
          {managingGroup && (
            <GroupHabitsManager
              group={managingGroup}
              onSave={handleSaveHabits}
              onClose={() => setManagingGroup(null)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Show groups list
  return (
    <>
      <GroupsListPanel
        groups={groups}
        isLoading={isLoading}
        onSelectGroup={selectGroup}
        onOpenCreateJoin={() => setShowCreateJoinModal(true)}
      />

      <CreateJoinGroupModal
        isOpen={showCreateJoinModal}
        onClose={() => setShowCreateJoinModal(false)}
        onCreateGroup={handleCreateGroup}
        onJoinGroup={handleJoinGroup}
      />
    </>
  );
}
