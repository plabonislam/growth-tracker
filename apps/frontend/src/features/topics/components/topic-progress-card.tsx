import { Card } from '@/components/ui/card';
import type { EnrolledTopicDetail } from '../topics.types';

function DateBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl bg-muted/40 p-4">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <p className="font-bold">{value}</p>
    </div>
  );
}

type TopicProgressCardProps = Pick<
  EnrolledTopicDetail,
  'startedOn' | 'estCompletion' | 'progressPct'
>;

export function TopicProgressCard({
  startedOn,
  estCompletion,
  progressPct,
}: TopicProgressCardProps) {
  return (
    <Card className="h-full justify-between gap-6 p-6 md:p-8">
      <div className="grid grid-cols-2 gap-4">
        <DateBox label="Started" value={startedOn} />
        <DateBox label="Est. Completion" value={estCompletion} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold">Overall Progress</h2>
          <span className="rounded-full bg-primary/10 px-5 py-1.5 text-lg font-bold text-primary">
            {progressPct}%
          </span>
        </div>
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Started
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
