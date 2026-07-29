import { useParams } from 'react-router';

import { AppShell } from '@/components/layout/app-shell';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useTopic } from '@/features/topics/hooks/use-topics';
import { ClubDetailPage } from '@/pages/clubs/club-detail-page';
import { ClubDashboard } from '@/pages/dashboard/club-dashboard';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { PendingEnrollmentsPage } from '@/pages/enrollments/pending-enrollments-page';
import { ExplorePage } from '@/pages/explore/explore-page';
// import { SessionFormPage } from '@/pages/sessions/session-form-page';
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
 * One route, two dashboards. Whoever answers for a club reads its activity
 * sheet; everyone else reads their own learning. A coordinator can't be a
 * learner in their own club, so showing them the learner page — as this route
 * used to — left them staring at an invitation to join something.
 *
 * A mentor sits on the learner side of that line: they answer for a topic
 * rather than for the club's month, and they learn here too, so the learner
 * dashboard is the one with something to tell them.
 */
export function DashboardRoute() {
  const { data: user, isLoading } = useCurrentUser();
  const roles = user?.roles;
  const answersForAClub = roles?.isAuthority || roles?.isCoordinator;

  return (
    <AppShell activePath="/dashboard">
      {/* Held until the roles arrive — picking early would flash the wrong
          dashboard at a coordinator on every load. */}
      {isLoading ? (
        <div className="mx-auto max-w-[1560px] space-y-4 px-4 py-8 md:px-6">
          <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : answersForAClub ? (
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
  // The topic is what says which club to go back to. The page asks for it too
  // — this is the same cached query, not a second fetch. Until it lands the
  // arrow points at the dashboard, which is somewhere rather than nowhere.
  const { data: topic } = useTopic(topicId!);

  return (
    <AppShell
      activePath="/dashboard"
      backTo={topic ? `/clubs/${topic.clubId}` : '/dashboard'}
      breadcrumb={[{ label: 'Manage Module' }]}
    >
      <EnrolledTopicPage topicId={topicId!} />
    </AppShell>
  );
}

export function CreateModuleRoute() {
  const { topicId } = useParams();
  // The topic the module belongs to is the context worth naming up here — the
  // page's own h1 already says whether it's a new module or an edit. Same
  // cached query the form page reads.
  const { data: topic } = useTopic(topicId!);
  return (
    <AppShell
      activePath="/dashboard"
      backTo={`/topics/${topicId}`}
      breadcrumb={[{ label: topic?.name ?? 'New Module' }]}
    >
      <ModuleFormPage topicId={topicId!} />
    </AppShell>
  );
}

export function EditModuleRoute() {
  const { topicId, moduleId } = useParams();
  const { data: topic } = useTopic(topicId!);
  return (
    <AppShell
      activePath="/dashboard"
      backTo={`/topics/${topicId}`}
      breadcrumb={[{ label: topic?.name ?? 'Edit Module' }]}
    >
      <ModuleFormPage topicId={topicId!} moduleId={moduleId!} />
    </AppShell>
  );
}

// Session creation is owned by a third-party app, so this route is not
// mounted. Kept commented rather than deleted alongside its page and form.
// export function LogSessionRoute() {
//   return (
//     <AppShell
//       activePath="/sessions/new"
//       breadcrumb={[{ label: 'Log a session' }]}
//     >
//       <SessionFormPage />
//     </AppShell>
//   );
// }

export function ClubDetailRoute() {
  const { clubId } = useParams();
  return (
    <AppShell
      activePath="/explore"
      backTo="/explore"
      breadcrumb={[{ label: 'Club Details' }]}
    >
      <ClubDetailPage clubId={clubId!} />
    </AppShell>
  );
}
