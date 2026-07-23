import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/services/http/client';
import { useUpdateEnrollment } from '../hooks/use-enrollments';
import type { EnrollmentRequest } from '../enrollments.types';

/**
 * Per-row approve/reject. Calls the mutation hook directly so the generic
 * DataTable stays ignorant of enrollment business logic.
 */
export function EnrollmentRowActions({
  request,
}: {
  request: EnrollmentRequest;
}) {
  const update = useUpdateEnrollment();
  const type = request.clubId ? 'club' : 'topic';
  const targetId = request.clubId ?? request.topicId;
  const canAct = Boolean(targetId && request.userId) && !update.isPending;

  const act = (status: 'approved' | 'rejected') => {
    const applicant = request.requester.name;
    const verb = status === 'approved' ? 'approved' : 'rejected';

    update.mutate(
      { type, targetId: targetId!, userId: request.userId!, status },
      {
        onSuccess: () => {
          const message = `${applicant}'s application was ${verb}`;
          if (status === 'approved') toast.success(message);
          else toast(message);
        },
        onError: (error) => {
          toast.error(
            getApiErrorMessage(
              error,
              `Couldn't ${status === 'approved' ? 'approve' : 'reject'} ${applicant}'s application. Please try again.`,
            ),
          );
        },
      },
    );
  };

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" disabled={!canAct} onClick={() => act('approved')}>
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={!canAct}
        onClick={() => act('rejected')}
      >
        Reject
      </Button>
    </div>
  );
}
