import { BarChart3, Check, Clock, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';

import { ActiveTopicCard } from '@/features/dashboard/components/active-topic-card';
import { AgendaCard } from '@/features/dashboard/components/agenda-card';
import { EmptyCard } from '@/features/dashboard/components/empty-card';
import { JourneyCard } from '@/features/dashboard/components/journey-card';
import { MetricTile } from '@/features/dashboard/components/metric-tile';
import { METRIC_TONE } from '@/features/dashboard/dashboard.constants';
import { useLearnerDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';

/** "Md. Shahnur Islam Plabon" → "Md." — the greeting wants a name, not a record. */
function firstName(name: string | undefined) {
  return name?.trim().split(/\s+/)[0];
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useLearnerDashboard();
  const { data: user } = useCurrentUser();

  return (
    <div className="pb-16">
      <main className="mx-auto max-w-[1560px] space-y-4 px-4 py-6 md:space-y-5 md:px-6 md:py-8 lg:space-y-6">
        {isError && (
          <p className="py-12 text-center text-sm text-destructive">
            Couldn’t load your dashboard. Please try again.
          </p>
        )}

        {/* Mirrors the loaded shape: title, metric strip, pair, two lists. */}
        {isLoading && (
          <div className="space-y-4 md:space-y-5 lg:space-y-6">
            <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="h-64 animate-pulse rounded-xl bg-muted" />
              <div className="h-64 animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="h-44 animate-pulse rounded-xl bg-muted" />
              <div className="h-44 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        )}

        {data && (
          <>
            {/* The greeting carries the one thing to do next. The spec's
                cohort-standing pill sat here; nothing ranks a learner against
                their cohort, so there is nothing true to put in it. */}
            <div className="min-w-0">
              <h1 className="text-[21px] font-bold leading-tight tracking-tight text-foreground md:text-2xl lg:text-3xl">
                Welcome back
                {firstName(user?.name) ? `, ${firstName(user?.name)}` : ''}
              </h1>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground md:text-sm">
                {data.nudge}
              </p>
            </div>

            {/* Four across once there is room; two up until then. */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <MetricTile
                label="Completed topics"
                metric={data.stats.completedTopics}
                icon={Check}
                tone={METRIC_TONE.blue}
              />
              <MetricTile
                label="Certificates earned"
                metric={data.stats.earnedCertificates}
                icon={Trophy}
                tone={METRIC_TONE.orange}
              />
              <MetricTile
                label="Club progress"
                metric={data.stats.clubProgress}
                icon={BarChart3}
                tone={METRIC_TONE.emerald}
              />
              <MetricTile
                label="Learning time"
                metric={data.stats.learningTime}
                icon={Clock}
                tone={METRIC_TONE.violet}
              />
            </div>

            {/* The club and the topic inside it, side by side once both fit.
                Either can be missing — a learner joins a club before a topic,
                and is approved into each — so each has its own way in. */}
            <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
              {data.club ? (
                <JourneyCard journey={data.club} />
              ) : (
                <EmptyCard
                  title="No club yet"
                  body="Join a club to get a curriculum, a mentor, and the people learning alongside you."
                  actionLabel="Explore clubs"
                  onAction={() => navigate('/explore')}
                />
              )}

              {data.activeTopic ? (
                <ActiveTopicCard
                  topic={data.activeTopic}
                  onContinue={() => navigate(`/topics/${data.activeTopic!.id}`)}
                />
              ) : (
                <EmptyCard
                  title="No topic yet"
                  body={
                    data.club
                      ? `Enroll in a topic in ${data.club.clubName} to start working through its modules.`
                      : 'Once you are in a club, enroll in one of its topics to start learning.'
                  }
                  actionLabel={
                    data.club ? 'Browse its topics' : 'Explore clubs'
                  }
                  onAction={() =>
                    navigate(data.club ? `/clubs/${data.club.id}` : '/explore')
                  }
                />
              )}
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              <AgendaCard
                title="Upcoming deadlines"
                items={data.deadlines}
                emptyLabel="Nothing due right now."
                action={
                  // Counted off the rows themselves, so the pill can't claim a
                  // deadline the list isn't showing.
                  data.deadlines.some((item) => item.tone === 'error') && (
                    <span className="rounded-full bg-destructive/10 px-2.5 py-1.5 text-[10.5px] font-semibold leading-none text-destructive">
                      {data.deadlines.filter((i) => i.tone === 'error').length}{' '}
                      due today
                    </span>
                  )
                }
              />
              <AgendaCard
                title="Community events"
                items={data.events}
                emptyLabel="No events scheduled."
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
