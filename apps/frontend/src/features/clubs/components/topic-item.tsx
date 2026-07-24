import { Card } from '@/components/ui/card';
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
  return (
    <Card className="flex flex-col gap-2.5 p-5 transition-shadow hover:shadow-md">
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
        {metaLabel(topic)}
      </span>
      <h4 className="font-serif text-base font-bold leading-snug text-foreground">
        {topic.title}
      </h4>

      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <div className="flex min-w-0 items-center gap-2">
          {topic.mentor ? (
            <>
              <span
                aria-hidden
                className="size-6 shrink-0 rounded-full"
                style={{ background: gradientFor(topic.mentor.name) }}
              />
              <span className="truncate text-sm text-foreground">
                {topic.mentor.name}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Mentor TBD</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onAction?.(topic)}
          className="shrink-0 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {topic.enrolled ? 'Open' : 'Enroll'}
        </button>
      </div>
    </Card>
  );
}
