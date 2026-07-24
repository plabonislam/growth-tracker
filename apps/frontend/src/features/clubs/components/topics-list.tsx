import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Topic } from '../clubs.types';
import { TopicItem } from './topic-item';

interface TopicsListProps {
  topics: Topic[];
  onTopicAction?: (topic: Topic) => void;
  /** When provided, renders a "Create topic" action in the section header. */
  onCreateTopic?: () => void;
}

export function TopicsList({
  topics,
  onTopicAction,
  onCreateTopic,
}: TopicsListProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2.5 md:mb-3.5">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h3 className="font-serif text-[15px] font-bold text-foreground md:text-[17px] lg:text-xl">
            Explore curriculum
          </h3>
          <span className="shrink-0 text-[11.5px] text-muted-foreground md:text-[12.5px] lg:text-[13px]">
            {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
          </span>
        </div>

        {onCreateTopic && (
          <Button
            type="button"
            size="sm"
            onClick={onCreateTopic}
            aria-label="Create topic"
            className="shrink-0 gap-1.5 max-[479px]:size-9 max-[479px]:p-0"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            {/* Collapses to an icon button under 480px */}
            <span className="hidden min-[480px]:inline">Create topic</span>
          </Button>
        )}
      </div>

      {topics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-input px-5 py-10 text-center md:py-12 lg:py-14">
          <div className="text-[13.5px] font-semibold text-foreground lg:text-sm">
            No topics in this club yet
          </div>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground lg:text-[13px]">
            Create the first topic so learners have somewhere to start.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {topics.map((topic) => (
            <TopicItem key={topic.id} topic={topic} onAction={onTopicAction} />
          ))}
        </div>
      )}
    </section>
  );
}
