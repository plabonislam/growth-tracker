import { useState } from 'react';

import { ClubJoinModal } from '@/features/clubs/components/club-join-modal';
import { ExploreClubsGrid } from '@/features/clubs/components/explore-clubs-grid';
import { useClubs } from '@/features/clubs/hooks/use-clubs';
import { navigate } from '@/lib/navigation';

export function ExplorePage() {
  const [joinClubId, setJoinClubId] = useState<string | null>(null);
  // Same query key as the grid — TanStack Query dedupes the request.
  const { data: clubs = [], isLoading } = useClubs();

  return (
    <div className="pb-24">
      <main className="mx-auto max-w-[1800px] px-4 md:px-6">
        {/* Page header — title, supporting copy, result count */}
        <div className="flex flex-col gap-2 py-8 md:flex-row md:items-end md:justify-between md:py-10">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">
              Explore Clubs
            </h1>
            <p className="mt-2 text-muted-foreground">
              Find your tribe — specialized guilds for every engineering
              discipline.
            </p>
          </div>
          {!isLoading && (
            <span className="shrink-0 text-sm text-muted-foreground">
              Showing {clubs.length} clubs
            </span>
          )}
        </div>

        <ExploreClubsGrid
          onExplore={(club) => navigate(`/clubs/${club.id}`)}
          onJoin={(club) => setJoinClubId(club.id)}
        />
      </main>

      <ClubJoinModal
        clubId={joinClubId ?? ''}
        open={joinClubId !== null}
        onClose={() => setJoinClubId(null)}
      />
    </div>
  );
}
