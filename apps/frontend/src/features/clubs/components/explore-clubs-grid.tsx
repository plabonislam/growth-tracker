import { Card } from '@/components/ui/card';
import type { Club } from '../clubs.types';
import { useClubs } from '../hooks/use-clubs';
import { ClubCard } from './club-card';

function CardSkeleton() {
  return <Card className="h-64 animate-pulse border-t-4 border-t-muted" />;
}

interface ExploreClubsGridProps {
  onExplore?: (club: Club) => void;
  onJoin?: (club: Club) => void;
}

export function ExploreClubsGrid({ onExplore, onJoin }: ExploreClubsGridProps) {
  const { data: clubs = [], isLoading, isError } = useClubs();

  if (isError) {
    return (
      <p className="py-12 text-center text-sm text-destructive">
        Couldn’t load clubs. Please try again.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        : clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onExplore={onExplore}
              onJoin={onJoin}
            />
          ))}
    </div>
  );
}
