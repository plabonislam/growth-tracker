import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/services/http/client';
import { useDecideModuleReview } from '../hooks/use-topics';
import type { ModuleReviewRequest } from '../topics.types';

/**
 * The mentor's two answers to a submitted module. "Send back" is not a
 * rejection of the learner — it returns the module to their list to do again —
 * so it reads as an outline rather than a destructive action.
 */
export function ModuleReviewRowActions({
  request,
}: {
  request: ModuleReviewRequest;
}) {
  const decide = useDecideModuleReview();

  const act = (status: 'completed' | 'to_do') => {
    const { learner, moduleTitle } = request;

    decide.mutate(
      { moduleId: request.moduleId, learnerId: request.learnerId, status },
      {
        onSuccess: () =>
          status === 'completed'
            ? toast.success(`${learner.name}’s “${moduleTitle}” approved`)
            : toast(`“${moduleTitle}” sent back to ${learner.name}`),
        onError: (error) =>
          toast.error(
            getApiErrorMessage(
              error,
              `Couldn’t update “${moduleTitle}”. Please try again.`,
            ),
          ),
      },
    );
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        disabled={decide.isPending}
        onClick={() => act('completed')}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={decide.isPending}
        onClick={() => act('to_do')}
      >
        Send back
      </Button>
    </div>
  );
}
