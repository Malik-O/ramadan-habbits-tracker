"use client";

import { Trophy } from "lucide-react";
import SignInPrompt from "@/components/SignInPrompt";
import React from "react";

interface LeaderboardSignInPromptProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

/** Shown when the user is not signed in */
export default function LeaderboardSignInPrompt({
  title = "المجموعات والتنافس",
  description = "سجّل دخولك لإنشاء مجموعات ومنافسة أصدقائك في إتمام العبادات اليومية",
  icon = <Trophy className="h-12 w-12 text-amber-500" />
}: LeaderboardSignInPromptProps) {
  return (
    <SignInPrompt
      title={title}
      description={description}
      icon={icon}
    />
  );
}
