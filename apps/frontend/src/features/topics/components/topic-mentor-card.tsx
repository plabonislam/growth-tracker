import { Star, Timer } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { TopicMentor } from '../topics.types';

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function MetricTile({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="space-y-0.5 rounded-xl border border-border/60 p-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <p className="flex items-center gap-1 text-sm font-bold">
        {icon}
        {value}
      </p>
    </div>
  );
}

export function TopicMentorCard({ mentor }: { mentor: TopicMentor }) {
  return (
    <Card className="h-full justify-between gap-3 p-4 md:p-5">
      {/* Identity */}
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
          {initials(mentor.name)}
        </span>
        <div className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">
            Mentor
          </span>
          <h3 className="truncate font-serif text-lg font-semibold">
            {mentor.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {mentor.role}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricTile
          label="Rating"
          icon={<Star className="size-3.5 fill-amber-400 text-amber-400" />}
          value={mentor.rating.toFixed(1)}
        />
        <MetricTile
          label="Avg. Response"
          icon={<Timer className="size-3.5 text-primary" />}
          value={mentor.avgResponseTime}
        />
      </div>
    </Card>
  );
}
