"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useGroups } from "@/hooks/useGroups";
import type { GroupResponse } from "@/services/api";
import GroupsListPanel from "@/components/groups/GroupsListPanel";
import GroupDetailView from "@/components/groups/GroupDetailView";
import GroupHabitsManager from "@/components/groups/GroupHabitsManager";
import CreateJoinGroupModal from "@/components/groups/CreateJoinGroupModal";
import JoinGroupFromLink from "@/components/groups/JoinGroupFromLink";

export default function GroupsManager() {
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
        router.replace(`/groups?group=${groupId}`, { scroll: false });
      } else {
        router.replace("/groups", { scroll: false });
      }
    },
    [router]
  );

  useEffect(() => {
    if (initialGroupId && !isLoading && groups.length > 0 && !selectedGroup) {
      router.replace("/groups", { scroll: false });
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
