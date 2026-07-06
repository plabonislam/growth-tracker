import { Card } from '@/components/ui/card';

export function MetricTile({
  value,
  label,
  accent = 'text-primary',
}: {
  value: number;
  label: string;
  /** Literal Tailwind text class for the figure. */
  accent?: string;
}) {
  return (
    <Card className="h-full items-center justify-center gap-1 p-6 text-center">
      <span className={`text-5xl font-bold tracking-tight ${accent}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </Card>
  );
}
