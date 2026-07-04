import type { Topic } from '../clubs.types';
import { TopicItem } from './topic-item';

interface TopicsListProps {
  topics: Topic[];
  onTopicAction?: (topic: Topic) => void;
}

export function TopicsList({ topics, onTopicAction }: TopicsListProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-2xl font-semibold">
          Topics in the club
        </h3>
        <span className="text-sm text-muted-foreground">
          Showing {topics.length} results
        </span>
      </div>
      <div className="space-y-4">
        {topics.map((topic) => (
          <TopicItem key={topic.id} topic={topic} onAction={onTopicAction} />
        ))}
      </div>
    </section>
  );
}
