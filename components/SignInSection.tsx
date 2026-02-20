"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, LogOut, User, Eye, EyeOff } from "lucide-react";
import { useAuth, type AuthMode } from "@/hooks/useAuth";

// ─── Sub-Components ──────────────────────────────────────────────

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

/** Signed-in view — minimal avatar, name, email, sign-out. */
function SignedInView({
  user,
  onSignOut,
}: {
  user: { name: string; email: string; photoURL?: string; provider: string };
  onSignOut: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-5">
      {/* Avatar */}
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.name}
          referrerPolicy="no-referrer"
          className="h-14 w-14 rounded-full border-2 border-amber-400/20 object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-theme-subtle">
          <User className="h-6 w-6 text-theme-secondary" />
        </div>
      )}

      {/* Info */}
      <div className="text-center">
        <p className="text-sm font-semibold text-theme-primary">{user.name}</p>
        <p className="mt-0.5 text-xs text-theme-secondary">{user.email}</p>
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/5"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  );
}

/** Loading skeleton. */
function AuthSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 p-5">
      <div className="h-14 w-14 animate-pulse rounded-full bg-theme-subtle" />
      <div className="h-4 w-24 animate-pulse rounded bg-theme-subtle" />
      <div className="h-3 w-32 animate-pulse rounded bg-theme-subtle" />
    </div>
  );
}

/** Email/password form — shown when user clicks the text link. */
function EmailForm({
  isSubmitting,
  error,
  onSignIn,
  onSignUp,
  onClearError,
  onBack,
}: {
  isSubmitting: boolean;
  error: string | null;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (name: string, email: string, password: string) => void;
  onClearError: () => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      onSignIn(email, password);
    } else {
      onSignUp(name, email, password);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    onClearError();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full overflow-hidden"
    >
      <div className="flex w-full flex-col gap-3 pt-2">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-red-500/5 px-3 py-2 text-xs text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {/* Name — signup only */}
          <AnimatePresence>
            {mode === "signup" && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم"
                required={mode === "signup"}
                className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-secondary/50 outline-none transition-colors focus:border-amber-400/40"
              />
            )}
          </AnimatePresence>

          {/* Email */}
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            required
            className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-secondary/50 outline-none transition-colors focus:border-amber-400/40"
          />

          {/* Password */}
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              required
              minLength={6}
              className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 pl-10 text-sm text-theme-primary placeholder:text-theme-secondary/50 outline-none transition-colors focus:border-amber-400/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary/60 transition-colors hover:text-theme-primary"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : mode === "signin" ? (
              "تسجيل الدخول"
            ) : (
              "إنشاء حساب"
            )}
          </button>
        </form>

        {/* Toggle signin/signup */}
        <p className="text-center text-xs text-theme-secondary">
          {mode === "signin" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
          <button
            type="button"
            onClick={switchMode}
            className="font-semibold text-amber-500 hover:underline"
          >
            {mode === "signin" ? "أنشئ حسابك" : "سجّل دخولك"}
          </button>
        </p>

        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-theme-secondary/60 transition-colors hover:text-theme-secondary"
        >
          رجوع
        </button>
      </div>
    </motion.div>
  );
}

/** Signed-out view — Google button first, email link below. */
function SignedOutView({
  isSubmitting,
  error,
  onGoogleSignIn,
  onSignInEmail,
  onSignUpEmail,
  onClearError,
}: {
  isSubmitting: boolean;
  error: string | null;
  onGoogleSignIn: () => void;
  onSignInEmail: (email: string, password: string) => void;
  onSignUpEmail: (name: string, email: string, password: string) => void;
  onClearError: () => void;
}) {
  const [showEmailForm, setShowEmailForm] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 p-5">
      {/* Brief message */}
      <p className="text-center text-xs leading-relaxed text-theme-secondary">
        سجّل دخولك لحفظ تقدمك ومزامنته بين أجهزتك
      </p>

      {/* Google button */}
      <button
        onClick={onGoogleSignIn}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-theme-border bg-theme-card py-2.5 text-sm font-medium text-theme-primary transition-colors hover:bg-theme-subtle disabled:opacity-50"
      >
        {isSubmitting && !showEmailForm ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-theme-border border-t-amber-400" />
        ) : (
          <GoogleLogo className="h-5 w-5 shrink-0" />
        )}
        <span>المتابعة عبر Google</span>
      </button>

      {/* Email link / form */}
      <AnimatePresence>
        {showEmailForm ? (
          <EmailForm
            key="email-form"
            isSubmitting={isSubmitting}
            error={error}
            onSignIn={onSignInEmail}
            onSignUp={onSignUpEmail}
            onClearError={onClearError}
            onBack={() => {
              setShowEmailForm(false);
              onClearError();
            }}
          />
        ) : (
          <motion.button
            key="email-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="text-xs text-amber-500 transition-colors hover:underline"
          >
            أو المتابعة بالبريد الإلكتروني وكلمة المرور
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function SignInSection() {
  const {
    user,
    isLoading,
    isSubmitting,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    clearError,
  } = useAuth();

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
        <SignedOutView
          isSubmitting={isSubmitting}
          error={error}
          onGoogleSignIn={signInWithGoogle}
          onSignInEmail={signInWithEmail}
          onSignUpEmail={signUpWithEmail}
          onClearError={clearError}
        />
      )}
    </motion.div>
  );
}
