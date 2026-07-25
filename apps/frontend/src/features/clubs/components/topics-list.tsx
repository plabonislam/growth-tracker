import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
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
      <SectionHeading
        as="h1"
        title="Explore curriculum"
        // flex-row: title and action share a line at every width, which is what
        // the button's icon-only collapse under 480px is built for.
        className="mb-3 flex-row items-center md:mb-3.5"
        action={
          onCreateTopic && (
            <Button
              type="button"
              onClick={onCreateTopic}
              aria-label="Create Topic"
              className="gap-1.5 max-[479px]:size-9 max-[479px]:p-0"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              {/* Collapses to an icon button under 480px */}
              <span className="hidden min-[480px]:inline">Create Topic</span>
            </Button>
          )
        }
      />

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
