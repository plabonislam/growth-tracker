import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TOPIC_ACCESS_NOTE } from '../clubs.constants';
import type { MembershipStatus } from '../clubs.types';

interface ClubMembershipNoticeProps {
  /** The caller's standing in the club; `null` when they have never applied. */
  membership: MembershipStatus | null;
  /** Opens the club's join form. */
  onJoin: () => void;
}

/**
 * Says why the topics below carry no enroll action, and offers the way in when
 * there is one. An active member sees nothing — they have the action already,
 * so there is nothing to explain.
 */
export function ClubMembershipNotice({
  membership,
  onJoin,
}: ClubMembershipNoticeProps) {
  if (membership === 'active') return null;

  // A membership row already exists for every other status, and the API
  // rejects a second application — so applying is offered only to a newcomer.
  const canApply = membership === null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-input bg-muted/30 px-5 py-4 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
      <div className="flex items-start gap-2.5 min-[560px]:items-center">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground min-[560px]:mt-0" />
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {TOPIC_ACCESS_NOTE[membership ?? 'none']}
        </p>
      </div>
      {canApply && (
        <Button
          type="button"
          onClick={onJoin}
          className="shrink-0 max-[559px]:w-full"
        >
          Join club
        </Button>
      )}
    </div>
  );
}
