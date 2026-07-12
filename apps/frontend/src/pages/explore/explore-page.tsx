import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ClubJoinModal } from '@/features/clubs/components/club-join-modal';
import { ExploreClubsGrid } from '@/features/clubs/components/explore-clubs-grid';
import { useClubs } from '@/features/clubs/hooks/use-clubs';
import { SectionHeading } from '@/components/ui/section-heading';

export function ExplorePage() {
  const navigate = useNavigate();
  const [joinClubId, setJoinClubId] = useState<string | null>(null);
  // Same query key as the grid — TanStack Query dedupes the request.
  const { data: clubs = [], isLoading } = useClubs();

  return (
    <div className="pb-24">
      <main className="mx-auto max-w-[1800px] px-4 md:px-6">
        {/* Page header — title, supporting copy, result count */}
        <SectionHeading
          as="h1"
          title="Explore Clubs"
          subtitle="Find your tribe — specialized guilds for every engineering discipline."
          className="py-8 md:py-10"
          action={
            !isLoading && (
              <span className="text-sm text-muted-foreground">
                Showing {clubs.length} clubs
              </span>
            )
          }
        />

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
