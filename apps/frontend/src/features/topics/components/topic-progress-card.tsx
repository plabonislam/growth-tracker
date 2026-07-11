import { Card } from '@/components/ui/card';
import type { EnrolledTopicDetail } from '../topics.types';

function DateBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5 rounded-xl border border-border/60 p-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

type TopicProgressCardProps = Pick<
  EnrolledTopicDetail,
  'startedOn' | 'estCompletion' | 'progressPct'
> & {
  modulesDone: number;
  modulesTotal: number;
};

export function TopicProgressCard({
  startedOn,
  estCompletion,
  progressPct,
  modulesDone,
  modulesTotal,
}: TopicProgressCardProps) {
  return (
    <Card className="h-full justify-between gap-4 p-4 md:p-5">
      <div className="grid grid-cols-2 gap-3">
        <DateBox label="Started" value={startedOn} />
        <DateBox label="Est. Completion" value={estCompletion} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold">Overall Progress</h2>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            {progressPct}%
          </span>
        </div>
        <div>
          <div className="relative h-2.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
            {/* Position marker at the leading edge of the fill. */}
            <span
              className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-sm transition-all duration-1000"
              style={{ left: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Started
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {modulesDone} of {modulesTotal} modules completed
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Goal
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
