import type { RouteObject } from 'react-router';

import { LandingPage } from '@/pages/landing/landing-page';
import { LoginPage } from '@/pages/login/login-page';
import { CallbackPage } from '@/pages/auth/callback-page';
import { ProtectedRoute } from './protected-route';
import {
  ClubDetailRoute,
  CreateModuleRoute,
  EditModuleRoute,
  DashboardRoute,
  EnrolledTopicRoute,
  ExploreRoute,
  // LogSessionRoute, // session creation comes from a third-party app
  PendingEnrollmentsRoute,
} from './route-elements';

export const routes: RouteObject[] = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <CallbackPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/explore', element: <ExploreRoute /> },
      { path: '/dashboard', element: <DashboardRoute /> },
      {
        path: '/pending-enrollments',
        element: <PendingEnrollmentsRoute />,
      },
      { path: '/topics/:topicId', element: <EnrolledTopicRoute /> },
      {
        path: '/topics/:topicId/modules/new',
        element: <CreateModuleRoute />,
      },
      {
        path: '/topics/:topicId/modules/:moduleId/edit',
        element: <EditModuleRoute />,
      },
      // Sessions are created by a third-party app — no in-app creation form.
      // { path: '/sessions/new', element: <LogSessionRoute /> },
      { path: '/clubs/:clubId', element: <ClubDetailRoute /> },
    ],
  },
  { path: '*', element: <LandingPage /> },
];
