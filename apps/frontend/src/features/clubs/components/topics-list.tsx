import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Topic, TopicAction } from '../clubs.types';
import { TopicItem } from './topic-item';

interface TopicsListProps {
  topics: Topic[];
  onTopicAction?: (topic: Topic, action: TopicAction) => void;
  /** True for an authority or the club's coordinator — see `TopicItem`. */
  canEditTopics?: boolean;
  /** When provided, renders a "Create topic" action in the section header. */
  onCreateTopic?: () => void;
}

export function TopicsList({
  topics,
  onTopicAction,
  canEditTopics,
  onCreateTopic,
}: TopicsListProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2.5 md:mb-3.5">
        <div className="flex min-w-0 items-baseline gap-2.5">
          {/* Typed like `SectionHeading` — the h3 keeps its place in the page's
              outline, but reads at the same size as "Explore Clubs". */}
          <h3 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Explore curriculum
          </h3>
          {/* <span className="shrink-0 text-sm text-muted-foreground">
            {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
          </span> */}
        </div>

        {onCreateTopic && (
          <Button
            type="button"
            onClick={onCreateTopic}
            aria-label="Create Topic"
            className="shrink-0 gap-1.5 max-[479px]:size-9 max-[479px]:p-0"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            {/* Collapses to an icon button under 480px */}
            <span className="hidden min-[480px]:inline">Create Topic</span>
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
            <TopicItem
              key={topic.id}
              topic={topic}
              canEditTopic={canEditTopics}
              onAction={onTopicAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}
