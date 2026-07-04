import { BottomNav } from '@/components/layout/bottom-nav';
import { PageHeader } from '@/components/layout/page-header';
import { ClubExpectations } from '@/features/clubs/components/club-expectations';
import { ClubHero } from '@/features/clubs/components/club-hero';
import { TopicsList } from '@/features/clubs/components/topics-list';
import { useClubDetail } from '@/features/clubs/hooks/use-clubs';
import { navigate } from '@/lib/navigation';

export function ClubDetailPage({ clubId }: { clubId: string }) {
  const { data: club, isLoading, isError } = useClubDetail(clubId);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <PageHeader title="Club Detail" onBack={() => navigate('/explore')} />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
        {isError && (
          <p className="py-12 text-center text-sm text-destructive">
            Couldn’t load this club. Please try again.
          </p>
        )}

        {isLoading && (
          <div className="space-y-6">
            <div className="h-[240px] animate-pulse rounded-xl bg-muted md:h-[320px]" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {club && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-12">
              <ClubHero
                name={club.name}
                tone={club.tone}
                topicsCount={club.topicsCount}
                membersLabel={club.membersLabel}
              />
            </div>
            <div className="md:col-span-4">
              <ClubExpectations
                expectationsIntro={club.expectationsIntro}
                expectations={club.expectations}
                mentorshipFocus={club.mentorshipFocus}
              />
            </div>
            <div className="md:col-span-8">
              <TopicsList topics={club.topics} />
            </div>
          </div>
        )}
      </main>

      <BottomNav activePath="/explore" />
    </div>
  );
}
