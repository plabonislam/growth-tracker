import { toast } from 'sonner';
import type { CreateTopic } from 'shared';

import { getApiErrorMessage } from '@/services/http/client';
import { TopicFormModal } from './topic-form-modal';
import { EMPTY_TOPIC } from '../clubs.constants';
import { useCreateTopic } from '../hooks/use-clubs';

type CreateTopicModalProps = {
  clubId: string;
  open: boolean;
  onClose: () => void;
};

export function CreateTopicModal({
  clubId,
  open,
  onClose,
}: CreateTopicModalProps) {
  const mutation = useCreateTopic(clubId);

  const onSubmit = (values: CreateTopic) =>
    mutation.mutate(values, {
      onSuccess: (topic) => {
        toast.success(`Topic “${topic.name}” created`);
        onClose();
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(
            error,
            'Couldn’t create the topic. Please try again.',
          ),
        ),
    });

  return (
    <TopicFormModal
      open={open}
      onClose={onClose}
      title="Create a topic"
      subtitle="Add a new learning track to this club."
      defaultValues={EMPTY_TOPIC}
      submitLabel="Create topic"
      pendingLabel="Creating…"
      pending={mutation.isPending}
      onSubmit={onSubmit}
    />
  );
}
