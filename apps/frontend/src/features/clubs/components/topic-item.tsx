import { Pencil } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import type { Topic } from '../clubs.types';

/** Deterministic two-stop gradient for a mentor avatar, keyed by name. */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#FBD89A,#F26B1F)',
  'linear-gradient(135deg,#B8D4F8,#1F6FEB)',
  'linear-gradient(135deg,#D5C9FB,#7C5CFC)',
  'linear-gradient(135deg,#A7E5CC,#10B981)',
  'linear-gradient(135deg,#F9A8D4,#BE185D)',
];

function gradientFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash + name.charCodeAt(i)) % 997;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

/** Caps meta line — "N modules · N hours", omitting whatever the API lacks. */
function metaLabel(topic: Topic): string {
  const parts: string[] = [];
  if (topic.modules != null) {
    parts.push(
      `${topic.modules} ${topic.modules === 1 ? 'module' : 'modules'}`,
    );
  }
  if (topic.hours != null) parts.push(`${topic.hours} hours`);
  return parts.length ? parts.join(' · ') : 'Curriculum topic';
}

interface TopicItemProps {
  topic: Topic;
  onAction?: (topic: Topic) => void;
}

export function TopicItem({ topic, onAction }: TopicItemProps) {
  const userId = useAuthStore((s) => s.userId);
  // The topic's own mentor manages it; everyone else is there to learn.
  const isMentor = topic.mentor != null && topic.mentor.id === userId;

  return (
    <Card className="flex flex-col gap-2.5 p-5 transition-shadow hover:shadow-md">
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
        {metaLabel(topic)}
      </span>
      <h4 className="font-serif text-base font-bold leading-snug text-foreground">
        {topic.title}
      </h4>

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
        {/* Role label above the name — a bare name doesn't say who the person is */}
        <div className="flex min-w-0 items-center gap-2">
          {topic.mentor ? (
            <>
              <span
                aria-hidden
                className="size-7 shrink-0 rounded-full"
                style={{ background: gradientFor(topic.mentor.name) }}
              />
              <div className="min-w-0 leading-tight">
                <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mentor
                </div>
                <div className="truncate text-[13px] font-semibold text-foreground">
                  {topic.mentor.name}
                </div>
              </div>
            </>
          ) : (
            <div className="leading-tight">
              <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Mentor
              </div>
              <div className="text-[13px] text-muted-foreground">
                Not assigned yet
              </div>
            </div>
          )}
        </div>
        {/* Authoring reads as a bordered tool; enrolling stays the primary-tinted CTA */}
        {isMentor ? (
          <button
            type="button"
            onClick={() => onAction?.(topic)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-[13px] font-semibold text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Pencil className="size-3.5" strokeWidth={2.25} />
            Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAction?.(topic)}
            className="shrink-0 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {topic.enrolled ? 'Open' : 'Enroll'}
          </button>
        )}
      </div>
    </Card>
  );
}
