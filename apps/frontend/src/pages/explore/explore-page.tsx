import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ExploreClubsGrid } from '@/features/clubs/components/explore-clubs-grid';

export function ExplorePage() {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <AppHeader />
      <main className="mx-auto mt-6 max-w-[1440px] px-4 md:px-6">
        <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight">
          Explore Clubs
        </h1>
        <ExploreClubsGrid />
      </main>
      <BottomNav activePath="/explore" />
    </div>
  );
}
