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
import GroupCreatedSuccessModal from "@/components/groups/GroupCreatedSuccessModal";
import JoinGroupFromLink from "@/components/groups/JoinGroupFromLink";
import { usePendingJoinCode } from "@/hooks/usePendingJoinCode";
import { setMemberAdminStatus } from "@/services/api";

export default function GroupsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("group");
  const joinCodeParam = searchParams.get("joinCode");

  const { consumePendingCode } = usePendingJoinCode();
  const [activeJoinCode, setActiveJoinCode] = useState<string | null>(null);

  const groupsHook = useGroups();
  const {
    groups,
    isLoading,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    updateHabits,
    updateGroupInfo,
    refresh,
  } = groupsHook;

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroupId);
  const [showCreateJoinModal, setShowCreateJoinModal] = useState(false);
  const [managingGroup, setManagingGroup] = useState<GroupResponse | null>(null);
  const [createdGroupInfo, setCreatedGroupInfo] = useState<{ id: string; name: string; inviteCode: string } | null>(null);

  // Determine the join code: URL param takes priority, then localStorage
  useEffect(() => {
    if (joinCodeParam) {
      setActiveJoinCode(joinCodeParam);
      return;
    }

    const pending = consumePendingCode();
    if (pending) {
      setActiveJoinCode(pending);
    }
  }, [joinCodeParam, consumePendingCode]);

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

  const handleCreateGroup = useCallback(async (name: string, description?: string) => {
    const group = await createGroup(name, description);
    if (group) setCreatedGroupInfo({ id: group._id, name, inviteCode: group.inviteCode });
  }, [createGroup]);

  const handleSuccessModalClose = useCallback(() => {
    if (createdGroupInfo) {
      selectGroup(createdGroupInfo.id);
    }
    setCreatedGroupInfo(null);
  }, [createdGroupInfo, selectGroup]);

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

  const handleUpdateGroupInfo = useCallback(async (groupId: string, data: { name?: string; description?: string }) => {
    const result = await updateGroupInfo(groupId, data);
    if (result) refresh();
    return result;
  }, [updateGroupInfo, refresh]);

  const handleToggleMemberAdmin = useCallback(async (groupId: string, memberUid: string, isAdmin: boolean) => {
    try {
      const result = await setMemberAdminStatus(groupId, memberUid, isAdmin);
      if (result) refresh();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, [refresh]);

  if (selectedGroup) {
    return (
      <div className="flex-1">
        <GroupDetailView
          group={selectedGroup}
          onBack={() => selectGroup(null)}
          onLeaveGroup={handleLeaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onManageHabits={setManagingGroup}
          onUpdateGroupInfo={handleUpdateGroupInfo}
          onToggleMemberAdmin={handleToggleMemberAdmin}
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
      <GroupCreatedSuccessModal
        isOpen={createdGroupInfo !== null}
        groupName={createdGroupInfo?.name ?? ""}
        inviteCode={createdGroupInfo?.inviteCode ?? ""}
        onClose={handleSuccessModalClose}
      />
      {activeJoinCode && (
        <JoinGroupFromLink
          inviteCode={activeJoinCode}
          onJoined={refresh}
        />
      )}
    </div>
  );
}
