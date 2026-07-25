import { Search, User as UserIcon, X } from 'lucide-react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { UserResponse } from 'shared';

import { Input } from '@/components/ui/input';
import { useUsers } from '../hooks/use-users';

function matches(user: UserResponse, term: string) {
  return (
    user.name.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term)
  );
}

function Avatar({ user }: { user: UserResponse }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        <UserIcon className="size-4" />
      )}
    </span>
  );
}

interface MentorSelectProps
  extends Omit<React.ComponentProps<'div'>, 'onChange' | 'value'> {
  /** The selected mentor's user id (uuid), or undefined when none is chosen. */
  value?: string;
  onChange: (userId: string | undefined) => void;
}

/**
 * Type-ahead mentor picker. Mirrors CoordinatorSelect, but identifies the
 * selection by user id (see `AssignMentorSchema` / `CreateTopicSchema.mentorId`)
 * rather than email, since the backend assigns mentors by id.
 */
export const MentorSelect = forwardRef<HTMLDivElement, MentorSelectProps>(
  function MentorSelect({ value, onChange, id, ...rest }, ref) {
    const { data: users = [] } = useUsers();
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const selected = useMemo(
      () => users.find((user) => user.id === value),
      [users, value],
    );

    const results = useMemo(() => {
      const term = query.trim().toLowerCase();
      if (!term) return [];
      return users.filter((user) => matches(user, term)).slice(0, 6);
    }, [users, query]);

    useEffect(() => {
      if (!open) return;
      const onPointerDown = (e: MouseEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', onPointerDown);
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('mousedown', onPointerDown);
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [open]);

    if (selected) {
      return (
        <div
          ref={ref}
          id={id}
          {...rest}
          className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2"
        >
          <Avatar user={selected} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selected.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {selected.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setQuery('');
            }}
            aria-label="Change mentor"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      );
    }

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        {...rest}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          placeholder="Search by name or email..."
          className="pl-10"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open && query.trim() !== '' && (
          <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border bg-card shadow-lg">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No users found.
              </p>
            ) : (
              <ul className="max-h-60 overflow-y-auto py-1">
                {results.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(user.id);
                        setQuery('');
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <Avatar user={user} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {user.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  },
);
