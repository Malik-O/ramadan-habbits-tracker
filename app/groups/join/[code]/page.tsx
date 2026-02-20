"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default function JoinGroupPage({ params }: JoinPageProps) {
  const { code } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (code) {
      router.replace(`/leaderboard?joinCode=${encodeURIComponent(code)}`);
    }
  }, [code, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-theme-bg" />
  );
}
