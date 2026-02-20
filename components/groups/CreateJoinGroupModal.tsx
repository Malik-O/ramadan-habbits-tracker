"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, LogIn } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

type ModalMode = "create" | "join";

interface CreateJoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string) => Promise<void>;
  onJoinGroup: (inviteCode: string) => Promise<void>;
}

// ─── Component ───────────────────────────────────────────────────

export default function CreateJoinGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
  onJoinGroup,
}: CreateJoinGroupModalProps) {
  const [mode, setMode] = useState<ModalMode>("create");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setGroupName("");
    setInviteCode("");
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        if (!groupName.trim()) {
          setError("اسم المجموعة مطلوب");
          setIsSubmitting(false);
          return;
        }
        await onCreateGroup(groupName.trim());
      } else {
        if (!inviteCode.trim()) {
          setError("رمز الدعوة مطلوب");
          setIsSubmitting(false);
          return;
        }
        await onJoinGroup(inviteCode.trim());
      }
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-theme-card p-6 shadow-2xl sm:rounded-3xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Mode switcher */}
            <div className="mb-6 flex gap-1 rounded-xl bg-theme-subtle p-1">
              <ModeButton
                isActive={mode === "create"}
                onClick={() => { setMode("create"); setError(null); }}
                icon={<Plus className="h-3.5 w-3.5" />}
                label="إنشاء مجموعة"
              />
              <ModeButton
                isActive={mode === "join"}
                onClick={() => { setMode("join"); setError(null); }}
                icon={<LogIn className="h-3.5 w-3.5" />}
                label="انضمام"
              />
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              {mode === "create" ? (
                <CreateForm
                  key="create"
                  groupName={groupName}
                  setGroupName={setGroupName}
                />
              ) : (
                <JoinForm
                  key="join"
                  inviteCode={inviteCode}
                  setInviteCode={setInviteCode}
                />
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 disabled:opacity-50"
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting
                ? "جاري..."
                : mode === "create"
                  ? "إنشاء المجموعة"
                  : "انضمام للمجموعة"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Sub Components ──────────────────────────────────────────────

function ModeButton({
  isActive,
  onClick,
  icon,
  label,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
        isActive
          ? "bg-theme-card text-theme-primary shadow-sm"
          : "text-theme-secondary hover:text-theme-primary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function CreateForm({
  groupName,
  setGroupName,
}: {
  groupName: string;
  setGroupName: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
          اسم المجموعة
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="مثال: مجموعة الفجر"
          maxLength={50}
          className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-3 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50"
          dir="rtl"
        />
      </div>
    </motion.div>
  );
}

function JoinForm({
  inviteCode,
  setInviteCode,
}: {
  inviteCode: string;
  setInviteCode: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
          رمز الدعوة
        </label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="مثال: X7K3AB"
          maxLength={10}
          className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.3em] text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm focus:border-amber-500/50"
          dir="ltr"
        />
      </div>

      <p className="text-center text-xs text-theme-secondary">
        أدخل رمز الدعوة الذي حصلت عليه من مسؤول المجموعة
      </p>
    </motion.div>
  );
}
