import { useParams } from 'react-router';

import { AppShell } from '@/components/layout/app-shell';
import { ClubDetailPage } from '@/pages/clubs/club-detail-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { PendingEnrollmentsPage } from '@/pages/enrollments/pending-enrollments-page';
import { ExplorePage } from '@/pages/explore/explore-page';
import { CreateModulePage } from '@/pages/topics/create-module-page';
import { EnrolledTopicPage } from '@/pages/topics/enrolled-topic-page';

export function ExploreRoute() {
  return (
    <AppShell activePath="/explore">
      <ExplorePage />
    </AppShell>
  );
}

export function DashboardRoute() {
  return (
    <AppShell activePath="/dashboard">
      <DashboardPage />
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
      <CreateModulePage topicId={topicId!} />
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
