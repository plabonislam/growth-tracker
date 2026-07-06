import {
  BookOpen,
  Library,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSearch } from '@/features/search/hooks/use-search';
import { navigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';

import type { SearchResult, SearchResultKind } from '../search.types';

const KIND_META: Record<
  SearchResultKind,
  { heading: string; icon: LucideIcon }
> = {
  club: { heading: 'Clubs', icon: Users },
  topic: { heading: 'Topics', icon: Library },
  module: { heading: 'Modules', icon: BookOpen },
};

const KIND_ORDER: SearchResultKind[] = ['club', 'topic', 'module'];

/**
 * Navbar search — trigger button plus a ⌘K command palette searching clubs,
 * topics, and modules. Full input-style trigger on `sm+`, icon button below.
 */
export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results } = useSearch(query);

  // Flat list in display order so arrow keys move through groups seamlessly.
  const ordered = useMemo(
    () =>
      KIND_ORDER.flatMap((kind) =>
        results.filter((result) => result.kind === kind),
      ),
    [results],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const select = useCallback(
    (result: SearchResult) => {
      close();
      navigate(result.path);
    },
    [close],
  );

  // Global ⌘K / Ctrl+K shortcut.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the highlighted row in range as results change.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, ordered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && ordered[activeIndex]) {
      select(ordered[activeIndex]);
    }
  };

  return (
    <>
      {/* Trigger — input lookalike on sm+, icon button on phones */}
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-full max-w-md items-center gap-2 rounded-full border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:flex"
      >
        <Search className="size-4" strokeWidth={1.75} />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border bg-background px-1.5 py-px font-sans text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:hidden"
      >
        <Search className="size-5" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-label="Search clubs, topics, and modules"
            className="mx-auto mt-24 w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search clubs, topics, modules…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="shrink-0 rounded border bg-muted px-1.5 py-px font-sans text-[10px] font-medium text-muted-foreground">
                Esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim() === '' && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Type to search across clubs, topics, and modules.
                </p>
              )}
              {query.trim() !== '' && ordered.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No matches for “{query.trim()}”. Try a different term.
                </p>
              )}

              {KIND_ORDER.map((kind) => {
                const group = ordered.filter((r) => r.kind === kind);
                if (group.length === 0) return null;
                const { heading, icon: Icon } = KIND_META[kind];
                return (
                  <div key={kind} className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                      {heading}
                    </p>
                    {group.map((result) => {
                      const index = ordered.indexOf(result);
                      return (
                        <button
                          key={`${result.kind}-${result.id}`}
                          type="button"
                          onClick={() => select(result)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left',
                            index === activeIndex && 'bg-primary/10',
                          )}
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Icon className="size-4" strokeWidth={1.75} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {result.title}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {result.subtitle}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
