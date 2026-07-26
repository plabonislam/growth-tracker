import { Layers, Pencil } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { formatDuration } from '@/lib/format-duration';
import { useAuthStore } from '@/store/auth.store';
import type { Topic, TopicAction } from '../clubs.types';

/** Deterministic two-stop gradient for a mentor avatar, keyed by name. */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#FBD89A,#F26B1F)',
  'linear-gradient(135deg,#B8D4F8,#1F6FEB)',
  'linear-gradient(135deg,#D5C9FB,#7C5CFC)',
  'linear-gradient(135deg,#A7E5CC,#10B981)',
  'linear-gradient(135deg,#F9A8D4,#BE185D)',
];

function gradientFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash + name.charCodeAt(i)) % 997;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

/** Caps meta line — "6 modules · 4h 30m", omitting whatever the API lacks. */
function metaLabel(topic: Topic): string {
  const parts: string[] = [];
  if (topic.modules != null) {
    parts.push(
      `${topic.modules} ${topic.modules === 1 ? 'module' : 'modules'}`,
    );
  }
  // Zero means nothing estimated yet, which is worth less than saying nothing.
  const estimate = formatDuration(topic.estTimeMinutes);
  if (estimate) parts.push(estimate);
  return parts.length ? parts.join(' · ') : 'Curriculum topic';
}

interface TopicItemProps {
  topic: Topic;
  /** True for an authority or the club's coordinator — they administer the topic. */
  canManageTopic?: boolean;
  /**
   * True once the caller is an active member of the club this topic belongs to.
   * Enrolling is a member's action, so a visitor browsing the club sees the
   * curriculum without a way into it.
   */
  isClubMember?: boolean;
  onAction?: (topic: Topic, action: TopicAction) => void;
  /**
   * Opens the edit form. Omitted hides the control — reassigning the mentor is
   * coordinator/authority only, so the topic's own mentor doesn't get it.
   */
  onEdit?: (topic: Topic) => void;
}

/** Label + icon per action; learner actions are icon-less by design. */
const ACTION_META: Record<
  TopicAction,
  { label: string; icon?: typeof Layers }
> = {
  'manage-modules': { label: 'Manage modules', icon: Layers },
  open: { label: 'Open' },
  enroll: { label: 'Enroll' },
};

export function TopicItem({
  topic,
  canManageTopic,
  isClubMember,
  onAction,
  onEdit,
}: TopicItemProps) {
  const userId = useAuthStore((s) => s.userId);
  // The topic's own mentor manages it; everyone else is there to learn.
  const isMentor = topic.mentor != null && topic.mentor.id === userId;
  // Authority, coordinator, and mentor all land on the same curriculum screen —
  // the topic is administered through its modules, not edited as a record here.
  const canManage = canManageTopic || isMentor;

  const isDraft = topic.status === 'draft';

  const action: TopicAction = canManage
    ? 'manage-modules'
    : topic.enrolled
      ? 'open'
      : 'enroll';
  const { label, icon: Icon } = ACTION_META[action];

  // Two gates, both about who the action belongs to. A draft reaches only the
  // people building it — there is nothing for anyone else to enroll in yet.
  // And enrolling is a club member's action: a learner exploring a club they
  // have not joined reads the curriculum, then joins the club to get into it.
  const showAction = canManage || (!isDraft && isClubMember === true);

  return (
    <Card className="flex flex-col gap-2.5 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
          {metaLabel(topic)}
        </span>
        {isDraft && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">
            Draft
          </span>
        )}
        {/* Acting on the topic record sits up here, the way a module card's
            edit/delete do; the footer keeps the one action that navigates.
            Shown for drafts too, where editing matters most. */}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(topic)}
            aria-label={`Edit ${topic.title}`}
            title="Edit topic"
            // -my-1 keeps the button from growing this row past its text height.
            className="-my-1 ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Pencil className="size-3.5" strokeWidth={2.25} />
          </button>
        )}
      </div>
      <div>
        <h4 className="font-serif text-base font-bold leading-snug text-foreground">
          {topic.title}
        </h4>

        {topic.description && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {topic.description}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
        {/* Role label above the name — a bare name doesn't say who the person is */}
        <div className="flex min-w-0 items-center gap-2">
          {topic.mentor ? (
            <>
              <span
                aria-hidden
                className="size-7 shrink-0 rounded-full"
                style={{ background: gradientFor(topic.mentor.name) }}
              />
              <div className="min-w-0 leading-tight">
                <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mentor
                </div>
                <div className="truncate text-[13px] font-semibold text-foreground">
                  {topic.mentor.name}
                </div>
              </div>
            </>
          ) : (
            <div className="leading-tight">
              <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                Mentor
              </div>
              <div className="text-[13px] text-muted-foreground">
                Not assigned yet
              </div>
            </div>
          )}
        </div>
        {/* Management reads as a bordered tool; the learner's action is the
            filled CTA. Both sit at the same height so a row of cards lines up
            whichever one each is showing. */}
        {!showAction ? null : Icon ? (
          <button
            type="button"
            onClick={() => onAction?.(topic, action)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-[13px] font-semibold text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Icon className="size-3.5" strokeWidth={2.25} />
            {label}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAction?.(topic, action)}
            className="inline-flex shrink-0 items-center rounded-md bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {label}
          </button>
        )}
      </div>
    </Card>
  );
}
