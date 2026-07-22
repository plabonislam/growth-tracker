import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  enrollmentsService,
  type EnrollmentType,
} from '../services/enrollments.service';

const ENROLLMENT_TYPES: EnrollmentType[] = ['club', 'topic'];

/** Query keys for the enrollments domain. */
export const ENROLLMENTS_KEYS = {
  all: ['enrollments'] as const,
  lists: () => [...ENROLLMENTS_KEYS.all, 'list'] as const,
  list: (type: EnrollmentType, page: number, pageSize: number) =>
    [...ENROLLMENTS_KEYS.lists(), { type, page, pageSize }] as const,
  count: (type: EnrollmentType) =>
    [...ENROLLMENTS_KEYS.lists(), 'count', type] as const,
};

export function usePendingEnrollments(
  type: EnrollmentType,
  page: number,
  pageSize: number,
) {
  return useQuery({
    queryKey: ENROLLMENTS_KEYS.list(type, page, pageSize),
    queryFn: () =>
      enrollmentsService.fetchEnrollments({
        type,
        limit: pageSize,
        offset: page * pageSize,
      }),
    // Keep the current page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

/**
 * Total pending requests across every enrollment type — used for the sidebar
 * badge. Fetches a minimal page per type (we only need `total`) and sums them.
 * Shares the `lists()` key prefix so enrollment mutations invalidate it too.
 */
export function usePendingEnrollmentsCount({ enabled = true } = {}) {
  return useQueries({
    queries: ENROLLMENT_TYPES.map((type) => ({
      queryKey: ENROLLMENTS_KEYS.count(type),
      queryFn: () =>
        enrollmentsService.fetchEnrollments({ type, limit: 1, offset: 0 }),
      enabled,
    })),
    combine: (results) => ({
      total: results.reduce((sum, r) => sum + (r.data?.total ?? 0), 0),
      isLoading: results.some((r) => r.isLoading),
    }),
  });
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsService.updateEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEYS.lists() });
    },
  });
}
