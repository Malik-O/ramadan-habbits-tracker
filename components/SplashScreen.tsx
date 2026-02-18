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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check theme from local storage
    const theme = window.localStorage.getItem("ramadan-theme");
    if (theme) {
      if (theme.includes("dark")) {
        setIsDark(true);
      }
    } else {
      window.localStorage.setItem("ramadan-theme", JSON.stringify("light"));
    }

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
                className={`object-contain ${isDark ? "invert" : ""}`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
