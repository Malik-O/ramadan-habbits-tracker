"use client";

import { motion } from "framer-motion";
import { LogIn, LogOut, User } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

/** Google "G" logo SVG rendered inline so there are no external asset deps. */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Signed‑in state — shows avatar, name, email and a sign‑out button. */
function SignedInView({
  user,
  onSignOut,
}: {
  user: { name: string; email: string; picture: string };
  onSignOut: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-5">
      {/* Avatar */}
      <div className="relative">
        <img
          src={user.picture}
          alt={user.name}
          referrerPolicy="no-referrer"
          className="h-16 w-16 rounded-full border-2 border-amber-400/30 object-cover shadow-lg"
        />
        <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-theme-card">
          <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* User info */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-theme-primary">{user.name}</h4>
        <p className="mt-0.5 text-xs text-theme-secondary">{user.email}</p>
      </div>

      {/* Sign-out button */}
      <button
        onClick={onSignOut}
        className="flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/5"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
}

/** Signed‑out state — shows a Google sign‑in button. */
function SignedOutView({
  isSigningIn,
  onSignIn,
}: {
  isSigningIn: boolean;
  onSignIn: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-5">
      {/* Icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
        <User className="h-7 w-7 text-amber-400" />
      </div>

      {/* Message */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-theme-primary">
          سجّل دخولك
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-theme-secondary">
          سجّل دخولك لحفظ تقدمك ومزامنته بين أجهزتك
        </p>
      </div>

      {/* Google sign-in button */}
      <button
        onClick={onSignIn}
        disabled={isSigningIn}
        className="flex w-full max-w-[260px] items-center justify-center gap-3 rounded-xl border border-theme-border bg-theme-card px-4 py-3 text-sm font-medium text-theme-primary shadow-sm transition-all hover:bg-theme-subtle hover:shadow-md disabled:opacity-50"
      >
        {isSigningIn ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-theme-border border-t-amber-400" />
        ) : (
          <GoogleLogo className="h-5 w-5 shrink-0" />
        )}
        <span>الدخول عبر Google</span>
      </button>
    </div>
  );
}

/** Loading skeleton while auth state resolves. */
function AuthSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 p-5">
      <div className="h-14 w-14 animate-pulse rounded-full bg-theme-subtle" />
      <div className="h-4 w-24 animate-pulse rounded bg-theme-subtle" />
      <div className="h-3 w-32 animate-pulse rounded bg-theme-subtle" />
    </div>
  );
}

export default function SignInSection() {
  const { user, isLoading, isSigningIn, signIn, signOut } = useGoogleAuth();

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <h3 className="border-b border-theme-border px-4 py-3 text-sm font-semibold text-theme-primary">
        <div className="flex items-center gap-2">
          <LogIn className="h-4 w-4 text-amber-400" />
          <span>الحساب</span>
        </div>
      </h3>

      {isLoading ? (
        <AuthSkeleton />
      ) : user ? (
        <SignedInView user={user} onSignOut={signOut} />
      ) : (
        <SignedOutView isSigningIn={isSigningIn} onSignIn={signIn} />
      )}
    </motion.div>
  );
}
