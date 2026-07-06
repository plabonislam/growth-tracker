import { ActiveTopicCard } from '@/features/dashboard/components/active-topic-card';
import { AgendaCard } from '@/features/dashboard/components/agenda-card';
import { JourneyCard } from '@/features/dashboard/components/journey-card';
import { LearningPathCard } from '@/features/dashboard/components/learning-path-card';
import { MetricTile } from '@/features/dashboard/components/metric-tile';
import { useLearnerDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { LandingHeader } from '@/features/landing/components/landing-header';
import { navigate } from '@/lib/navigation';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-serif text-2xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useLearnerDashboard();

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground">
      <LandingHeader showLogin={false} showNotifications />

      <main className="mx-auto max-w-[1800px] space-y-8 px-4 py-8 md:px-6">
        {isError && (
          <p className="py-12 text-center text-sm text-destructive">
            Couldn’t load your dashboard. Please try again.
          </p>
        )}

        {isLoading && (
          <div className="space-y-8">
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="h-48 animate-pulse rounded-xl bg-muted" />
              <div className="h-72 animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-40 animate-pulse rounded-xl bg-muted" />
              <div className="h-40 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Journey + metrics — metrics move beside the journey card on xl */}
            <section>
              <SectionTitle>Your Active Journey</SectionTitle>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <JourneyCard journey={data.journey} />
                </div>
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
                  <MetricTile
                    value={data.stats.completedTopics}
                    label="Completed Topics"
                  />
                  <MetricTile
                    value={data.stats.earnedCertificates}
                    label="Earned Certificates"
                    accent="text-amber-600"
                  />
                </div>
              </div>
            </section>

            {/* Active topic pairs with the learning path from lg (1024px) up;
                grid rows stretch both cards to the same height */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <ActiveTopicCard
                topic={data.activeTopic}
                onContinue={() => navigate(`/topics/${data.activeTopic.id}`)}
              />
              <LearningPathCard path={data.learningPath} />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <section>
                <SectionTitle>Upcoming Deadlines</SectionTitle>
                <AgendaCard items={data.deadlines} />
              </section>
              <section>
                <SectionTitle>Community Events</SectionTitle>
                <AgendaCard items={data.events} />
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
