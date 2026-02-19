"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hemma-google-user";
const GSI_SCRIPT_URL = "https://accounts.google.com/gsi/client";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google unique user ID
}

interface GoogleAuthState {
  user: GoogleUser | null;
  isLoading: boolean;
  isSigningIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

/**
 * Decodes a JWT token payload (Google credential response).
 * Only decodes the payload — does NOT verify the signature.
 */
function decodeJwtPayload(token: string): GoogleUser {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  const payload = JSON.parse(jsonPayload);
  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    sub: payload.sub,
  };
}

function loadStoredUser(): GoogleUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeUser(user: GoogleUser | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useGoogleAuth(): GoogleAuthState {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);

  // Load stored user on mount
  useEffect(() => {
    setUser(loadStoredUser());
    setIsLoading(false);
  }, []);

  // Load Google GSI script
  useEffect(() => {
    if (typeof window === "undefined") return;

    // If already loaded
    if (window.google?.accounts?.id) {
      setIsGsiReady(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${GSI_SCRIPT_URL}"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsGsiReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGsiReady(true);
    document.head.appendChild(script);
  }, []);

  // Initialize GSI when ready
  useEffect(() => {
    if (!isGsiReady || !window.google?.accounts?.id) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("[useGoogleAuth] Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        try {
          const decoded = decodeJwtPayload(response.credential);
          setUser(decoded);
          storeUser(decoded);
        } catch (err) {
          console.error("[useGoogleAuth] Failed to decode credential:", err);
        } finally {
          setIsSigningIn(false);
        }
      },
    });
  }, [isGsiReady]);

  const signIn = useCallback(() => {
    const gsi = window.google?.accounts?.id;
    if (!isGsiReady || !gsi) return;
    setIsSigningIn(true);

    gsi.prompt((notification: { isNotDisplayed: () => boolean }) => {
      // If One Tap is blocked (e.g. user dismissed it before), fall back to button flow
      if (notification.isNotDisplayed()) {
        // Render an invisible Google button and click it programmatically
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "-9999px";
        document.body.appendChild(container);

        gsi.renderButton(container, {
          type: "icon",
          size: "large",
        });

        const btn =
          container.querySelector<HTMLElement>("div[role=button]") ??
          container.querySelector<HTMLElement>("iframe");
        if (btn) btn.click();

        setTimeout(() => {
          document.body.removeChild(container);
          setIsSigningIn(false);
        }, 1000);
      }
    });
  }, [isGsiReady]);

  const signOut = useCallback(() => {
    const googleApi = typeof window !== "undefined" ? window.google : undefined;
    if (googleApi?.accounts?.id) {
      googleApi.accounts.id.disableAutoSelect();
    }
    setUser(null);
    storeUser(null);
  }, []);

  return { user, isLoading, isSigningIn, signIn, signOut };
}
