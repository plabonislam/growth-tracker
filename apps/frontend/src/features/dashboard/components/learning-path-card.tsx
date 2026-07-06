import { Check, Play } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LEARNING_PATH_STATUS } from '../dashboard.constants';
import type { LearningPath, LearningPathStatus } from '../dashboard.types';

function StepIndicator({
  status,
  order,
}: {
  status: LearningPathStatus;
  order: number;
}) {
  if (status === 'completed') {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="size-5" />
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Play className="size-4 fill-current" />
      </span>
    );
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold text-muted-foreground">
      {order}
    </span>
  );
}

export function LearningPathCard({
  path,
  onViewRoadmap,
}: {
  path: LearningPath;
  onViewRoadmap?: () => void;
}) {
  return (
    <Card className="h-full gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-semibold leading-tight">
            Your learning path
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{path.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onViewRoadmap}
          className="shrink-0 text-sm font-semibold text-primary hover:underline"
        >
          View full roadmap →
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {path.steps.map((step) => {
          const tone = LEARNING_PATH_STATUS[step.status];
          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-4 rounded-lg p-3',
                step.status === 'active' && 'bg-primary/10',
              )}
            >
              <StepIndicator status={step.status} order={step.order} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {step.title}
                </p>
                <p
                  className={cn(
                    'truncate text-xs',
                    step.status === 'active'
                      ? 'font-medium text-primary'
                      : 'text-muted-foreground',
                  )}
                >
                  {step.meta}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
                  tone.badge,
                )}
              >
                {tone.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
