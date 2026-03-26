"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  UsersRound,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import TabSwitcher from "@/components/TabSwitcher";
import AdminHeader from "@/components/admin/AdminHeader";
import OverviewTab from "@/components/admin/OverviewTab";
import ErrorBanner from "@/components/admin/ErrorBanner";
import UserTable from "@/components/admin/UserTable";
import TemplateTable from "@/components/admin/TemplateTable";
import GroupTable from "@/components/admin/GroupTable";

// ─── Types ───────────────────────────────────────────────────────

type AdminTab = "overview" | "users" | "templates" | "groups";

// ─── Admin Page ──────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as AdminTab;
    if (tab && ["overview", "users", "templates", "groups"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    window.history.pushState(null, "", `?tab=${tab}`);
  };

  const {
    stats,
    statsLoading,
    users,
    userSearch,
    setUserSearch,
    fetchUsers,
    templates,
    templateSearch,
    setTemplateSearch,
    fetchTemplates,
    removeTemplate,
    groups,
    fetchGroups,
    removeGroup,
    error,
    clearError,
  } = useAdmin();

  // ── Auth gate ──
  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-theme-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-theme-bg px-4">
        <Shield className="h-12 w-12 text-red-400 opacity-40" />
        <p className="text-lg font-semibold text-theme-primary">
          يرجى تسجيل الدخول للوصول
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-amber-400"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col bg-theme-bg">
      {/* Header */}
      <AdminHeader />

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {/* Tab Switcher */}
      <div className="px-4 pt-4 lg:px-6">
        <TabSwitcher<AdminTab>
          layoutId="adminTab"
          activeTab={activeTab}
          onChange={handleTabChange}
          tabs={[
            {
              id: "overview",
              label: "نظرة عامة",
              icon: <LayoutDashboard className="h-4 w-4" />,
            },
            {
              id: "users",
              label: "المستخدمون",
              icon: <Users className="h-4 w-4" />,
            },
            {
              id: "templates",
              label: "القوالب",
              icon: <FileText className="h-4 w-4" />,
            },
            {
              id: "groups",
              label: "المجموعات",
              icon: <UsersRound className="h-4 w-4" />,
            },
          ]}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 lg:px-6">
        {activeTab === "overview" && (
          <OverviewTab stats={stats} statsLoading={statsLoading} />
        )}

        {activeTab === "users" && (
          <UserTable
            users={users.items}
            page={users.page}
            totalPages={users.totalPages}
            totalCount={users.totalCount}
            isLoading={users.isLoading}
            search={userSearch}
            onSearchChange={setUserSearch}
            onFetch={fetchUsers}
          />
        )}

        {activeTab === "templates" && (
          <TemplateTable
            templates={templates.items}
            page={templates.page}
            totalPages={templates.totalPages}
            totalCount={templates.totalCount}
            isLoading={templates.isLoading}
            search={templateSearch}
            onSearchChange={setTemplateSearch}
            onFetch={fetchTemplates}
            onDelete={removeTemplate}
          />
        )}

        {activeTab === "groups" && (
          <GroupTable
            groups={groups.items}
            page={groups.page}
            totalPages={groups.totalPages}
            totalCount={groups.totalCount}
            isLoading={groups.isLoading}
            onFetch={fetchGroups}
            onDelete={removeGroup}
          />
        )}
      </div>
    </div>
  );
}

