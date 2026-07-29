import { Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { CreateSession } from 'shared';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useClubs } from '@/features/clubs/hooks/use-clubs';
import { SessionForm } from '@/features/sessions/components/session-form';
import { useLogSession } from '@/features/sessions/hooks/use-sessions';
import { fieldLabelClass } from '@/lib/form-styles';

/**
 * Centred and capped at a readable measure: full width at 360, and at 1800 a
 * form column rather than fields stretched across the screen.
 */
const containerClass =
  'mx-auto w-full max-w-[820px] px-4 pb-28 pt-5 sm:px-6 md:pb-32 md:pt-8 xl:pb-16';

/**
 * Logging a session a club has held. Reached from the sidebar rather than from
 * a club, so the club is the first thing the page has to settle: whoever runs
 * exactly one has it chosen for them, and anyone who runs several picks.
 *
 * Only the people who run a club get here at all — its mentors, its
 * coordinator, and an authority. The API refuses everyone else, so the page
 * says so rather than offering a form that would be rejected on submit.
 */
export function SessionFormPage() {
  const navigate = useNavigate();
  // `GET /clubs` is the only read that reports the caller's role per club,
  // which is what decides both access and the choice of club.
  const { data: clubs = [], isLoading } = useClubs();
  const { data: user } = useCurrentUser();
  const isAuthority = user?.roles?.isAuthority === true;

  // An authority answers for every club; everyone else for the ones they
  // coordinate or mentor in.
  const options = useMemo(
    () => (isAuthority ? clubs : clubs.filter((club) => club.role !== null)),
    [isAuthority, clubs],
  );

  const [picked, setPicked] = useState<string | undefined>(undefined);
  const clubId = picked ?? options[0]?.id;
  const club = options.find((option) => option.id === clubId);

  const { mutate, isPending, isError, error } = useLogSession(clubId ?? '');

  const handleSubmit = (values: CreateSession) => {
    mutate(values, { onSuccess: () => navigate('/dashboard') });
  };

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className="h-9 w-56 max-w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 h-[28rem] animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed p-8 text-center sm:p-10 md:p-14">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Lock className="size-5" strokeWidth={1.9} />
          </span>
          <h1 className="text-base font-bold text-foreground">
            No club to log a session for
          </h1>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            The session log is written by the people who run a club — its
            mentors and its coordinator. An authority assigns both.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <header className="mb-5 md:mb-6">
        <h1 className="font-serif text-[22px] font-bold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          Log a session
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
          Record a session the club has already held. It is counted in the
          club’s monthly activity sheet.
        </p>
      </header>

      {/* One club needs no choosing — it is named on the submit button and in
          the line above. The picker only appears with a decision. */}
      {options.length > 1 && (
        <div className="mb-5 space-y-1.5">
          <label className={fieldLabelClass} htmlFor="session-club">
            Club
          </label>
          <Select value={clubId} onValueChange={setPicked}>
            <SelectTrigger id="session-club" className="w-full sm:max-w-sm">
              <SelectValue placeholder="Pick a club" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isError && (
        <p className="mb-5 rounded-[10px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-[12.5px] leading-relaxed text-destructive">
          {error instanceof Error
            ? error.message
            : 'Couldn’t log that session. Please try again.'}
        </p>
      )}

      <SessionForm
        clubName={club.name}
        pending={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/dashboard')}
      />
    </div>
  );
}
