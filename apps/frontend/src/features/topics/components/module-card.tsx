import { ChevronDown, Clock, FileText, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { UpdateModuleProgress } from 'shared';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  LEARNER_MODULE_TRANSITIONS,
  MODULE_STATUS_META,
  RESOURCE_KIND_META,
} from '../topics.constants';
import type { ModuleStatus, ResourceKind } from '../topics.types';

/** What the learner may set themselves — the mentor owns `completed`. */
export type LearnerModuleStatus = UpdateModuleProgress['status'];

/** A resource as the card needs it, whoever is looking at it. */
export type ModuleCardResource = {
  id: string;
  kind: ResourceKind;
  label: string;
  /** Omitted → the action badge is hidden. */
  url?: string;
  /** Learner progress. Mentors have none, so it stays undefined. */
  done?: boolean;
};

/**
 * The card's view of a module. `TopicModule` satisfies it as-is; the mentor's
 * `CurriculumModule` is mapped onto it in `mentor-topic-view`.
 */
export type ModuleCardModule = {
  id: string;
  /** 1-based, rendered as "Module 01". */
  order: number;
  title: string;
  weightPct: number;
  /** Preformatted, e.g. "2h 30m". Empty hides the chip. */
  estTime: string;
  resources: ModuleCardResource[];
  /** Learner progress. Omitted for a mentor, who is authoring, not learning. */
  status?: ModuleStatus;
  /** Mentor-authored learning content, shown under the title when present. */
  description?: string | null;
};

function ResourceRow({ resource }: { resource: ModuleCardResource }) {
  const meta = RESOURCE_KIND_META[resource.kind];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2.5 rounded-[9px] border bg-muted/40 px-2.5 py-2 transition-colors hover:border-primary/30 hover:bg-primary/5">
      <Icon
        className={cn(
          'size-3.5 shrink-0',
          resource.done ? 'text-emerald-500' : 'text-primary',
        )}
        strokeWidth={1.8}
      />
      {/* One line, ellipsised: a resource is scanned in a list, not read here */}
      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium leading-[1.35] text-muted-foreground">
        {resource.label}
      </span>
      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-[7px] border bg-card px-2.5 py-1.5 text-[11.5px] font-semibold text-primary transition-colors hover:border-primary/50"
        >
          {meta.action}
        </a>
      )}
    </div>
  );
}

/** Chip geometry shared by the weight and duration pills in the card header. */
const CHIP =
  'text-[9.5px] font-semibold uppercase tracking-[0.06em] text-foreground/75';

/**
 * Generic over the module so `onMarkDone` hands the caller back its own type
 * rather than the card's narrowed view of it.
 */
