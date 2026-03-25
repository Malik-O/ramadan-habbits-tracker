"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import type { GroupResponse } from "@/services/api";
import BottomNav from "@/components/BottomNav";
import LeaderboardSignInPrompt from "@/components/leaderboard/LeaderboardSignInPrompt";
import LeaderboardSkeleton from "@/components/leaderboard/LeaderboardSkeleton";
import GroupsListPanel from "@/components/groups/GroupsListPanel";
import GroupDetailView from "@/components/groups/GroupDetailView";
import GroupHabitsManager from "@/components/groups/GroupHabitsManager";
import CreateJoinGroupModal from "@/components/groups/CreateJoinGroupModal";
import JoinGroupFromLink from "@/components/groups/JoinGroupFromLink";

export default function GroupsPage() {
  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <GroupsPageContent />
    </Suspense>
  );
}

function GroupsPageContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isSignedIn = !!user;

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

      <BottomNav activeTab="leaderboard" />
    </div>
  );
}

function GroupsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("group");
  const joinCodeParam = searchParams.get("joinCode");
  
  const groupsHook = useGroups();
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

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroupId);
  const [showCreateJoinModal, setShowCreateJoinModal] = useState(false);
  const [managingGroup, setManagingGroup] = useState<GroupResponse | null>(null);

  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    }
  }, [initialGroupId]);

  const selectedGroup = groups.find((g) => g._id === selectedGroupId) || null;

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

  useEffect(() => {
    if (initialGroupId && !isLoading && groups.length > 0 && !selectedGroup) {
      router.replace("/leaderboard", { scroll: false });
      setSelectedGroupId(null);
    }
  }, [initialGroupId, isLoading, groups, selectedGroup, router]);

  const handleCreateGroup = useCallback(async (name: string) => {
    const group = await createGroup(name);
    if (group) selectGroup(group._id);
  }, [createGroup, selectGroup]);

  const handleJoinGroup = useCallback(async (inviteCode: string) => {
    const group = await joinGroup(inviteCode);
    if (group) selectGroup(group._id);
  }, [joinGroup, selectGroup]);

  const handleLeaveGroup = useCallback(async (groupId: string) => {
    const success = await leaveGroup(groupId);
    if (success) selectGroup(null);
    return success;
  }, [leaveGroup, selectGroup]);

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    const success = await deleteGroup(groupId);
    if (success) selectGroup(null);
    return success;
  }, [deleteGroup, selectGroup]);

  const handleSaveHabits = useCallback(async (groupId: string, categories: GroupResponse["categories"]) => {
    const result = await updateHabits(groupId, categories);
    if (result) {
      setManagingGroup(null);
      refresh();
    }
    return result;
  }, [updateHabits, refresh]);

  if (selectedGroup) {
    return (
      <div className="flex-1">
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
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
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
      {joinCodeParam && (
        <JoinGroupFromLink
          inviteCode={joinCodeParam}
          onJoined={refresh}
        />
      )}
    </div>
  );
}
