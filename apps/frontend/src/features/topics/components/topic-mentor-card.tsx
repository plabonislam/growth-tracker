import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

export function TopicMentorCard({
  mentor,
  onMessage,
}: {
  mentor: TopicMentor;
  onMessage?: () => void;
}) {
  return (
    <Card className="h-full justify-between gap-4 p-6 md:p-8">
      {/* Identity */}
      <div className="space-y-3">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">
          Mentor
        </span>
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {initials(mentor.name)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-serif text-xl font-semibold">
              {mentor.name}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {mentor.role}
            </p>
          </div>
        </div>
      </div>

      {/* Action */}
      <Button size="lg" className="w-full" onClick={onMessage}>
        <MessageCircle className="size-4" />
        Message
      </Button>
    </Card>
  );
}
