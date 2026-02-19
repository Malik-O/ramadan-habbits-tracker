"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { trackBlockCompleted } from "@/utils/analytics";

interface ConfettiTriggerProps {
  blockCompletion: Record<string, boolean>;
}

/**
 * Watches block completion and fires confetti when any block transitions
 * from incomplete → complete.
 */
export default function ConfettiTrigger({ blockCompletion }: ConfettiTriggerProps) {
  const prevRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
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
  }, [blockCompletion]);

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
