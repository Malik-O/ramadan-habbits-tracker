"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { trackBlockCompleted } from "@/utils/analytics";

interface ConfettiTriggerProps {
  blockCompletion: Record<string, boolean>;
  currentDay: number;
}

/**
 * Watches block completion and fires confetti when any block transitions
 * from incomplete → complete via user action (not on page load or day change).
 */
export default function ConfettiTrigger({ blockCompletion, currentDay }: ConfettiTriggerProps) {
  const prevRef = useRef<Record<string, boolean>>({});
  const prevDayRef = useRef<number | null>(null);

  useEffect(() => {
    const isDayChange = prevDayRef.current === null || prevDayRef.current !== currentDay;
    prevDayRef.current = currentDay;

    // On initial mount or day change, just capture the baseline — no confetti
    if (isDayChange) {
      prevRef.current = { ...blockCompletion };
      return;
    }

    const prev = prevRef.current;

    for (const [blockId, isComplete] of Object.entries(blockCompletion)) {
      // Fire confetti only on the transition: false → true
      if (isComplete && !prev[blockId]) {
        fireConfetti();
        trackBlockCompleted(blockId);
        break; // one burst per render cycle
      }
    }

    prevRef.current = { ...blockCompletion };
  }, [blockCompletion, currentDay]);

  return null;
}

function fireConfetti() {
  const defaults = {
    spread: 360,
    ticks: 80,
    gravity: 0.8,
    decay: 0.92,
    startVelocity: 25,
    colors: ["#f59e0b", "#10b981", "#f97316", "#eab308", "#22d3ee"],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ["star"],
    origin: { x: 0.5, y: 0.3 },
  });

  confetti({
    ...defaults,
    particleCount: 25,
    scalar: 0.8,
    shapes: ["circle"],
    origin: { x: 0.3, y: 0.5 },
  });

  confetti({
    ...defaults,
    particleCount: 25,
    scalar: 0.8,
    shapes: ["circle"],
    origin: { x: 0.7, y: 0.5 },
  });
}
