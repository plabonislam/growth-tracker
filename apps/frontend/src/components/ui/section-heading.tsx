import { cn } from '@/lib/utils';

/**
 * Canonical page/section heading — serif, bold, tight tracking — so every
 * page title ("Explore Clubs") and section title ("Your Active Journey")
 * shares one look. `action` renders right-aligned (counts, buttons).
 */
export function SectionHeading({
  title,
  eyebrow,
  subtitle,
  action,
  as: Tag = 'h2',
  className,
}: {
  title: string;
  /** Small uppercase kicker above the title, e.g. "Enrolled Topic". */
  eyebrow?: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Semantic level only — visual style stays identical. */
  as?: 'h1' | 'h2';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
            {eyebrow}
          </p>
        )}
        <Tag className="font-serif text-3xl font-bold tracking-tight text-foreground">
          {title}
        </Tag>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
