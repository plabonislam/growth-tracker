import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ClubJoinErrorCode } from 'shared';

import { Button } from '@/components/ui/button';
import { getApiErrorCode, getApiErrorMessage } from '@/services/http/client';
import { useClubs } from '../hooks/use-clubs';

/**
 * A refused application, explained. The sentence is the server's — it is the
 * only side that knows which of the eight refusals happened and which club to
 * name — and this adds the one thing a sentence can't be: somewhere to go.
 *
 * Codes with no button are the ones only a coordinator can move. Offering an
 * action there would be offering something that doesn't exist.
 */
export function ClubJoinError({
  error,
  clubId,
}: {
  error: unknown;
  clubId: string;
}) {
  const navigate = useNavigate();
  const code = getApiErrorCode(error);
  const message = getApiErrorMessage(
    error,
    'Something went wrong submitting your application. Please try again.',
  );

  // Only fetched to resolve one link: the message names the club they are
  // active in, so the button should open that club rather than the list.
  const { data: clubs = [] } = useClubs();
  const activeClub = clubs.find((club) => club.membership === 'active');

  let action: { label: string; onClick: () => void } | null = null;
  if (code === ClubJoinErrorCode.ACTIVE_IN_OTHER_CLUB && activeClub) {
    action = {
      label: `Open ${activeClub.name}`,
      onClick: () => navigate(`/clubs/${activeClub.id}`),
    };
  } else if (
    code === ClubJoinErrorCode.ALREADY_MEMBER ||
    code === ClubJoinErrorCode.APPLICATION_PENDING
  ) {
    action = {
      label: 'Open this club',
      onClick: () => navigate(`/clubs/${clubId}`),
    };
  } else if (
    code === ClubJoinErrorCode.CLUB_ARCHIVED ||
    code === ClubJoinErrorCode.CLUB_NOT_FOUND
  ) {
    action = {
      label: 'Back to Explore Clubs',
      onClick: () => navigate('/explore'),
    };
  }

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-[10px] border border-destructive/30 bg-destructive/5 p-4"
    >
      <div className="flex gap-2.5">
        <AlertCircle
          className="mt-px size-4 shrink-0 text-destructive"
          strokeWidth={2}
        />
        <p className="text-[13px] leading-relaxed text-destructive">
          {message}
        </p>
      </div>
      {action && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="h-11 self-start md:h-8"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
