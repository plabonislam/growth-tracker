import { Award, NotebookText, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ActiveTopic } from '../dashboard.types';

/**
 * The topic being worked through, built to match the club card beside it —
 * same eyebrow, same tile, same progress row — so the pair reads as one
 * statement: this club, this topic. The action is pinned to the foot.
 */
export function ActiveTopicCard({
  topic,
  onContinue,
}: {
  topic: ActiveTopic;
  onContinue?: () => void;
}) {
  return (
    <Card className="h-full gap-0 rounded-[14px] p-4 md:p-5 lg:p-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {topic.completed ? (
          <span className="rounded-md border border-emerald-200 bg-emerald-100 px-2.5 py-1.5 text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em] text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
            Completed
          </span>
        ) : (
          <span className="rounded-md border border-amber-200 bg-amber-100 px-2.5 py-1.5 text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em] text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400">
            Active topic
          </span>
        )}
        <span className="text-[11.5px] font-medium leading-none text-muted-foreground">
          Started {topic.startedOn}
        </span>
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <span className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <NotebookText className="size-5" strokeWidth={1.9} />
        </span>
        <h3 className="min-w-0 text-base font-bold leading-tight tracking-tight text-foreground md:text-lg lg:text-xl">
          {topic.title}
        </h3>
      </div>

      <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
        {topic.description}
      </p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className="text-[11.5px] font-semibold leading-none text-muted-foreground">
            {topic.moduleLabel}
          </span>
          <span className="text-[13px] font-bold leading-none text-primary">
            {topic.progressPct}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
            style={{ width: `${topic.progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2.5 pt-3.5 md:pt-5">
        {/* Only a certifying topic has anything to say here; the rest is empty
            space that keeps the button where it was. */}
        <span className="text-[11.5px] font-medium leading-none text-muted-foreground">
          {topic.certificationNote}
        </span>
        <Button
          onClick={onContinue}
          variant={topic.completed ? 'outline' : 'default'}
          className="h-[46px] rounded-[10px] px-[18px] max-[479px]:w-full"
        >
          {topic.completed ? (
            <Award className="size-3.5" strokeWidth={2} />
          ) : (
            <Play className="size-3.5 fill-current" strokeWidth={0} />
          )}
          {topic.completed ? 'Review topic' : 'Continue learning'}
        </Button>
      </div>
    </Card>
  );
}
