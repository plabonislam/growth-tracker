import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Stands in for the club or topic card before a learner has either. Same height
 * and shape as the card it replaces, so the row keeps its footing, and it ends
 * on the way to filling the gap rather than on an apology.
 */
export function EmptyCard({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Card className="h-full items-start justify-center gap-2 rounded-[14px] border-dashed p-4 md:p-5 lg:p-[22px]">
      <h3 className="text-base font-bold leading-tight tracking-tight text-foreground md:text-lg">
        {title}
      </h3>
      <p className="max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
        {body}
      </p>
      <Button
        variant="outline"
        onClick={onAction}
        className="group mt-1.5 rounded-[10px]"
      >
        {actionLabel}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </Card>
  );
}
