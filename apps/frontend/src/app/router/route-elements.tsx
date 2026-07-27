import { useParams } from 'react-router';

import { AppShell } from '@/components/layout/app-shell';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { ClubDetailPage } from '@/pages/clubs/club-detail-page';
import { ClubDashboard } from '@/pages/dashboard/club-dashboard';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { PendingEnrollmentsPage } from '@/pages/enrollments/pending-enrollments-page';
import { ExplorePage } from '@/pages/explore/explore-page';
import { ModuleFormPage } from '@/pages/topics/module-form-page';
import { EnrolledTopicPage } from '@/pages/topics/enrolled-topic-page';

export function ExploreRoute() {
  return (
    <AppShell activePath="/explore">
      <ExplorePage />
    </AppShell>
  );
}

/**
 * One route, two dashboards. Whoever runs a club reads its reporting board;
 * everyone else reads their own learning. A coordinator can't be a learner in
 * their own club, so showing them the learner page — as this route used to —
 * left them staring at an invitation to join something.
 */
export function DashboardRoute() {
  const { data: user, isLoading } = useCurrentUser();
  const roles = user?.roles;
  const runsAClub =
    roles?.isAuthority || roles?.isCoordinator || roles?.isMentor;

  return (
    <AppShell activePath="/dashboard">
      {/* Held until the roles arrive — picking early would flash the wrong
          dashboard at a coordinator on every load. */}
      {isLoading ? (
        <div className="mx-auto max-w-[1560px] space-y-4 px-4 py-8 md:px-6">
          <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : runsAClub ? (
        <ClubDashboard />
      ) : (
        <DashboardPage />
      )}
    </AppShell>
  );
}

export function PendingEnrollmentsRoute() {
  return (
    <AppShell activePath="/pending-enrollments">
      <PendingEnrollmentsPage />
    </AppShell>
  );
}

export function EnrolledTopicRoute() {
  const { topicId } = useParams();
  return (
    <AppShell
      activePath="/dashboard"
      breadcrumb={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Enrolled Topic' },
      ]}
    >
      <EnrolledTopicPage topicId={topicId!} />
    </AppShell>
  );
}

export function CreateModuleRoute() {
  const { topicId } = useParams();
  return (
    <AppShell
      activePath="/dashboard"
      breadcrumb={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Enrolled Topic', path: `/topics/${topicId}` },
        { label: 'New Module' },
      ]}
    >
      <ModuleFormPage topicId={topicId!} />
    </AppShell>
  );
}

export function EditModuleRoute() {
  const { topicId, moduleId } = useParams();
  return (
    <AppShell
      activePath="/dashboard"
      breadcrumb={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Enrolled Topic', path: `/topics/${topicId}` },
        { label: 'Edit Module' },
      ]}
    >
      <ModuleFormPage topicId={topicId!} moduleId={moduleId!} />
    </AppShell>
  );
}

export function ClubDetailRoute() {
  const { clubId } = useParams();
  return (
    <AppShell
      activePath="/explore"
      breadcrumb={[
        { label: 'Explore Clubs', path: '/explore' },
        { label: 'Club Details' },
      ]}
    >
      <ClubDetailPage clubId={clubId!} />
    </AppShell>
  );
}
