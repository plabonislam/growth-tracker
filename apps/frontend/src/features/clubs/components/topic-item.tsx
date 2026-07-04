import { BookOpen, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CLUB_TONE, MENTOR_ROLE_META, TOPIC_ICONS } from '../clubs.constants';
import type { Topic } from '../clubs.types';

function mentorInitials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface TopicItemProps {
  topic: Topic;
  onAction?: (topic: Topic) => void;
}

export function TopicItem({ topic, onAction }: TopicItemProps) {
  const tone = CLUB_TONE[topic.tone];
  const Icon = TOPIC_ICONS[topic.iconKey];

  return (
    <Card className="flex flex-col justify-between gap-4 border-slate-100 p-4 transition-shadow hover:shadow-md md:flex-row md:items-center md:p-6">
      <div className="flex items-start gap-4">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${tone.bgSoft}`}
        >
          <Icon className={`size-6 ${tone.text}`} />
        </div>
        <div>
          <h4 className="mb-1 font-serif text-lg font-semibold">
            {topic.title}
          </h4>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className="flex items-center gap-1 text-sm">
              <BookOpen className="size-4" />
              {topic.modules} Modules
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Clock className="size-4" />
              {topic.hours} hrs
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
              {mentorInitials(topic.mentor.name)}
            </span>
            <span className="text-sm font-medium">{topic.mentor.name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                MENTOR_ROLE_META[topic.mentor.role]
              }`}
            >
              {topic.mentor.role}
            </span>
          </div>
        </div>
      </div>

      <Button
        className="w-full px-8 md:w-auto"
        onClick={() => onAction?.(topic)}
      >
        {topic.enrolled ? 'Open' : 'Enroll'}
      </Button>
    </Card>
  );
}
