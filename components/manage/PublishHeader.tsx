import { ArrowRight } from "lucide-react";

interface PublishHeaderProps {
  onBack: () => void;
}

export default function PublishHeader({ onBack }: PublishHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-theme-primary">نشر قالب جديد</h1>
      </div>
    </header>
  );
}
