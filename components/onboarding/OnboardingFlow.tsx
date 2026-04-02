"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useCustomHabits } from "@/hooks/useCustomHabits";
import type { TemplateResponse } from "@/services/api";
import type { HabitCategory, HabitRepeat } from "@/constants/habits";
import WelcomeStep from "./WelcomeStep";
import TemplatePickerStep from "./TemplatePickerStep";
import InstallStep from "./InstallStep";
import LoginStep from "./LoginStep";

// ─── Props ───────────────────────────────────────────────────────

interface OnboardingFlowProps {
  children: React.ReactNode;
}

// ─── Step Indicator ──────────────────────────────────────────────

interface StepIndicatorProps {
  currentIndex: number;
  totalSteps: number;
}

function StepIndicator({ currentIndex, totalSteps }: StepIndicatorProps) {
  return (
    <div className="absolute top-6 left-1/2 z-50 flex -translate-x-1/2 gap-2 pointer-events-none">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index === currentIndex
              ? "w-6 bg-amber-500"
              : index < currentIndex
              ? "w-1.5 bg-amber-500/60"
              : "w-1.5 bg-theme-secondary/30"
          }`}
          layout
        />
      ))}
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────

/** Convert a TemplateResponse into local HabitCategory[] format */
function templateToCategories(template: TemplateResponse): HabitCategory[] {
  return template.categories.map((cat) => ({
    id: cat.categoryId,
    name: cat.name,
    icon: cat.icon,
    items: cat.items.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type as "boolean" | "number",
      repeat: (item.repeat as HabitRepeat) || "daily",
      repeatDays: item.repeatDays,
      repeatMonthDay: item.repeatMonthDay,
      repeatMonthHijri: item.repeatMonthHijri,
      repeatYearlyDate: item.repeatYearlyDate,
      repeatYearlyHijri: item.repeatYearlyHijri,
      repeatEndDate: item.repeatEndDate,
    })),
  }));
}

// ─── Component ───────────────────────────────────────────────────

export default function OnboardingFlow({ children }: OnboardingFlowProps) {
  const {
    isOnboardingComplete,
    currentStep,
    stepIndex,
    totalSteps,
    nextStep,
    completeOnboarding,
  } = useOnboarding();

  const { setCategories } = useCustomHabits();

  /** Handle template selection — apply it locally and move to next step */
  const handleTemplateSelected = useCallback(
    (template: TemplateResponse | null) => {
      if (template) {
        const newCategories = templateToCategories(template);
        setCategories(() => newCategories);
      }
      // null = default template, which is already in localStorage from useCustomHabits
      nextStep();
    },
    [nextStep, setCategories]
  );

  // Already onboarded — render app normally
  if (isOnboardingComplete) {
    return <>{children}</>;
  }

  return (
    <div className="relative mx-auto min-h-dvh max-w-md bg-theme-bg overflow-hidden">
      {/* Step indicators */}
      <StepIndicator currentIndex={stepIndex} totalSteps={totalSteps} />

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === "welcome" && (
          <WelcomeStep onContinue={nextStep} />
        )}

        {currentStep === "templates" && (
          <TemplatePickerStep
            onContinue={handleTemplateSelected}
            onSkip={nextStep}
          />
        )}

        {currentStep === "install" && (
          <InstallStep onContinue={nextStep} onSkip={nextStep} />
        )}

        {currentStep === "login" && (
          <LoginStep
            onContinue={completeOnboarding}
            onSkip={completeOnboarding}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
