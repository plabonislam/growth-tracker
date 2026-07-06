import { GraduationCap } from 'lucide-react';

/**
 * Canonical brand lockup — primary tile + serif wordmark. Used by the landing
 * header, app sidebar, and mobile top bar so the brand renders identically
 * everywhere. Non-interactive; wrap in a button/link where it should navigate.
 */
export function BrandLogo({ caption = false }: { caption?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-5" />
      </span>
      <span className="text-left leading-tight">
        <span className="block font-serif text-lg font-extrabold tracking-tight text-foreground">
          DSI Clubs
        </span>
        {caption && (
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Learning Platform
          </span>
        )}
      </span>
    </span>
  );
}
