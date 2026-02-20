"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Share, PlusSquare } from "lucide-react";
import Image from "next/image";

interface IosInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IosInstallGuide({ isOpen, onClose }: IosInstallGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[160] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-theme-card p-6 shadow-2xl ring-1 ring-white/10"
          >
            {/* Handle Bar */}
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-theme-border opacity-50" />
            
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-theme-primary">
                تثبيت التطبيق على آيفون
              </h3>
              <button
                onClick={onClose}
                className="rounded-full bg-theme-subtle p-2 text-theme-secondary transition-colors hover:bg-theme-muted hover:text-theme-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8 pb-8">
              {/* Step 1 */}
              <div className="space-y-3">
                <p className="text-md font-medium text-theme-primary px-1">
                  اضغط على زر <span className="text-blue-500">المشاركة</span> <Share className="inline h-4 w-4" /> في شريط المتصفح
                </p>
                <div className="w-full overflow-hidden rounded-xl border border-theme-border shadow-md">
                   <Image 
                     src="/ios-steps/1.png" 
                     alt="Step 1: Share Icon" 
                     width={335}
                     height={158}
                     className="h-auto w-full object-contain" 
                   />
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-3">
                <p className="text-md font-medium text-theme-primary px-1">
                  مرر للأسفل واختر <span className="font-bold">"إضافة إلى الشاشة الرئيسية"</span> <PlusSquare className="inline h-4 w-4" />
                </p>
                 <div className="w-full overflow-hidden rounded-xl border border-theme-border shadow-md">
                   <Image 
                     src="/ios-steps/2.png" 
                     alt="Step 2: Add to Home Screen" 
                     width={331}
                     height={494}
                     className="h-auto w-full object-contain" 
                   />
                </div>
              </div>

               {/* Step 3 */}
              <div className="space-y-3">
                <p className="text-md font-medium text-theme-primary px-1">
                  اضغط على <span className="font-bold text-blue-500">"إضافة"</span> في أعلى الشاشة
                </p>
                 <div className="w-full overflow-hidden rounded-xl border border-theme-border shadow-md">
                   <Image 
                     src="/ios-steps/3.png" 
                     alt="Step 3: Confirm Add" 
                     width={329}
                     height={257}
                     className="h-auto w-full object-contain" 
                   />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
