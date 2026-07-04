import { ArrowLeft } from 'lucide-react';

/** Transactional sub-page header with a back button and a title. */
export function PageHeader({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  const goBack = onBack ?? (() => window.history.back());

  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center border-b bg-background/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={goBack}
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span className="text-lg font-semibold">{title}</span>
      </div>
    </nav>
  );
}
