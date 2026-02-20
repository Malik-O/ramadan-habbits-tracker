"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  getProfile,
  setAuthToken,
  getAuthToken,
  initialUploadAfterSignup,
  type AuthResponse,
} from "@/services/api";

// ─── Constants ───────────────────────────────────────────────────

const USER_STORAGE_KEY = "hemma-auth-user";
const GSI_SCRIPT_URL = "https://accounts.google.com/gsi/client";

// ─── Types ───────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  provider: "google" | "local";
}

export type AuthMode = "signin" | "signup";

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  /** Sign in with email/password */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Register with email/password */
  signUpWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  /** Trigger Google One-Tap / popup sign-in */
  signInWithGoogle: () => void;
  /** Sign out */
  signOut: () => void;
  /** Clear any auth error */
  clearError: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────

function loadStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

function mapAuthResponseToUser(
  res: AuthResponse,
  provider: "google" | "local"
): AuthUser {
  return {
    _id: res._id,
    uid: res.uid,
    name: res.name,
    email: res.email,
    photoURL: res.photoURL,
    provider,
  };
}

// ─── Context ─────────────────────────────────────────────────────

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGsiReady, setIsGsiReady] = useState(false);

  // ── Bootstrap: load stored user & validate token ──
  useEffect(() => {
    const storedUser = loadStoredUser();
    const token = getAuthToken();

    if (storedUser && token) {
      setUser(storedUser);

      // Validate token in background — silently sign out if expired
      getProfile().catch(() => {
        setUser(null);
        storeUser(null);
        setAuthToken(null);
      });
    }

    setIsLoading(false);
  }, []);

  // ── Load Google GSI script ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      setIsGsiReady(true);
      return;
    }

    const existing = document.querySelector(
      `script[src="${GSI_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => setIsGsiReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGsiReady(true);
    document.head.appendChild(script);
  }, []);

  // ── Initialize GSI when ready ──
  useEffect(() => {
    if (!isGsiReady || !window.google?.accounts?.id) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("[AuthProvider] Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        setIsSubmitting(true);
        setError(null);
        try {
          const res = await loginWithGoogle(response.credential);
          const isNewUser = res.isNewUser;
          setAuthToken(res.token);
          const authUser = mapAuthResponseToUser(res, "google");
          // Use Google picture from decoded credential if backend didn't return one
          if (!authUser.photoURL) {
            try {
              const parts = response.credential.split(".");
              const payload = JSON.parse(
                atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
              );
              authUser.photoURL = payload.picture;
            } catch {
              /* ignore */
            }
          }
          setUser(authUser);
          storeUser(authUser);

          // If this was a new Google account, push existing local data
          if (isNewUser) {
            await initialUploadAfterSignup();
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "فشل تسجيل الدخول بـ Google";
          setError(message);
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }, [isGsiReady]);

  // ── Email/Password sign-in ──
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await loginWithEmail(email, password);
        setAuthToken(res.token);
        const authUser = mapAuthResponseToUser(res, "local");
        setUser(authUser);
        storeUser(authUser);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "بريد إلكتروني أو كلمة مرور غير صحيحة";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  // ── Email/Password sign-up ──
  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await registerWithEmail(name, email, password);
        setAuthToken(res.token);
        const authUser = mapAuthResponseToUser(res, "local");
        setUser(authUser);
        storeUser(authUser);

        // Push existing local data to the server immediately after sign-up
        await initialUploadAfterSignup();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "فشل إنشاء الحساب";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  // ── Google sign-in trigger ──
  const signInWithGoogle = useCallback(() => {
    const gsi = window.google?.accounts?.id;
    if (!isGsiReady || !gsi) return;
    setIsSubmitting(true);
    setError(null);

    gsi.prompt((notification: { isNotDisplayed: () => boolean }) => {
      if (notification.isNotDisplayed()) {
        // Fall back to hidden button click
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "-9999px";
        document.body.appendChild(container);

        gsi.renderButton(container, { type: "icon", size: "large" });

        const btn =
          container.querySelector<HTMLElement>("div[role=button]") ??
          container.querySelector<HTMLElement>("iframe");
        if (btn) btn.click();

        setTimeout(() => {
          document.body.removeChild(container);
          setIsSubmitting(false);
        }, 1000);
      }
    });
  }, [isGsiReady]);

  // ── Sign out ──
  const signOut = useCallback(() => {
    const googleApi =
      typeof window !== "undefined" ? window.google : undefined;
    if (googleApi?.accounts?.id) {
      googleApi.accounts.id.disableAutoSelect();
    }
    setUser(null);
    storeUser(null);
    setAuthToken(null);
    setError(null);
  }, []);

  // ── Clear error ──
  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    isLoading,
    isSubmitting,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
