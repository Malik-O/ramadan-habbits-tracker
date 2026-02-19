"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import ConfirmDialog from "@/components/ConfirmDialog";
import { trackDataReset } from "@/utils/analytics";

export default function DangerSection() {
  const [, setTracker] = useLocalStorage("hemma-tracker", {});
  const [, setDay] = useLocalStorage("hemma-current-day", 0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleReset = () => {
    trackDataReset();
    setTracker({});
    setDay(0);
    setIsConfirmOpen(false);
    window.location.reload();
  };

  return (
    <>
      <motion.div
        className="overflow-hidden rounded-2xl border border-red-500/20 bg-theme-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="border-b border-red-500/20 px-4 py-3 text-sm font-semibold text-red-400">
          منطقة الخطر
        </h3>
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-red-400 transition-colors hover:bg-red-500/5"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="text-sm">إعادة تعيين جميع البيانات</span>
        </button>
      </motion.div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="حذف جميع البيانات"
        message="هل أنت متأكد؟ سيتم حذف جميع بياناتك بشكل نهائي."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
