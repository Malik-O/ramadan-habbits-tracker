"use client";

import { useTheme } from "@/hooks/useTheme";
import SignInSection from "@/components/SignInSection";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AppInfoCard from "@/components/profile/AppInfoCard";
import SettingsSection from "@/components/profile/SettingsSection";
import DangerSection from "@/components/profile/DangerSection";
import Footer from "@/components/profile/Footer";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const pendingCode = localStorage.getItem("pendingGroupJoinCode");
      if (pendingCode) {
        router.push("/groups");
      }
    }
  }, [user, router]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg">
      {/* Header */}
      <ProfileHeader />

      <div className="flex flex-col gap-6 p-4">
        {/* App info card */}
        <AppInfoCard />

        {/* Sign in / Sign up */}
        <SignInSection />

        {/* Settings */}
        <SettingsSection theme={theme} onToggleTheme={toggleTheme} />

        {/* Danger zone */}
        <DangerSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
