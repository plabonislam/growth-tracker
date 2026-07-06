import { CalendarDays, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ActiveTopic } from '../dashboard.types';

export function ActiveTopicCard({
  topic,
  onContinue,
}: {
  topic: ActiveTopic;
  onContinue?: () => void;
}) {
  return (
    <Card className="h-full gap-6 p-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-block rounded bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            Active Topic
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            Started {topic.startedOn}
          </span>
        </div>
        <h3 className="font-serif text-xl font-semibold leading-tight">
          {topic.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {topic.description}
        </p>
      </div>

      {/* Anchored to the card bottom so extra height opens between text and
          progress, never around the CTA. */}
      <div className="mt-auto space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            <span className="text-muted-foreground">{topic.moduleLabel}</span>
            <span className="text-primary">{topic.progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${topic.progressPct}%` }}
            />
          </div>
        </div>

        <Button
          size="lg"
          className="w-full md:w-fit md:px-6"
          onClick={onContinue}
        >
          <Play className="size-4" />
          Continue Learning
        </Button>
      </div>
    </Card>
  );
}
