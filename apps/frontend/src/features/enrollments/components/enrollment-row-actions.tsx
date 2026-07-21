import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        disabled={!canAct}
        onClick={() =>
          update.mutate({
            type,
            targetId: targetId!,
            userId: request.userId!,
            status: 'approved',
          })
        }
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={!canAct}
        onClick={() =>
          update.mutate({
            type,
            targetId: targetId!,
            userId: request.userId!,
            status: 'rejected',
          })
        }
      >
        Reject
      </Button>
    </div>
  );
}
