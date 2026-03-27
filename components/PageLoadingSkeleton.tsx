"use client";

import React from "react";

export default function PageLoadingSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="h-24 rounded-2xl bg-theme-subtle animate-pulse" />
      <div className="flex-1 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-theme-subtle animate-pulse" />
        ))}
      </div>
    </div>
  );
}
