"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 1 second (plus a small buffer for animation)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-theme-bg"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative w-40 h-40"
            >
              <Image
                src="/logo.png"
                alt="App Logo"
                fill
                priority
                className="object-contain dark:invert"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!showSplash && children} 
      {/* Show only splash or splash + children? Usually splash over children. 
          But if children load heavy data, maybe wait?
          Since it's Next.js with server components, children are rendered on server.
          The client component wraps them.
          Let's render children always but cover them with splash.
      */}
      {showSplash && !children && null} 
      {/* Wait, if children are passed, they should be rendered underneath so when splash fades out, content is there.
          If I don't render children while splash is on, the app layout might shift or re-render.
          Better to render children always.
      */}
      {children}
    </>
  );
}
