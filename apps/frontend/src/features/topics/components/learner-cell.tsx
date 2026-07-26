/** "Md. Shahnur Islam" → "MS"; single-word names fall back to two letters. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/** Who submitted the work — the identity column of the review queue. */
export function LearnerCell({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
        {initialsOf(name)}
      </span>
      <div className="min-w-0 leading-tight">
        <div className="truncate font-medium text-foreground">{name}</div>
        <div className="truncate text-xs text-muted-foreground">{email}</div>
      </div>
    </div>
  );
}
