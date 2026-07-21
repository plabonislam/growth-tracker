import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  enrollmentsService,
  type EnrollmentType,
} from '../services/enrollments.service';

/** Query keys for the enrollments domain. */
export const ENROLLMENTS_KEYS = {
  all: ['enrollments'] as const,
  lists: () => [...ENROLLMENTS_KEYS.all, 'list'] as const,
  list: (type: EnrollmentType, page: number, pageSize: number) =>
    [...ENROLLMENTS_KEYS.lists(), { type, page, pageSize }] as const,
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

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsService.updateEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEYS.lists() });
    },
  });
}