export function ModuleCard<T extends ModuleCardModule>({
  module,
  emptyResourcesLabel,
  weightBar = false,
  onMarkDone,
  onSetStatus,
  onEdit,
  onDelete,
}: {
  module: T;
  /** Shown in place of the resource list when there are none. */
  emptyResourcesLabel?: string;
  /**
   * Renders the module's share of the topic budget as a bar under the title.
   * Mentor-only: to a learner a filled bar reads as progress, which it isn't.
   */
  weightBar?: boolean;
  /**
   * Asks to send the module for review. Kept apart from `onSetStatus` because
   * the caller confirms it first — the mentor is about to be given work.
   */
  onMarkDone?: (module: T) => void;
  /**
   * Sets the module's state directly. Omitted turns the status pill back into a
   * plain label, which is what a mentor reading their own curriculum sees.
   */
  onSetStatus?: (module: T, status: LearnerModuleStatus) => void;
  /** Omitted for anyone but the topic's mentor — hides the edit control. */
  onEdit?: (module: T) => void;
  /** Omitted for anyone but the topic's mentor — hides the delete control. */
  onDelete?: (module: T) => void;
}) {
  const meta = module.status ? MODULE_STATUS_META[module.status] : null;
  const NoteIcon = meta?.icon;

  // Resources start folded so a row of cards compares on title and status;
  // opening one is a deliberate step into the material.
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourceCount = module.resources.length;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // An approved module is the mentor's to reopen, so its pill stops being a
  // control — there is nothing the learner may set it to.
  const canSetStatus =
    Boolean(onSetStatus) &&
    module.status !== undefined &&
    module.status !== 'completed';

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const choose = (status: LearnerModuleStatus) => {
    setMenuOpen(false);
    // Sending for review is the one move with a consequence for someone else,
    // so it goes through the caller's confirmation rather than straight out.
    if (status === 'pending_confirmation') onMarkDone?.(module);
    else onSetStatus?.(module, status);
  };

  return (
    <Card className="h-full w-full max-w-[800px] gap-0 rounded-[14px] px-4 pb-3.5 pt-[15px] shadow-sm transition-[box-shadow,border-color] duration-150 hover:border-input hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-[7px]">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
            Module {String(module.order).padStart(2, '0')}
          </span>
          {meta &&
            (canSetStatus ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.05em] transition-opacity hover:opacity-80',
                    meta.chip,
                  )}
                >
                  {meta.label}
                  <ChevronDown className="size-2.5" strokeWidth={2.6} />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-8 z-10 w-[186px] rounded-[11px] border bg-popover p-1.5 shadow-lg"
                  >
                    {LEARNER_MODULE_TRANSITIONS.map((option) => (
                      <button
                        key={option.status}
                        type="button"
                        role="menuitem"
                        disabled={option.status === module.status}
                        onClick={() => choose(option.status)}
                        className="flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left text-[12.5px] font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                      >
                        <span
                          className={cn(
                            'size-[7px] shrink-0 rounded-full',
                            option.dot,
                          )}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span
                className={cn(
                  'rounded-md border px-2 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.05em]',
                  meta.chip,
                )}
              >
                {meta.label}
              </span>
            ))}
        </div>

        <div className="flex flex-wrap items-center gap-[5px]">
          <span className={cn(CHIP, 'rounded-md bg-muted px-2 py-1.5')}>
            Weight {module.weightPct}%
          </span>
          {module.estTime && (
            <span
              className={cn(
                CHIP,
                'inline-flex items-center gap-[5px] rounded-full bg-muted px-2 py-1.5',
              )}
            >
              <Clock className="size-[11px]" strokeWidth={2} />
              {module.estTime}
            </span>
          )}
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Edit ${module.title}`}
              title="Edit module"
              className="size-8 rounded-[9px] text-muted-foreground duration-150 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit(module)}
            >
              <Pencil className="size-3.5" strokeWidth={2} />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Delete ${module.title}`}
              title="Delete module"
              className="size-8 rounded-[9px] text-muted-foreground/70 duration-150 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(module)}
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3">
        <h4 className="font-serif text-[15.5px] font-bold leading-[1.25] text-foreground">
          {module.title}
        </h4>

        {module.description && (
          <p className="mt-[5px] line-clamp-2 text-[12.5px] leading-[1.45] text-muted-foreground">
            {module.description}
          </p>
        )}
      </div>

      {weightBar && (
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div
            className="h-full rounded-full bg-primary/40"
            // Clamped so a malformed weight can't overflow the track.
            style={{
              width: `${Math.min(100, Math.max(0, module.weightPct))}%`,
            }}
          />
        </div>
      )}

      {resourceCount === 0 ? (
        emptyResourcesLabel && (
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            {emptyResourcesLabel}
          </p>
        )
      ) : (
        <>
          {/* Negative margin + matching width so the hover fill reaches the
                  card's padding edge without the row itself sitting inset. */}
          <button
            type="button"
            onClick={() => setResourcesOpen((open) => !open)}
            aria-expanded={resourcesOpen}
            className="-mx-2 mt-2.5 flex w-[calc(100%+1rem)] items-center gap-2 rounded-lg p-2 text-left text-[12px] font-semibold text-foreground/80 transition-colors hover:bg-muted/60"
          >
            <FileText
              className="size-3.5 shrink-0 text-primary"
              strokeWidth={1.8}
            />
            <span className="min-w-0 flex-1">
              {resourceCount} {resourceCount === 1 ? 'resource' : 'resources'}
            </span>
            <ChevronDown
              className={cn(
                'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
                resourcesOpen && 'rotate-180',
              )}
              strokeWidth={2.2}
            />
          </button>

          {resourcesOpen && (
            <div className="mt-1.5 flex flex-col gap-1.5">
              {module.resources.map((resource) => (
                <ResourceRow key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </>
      )}

      {/* mt-auto pins the status line to the bottom, so cards in a row end on
          the same line however much curriculum each one carries. */}
      {meta && (
        <div className="mt-auto flex items-center justify-between gap-2.5 pt-[11px]">
          <span
            className={cn(
              'flex min-w-0 items-center gap-[7px] text-[11.5px] font-semibold leading-[1.35]',
              meta.noteClass,
            )}
          >
            {NoteIcon && (
              <NoteIcon className="size-3.5 shrink-0" strokeWidth={2.2} />
            )}
            <span className="truncate">{meta.note}</span>
          </span>

          {module.status === 'in_progress' && onMarkDone && (
            <button
              type="button"
              onClick={() => onMarkDone(module)}
              className="shrink-0 text-[11.5px] font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              Mark as done
            </button>
          )}

          {/* Taking the request back is the only move left while the mentor
              holds it, so it sits in the open rather than inside the menu. */}
          {module.status === 'pending_confirmation' && onSetStatus && (
            <button
              type="button"
              onClick={() => onSetStatus(module, 'in_progress')}
              className="shrink-0 text-[11.5px] font-semibold text-amber-800 underline underline-offset-2 transition-colors hover:text-amber-700 dark:text-amber-400"
            >
              Withdraw
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
