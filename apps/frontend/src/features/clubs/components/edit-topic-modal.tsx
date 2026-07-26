import { useMemo } from 'react';
import { toast } from 'sonner';
import type { CreateTopic, CreateTopicInput } from 'shared';

import { getApiErrorMessage } from '@/services/http/client';
import { TopicFormModal } from './topic-form-modal';
import { useUpdateTopic } from '../hooks/use-clubs';
import type { Topic } from '../clubs.types';

type EditTopicModalProps = {
  clubId: string;
  /** The topic being edited. Rendering this modal at all means one is open. */
  topic: Topic;
  onClose: () => void;
};

export function EditTopicModal({
  clubId,
  topic,
  onClose,
}: EditTopicModalProps) {
  const mutation = useUpdateTopic(clubId);

  // Memoized on the fields it reads: the form reseeds whenever this changes,
  // so a new object each render would wipe the edit in progress.
  const defaultValues = useMemo<CreateTopicInput>(
    () => ({
      name: topic.title,
      // Topics predating descriptions have none; the field starts empty and
      // the schema's minimum makes filling it part of the edit.
      description: topic.description ?? '',
      mentorId: topic.mentor?.id ?? '',
      certificationRequired: topic.certificationRequired,
    }),
    [
      topic.title,
      topic.description,
      topic.mentor?.id,
      topic.certificationRequired,
    ],
  );

  const onSubmit = (values: CreateTopic) =>
    mutation.mutate(
      { topicId: topic.id, values, previousMentorId: topic.mentor?.id },
      {
        onSuccess: (updated) => {
          toast.success(`Topic “${updated.name}” updated`);
          onClose();
        },
        onError: (error) =>
          toast.error(
            getApiErrorMessage(
              error,
              'Couldn’t update the topic. Please try again.',
            ),
          ),
      },
    );

  return (
    <TopicFormModal
      open
      onClose={onClose}
      title="Edit topic"
      subtitle="Update this learning track’s details."
      defaultValues={defaultValues}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      pending={mutation.isPending}
      onSubmit={onSubmit}
    />
  );
}
