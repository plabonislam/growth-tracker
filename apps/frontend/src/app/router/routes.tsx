import type { RouteObject } from 'react-router';

import { LandingPage } from '@/pages/landing/landing-page';
import { LoginPage } from '@/pages/login/login-page';
import { CallbackPage } from '@/pages/auth/callback-page';
import { ProtectedRoute } from './protected-route';
import {
  ClubDetailRoute,
  DashboardRoute,
  EnrolledTopicRoute,
  ExploreRoute,
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
      { path: '/topics/:topicId', element: <EnrolledTopicRoute /> },
      { path: '/clubs/:clubId', element: <ClubDetailRoute /> },
    ],
  },
  { path: '*', element: <LandingPage /> },
];
