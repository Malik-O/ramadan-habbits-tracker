"use client";

import { Trophy } from "lucide-react";
import SignInPrompt from "@/components/SignInPrompt";

/** Shown when the user is not signed in */
export default function LeaderboardSignInPrompt() {
  return (
    <SignInPrompt
      title="لوحة السابقين"
      description="سجّل دخولك لمشاهدة ترتيبك ومنافسة الآخرين في إتمام العبادات اليومية"
      icon={<Trophy className="h-12 w-12 text-amber-500" />}
    />
  );
}
