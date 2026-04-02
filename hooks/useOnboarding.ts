"use client";

import { useState, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

// ─── Constants ───────────────────────────────────────────────────

export const ONBOARDING_KEY = "hemma-onboarding-complete";

export type OnboardingStep = "welcome" | "templates" | "install" | "login";

const STEP_ORDER: OnboardingStep[] = ["welcome", "templates", "install", "login"];

// ─── Types ───────────────────────────────────────────────────────

export interface UseOnboardingReturn {
  /** Whether the user has completed (or skipped) onboarding */
  isOnboardingComplete: boolean;
  /** Current step in the onboarding flow */
  currentStep: OnboardingStep;
  /** Current step index (0-based) */
  stepIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Move to the next step, or finish if on last step */
  nextStep: () => void;
  /** Skip to the end and mark onboarding complete */
  completeOnboarding: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useOnboarding(): UseOnboardingReturn {
  const [isComplete, setIsComplete] = useLocalStorage<boolean>(
    ONBOARDING_KEY,
    false
  );

  const [stepIndex, setStepIndex] = useState(0);

  const currentStep = STEP_ORDER[stepIndex] ?? "welcome";

  const completeOnboarding = useCallback(() => {
    setIsComplete(true);
  }, [setIsComplete]);

  const nextStep = useCallback(() => {
    if (stepIndex >= STEP_ORDER.length - 1) {
      completeOnboarding();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  }, [stepIndex, completeOnboarding]);

  return {
    isOnboardingComplete: isComplete,
    currentStep,
    stepIndex,
    totalSteps: STEP_ORDER.length,
    nextStep,
    completeOnboarding,
  };
}
