import { motion } from "framer-motion";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 lg:mx-6"
    >
      <span className="text-sm text-red-400">{message}</span>
      <button
        onClick={onDismiss}
        className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
      >
        إخفاء
      </button>
    </motion.div>
  );
}
