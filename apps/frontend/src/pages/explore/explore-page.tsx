import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ClubEditModal } from '@/features/clubs/components/club-edit-modal';
import { ClubJoinModal } from '@/features/clubs/components/club-join-modal';
import { ExploreClubsGrid } from '@/features/clubs/components/explore-clubs-grid';
import { useClubs } from '@/features/clubs/hooks/use-clubs';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/store/auth.store';

import type { Club } from '@/features/clubs/clubs.types';

export function ExplorePage() {
  const navigate = useNavigate();
  const isAuthority = useAuthStore((s) => s.isAuthority);
  const [joinClubId, setJoinClubId] = useState<string | null>(null);
  const [editClub, setEditClub] = useState<Club | null>(null);
  // Same query key as the grid — TanStack Query dedupes the request.
  const { data: clubs = [], isLoading } = useClubs();

  return (
    <div className="pb-24">
      <main className="mx-auto max-w-[1800px] px-4 md:px-6">
        {/* Page header — title, supporting copy, result count. An authority
            reads this page as a roster of what they run, not as a catalogue
            of clubs to join, so the copy says what is theirs to do here. */}
        <div className="py-8 md:py-10">
          <SectionHeading
            as="h1"
            title="Explore Clubs"
            subtitle={
              isAuthority
                ? 'Every club in the programme. Start a new one with Create Club above, open a club to see its topics and members, or edit it to change how it’s described.'
                : 'Find your tribe — specialized guilds for every engineering discipline.'
            }
          />
          {/* Under the copy rather than opposite it: the count describes the
              grid below, and reads as a caption there instead of competing
              with the title for the top line. */}
          {!isLoading && (
            <p className="mt-3 text-sm text-muted-foreground">
              Showing {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'}
            </p>
          )}
        </div>

        <ExploreClubsGrid
          onExplore={(club) => navigate(`/clubs/${club.id}`)}
          onJoin={(club) => setJoinClubId(club.id)}
          isAuthority={isAuthority}
          onEdit={setEditClub}
        />
      </main>

      <ClubJoinModal
        clubId={joinClubId ?? ''}
        open={joinClubId !== null}
        onClose={() => setJoinClubId(null)}
      />

      <ClubEditModal
        club={editClub}
        onClose={() => setEditClub(null)}
        onSaved={() => setEditClub(null)}
      />
    </div>
  );
}
