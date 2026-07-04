import { useState } from 'react';

import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ClubJoinModal } from '@/features/clubs/components/club-join-modal';
import { ExploreClubsGrid } from '@/features/clubs/components/explore-clubs-grid';
import { navigate } from '@/lib/navigation';

export function ExplorePage() {
  const [joinClubId, setJoinClubId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <AppHeader />
      <main className="mx-auto mt-6 max-w-[1440px] px-4 md:px-6">
        <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight">
          Explore Clubs
        </h1>
        <ExploreClubsGrid
          onExplore={(club) => navigate(`/clubs/${club.id}`)}
          onJoin={(club) => setJoinClubId(club.id)}
        />
      </main>
      <BottomNav activePath="/explore" />

      <ClubJoinModal
        clubId={joinClubId ?? ''}
        open={joinClubId !== null}
        onClose={() => setJoinClubId(null)}
      />
    </div>
  );
}
