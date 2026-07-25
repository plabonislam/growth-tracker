import { ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { ModuleForm } from '@/features/topics/components/module-form';
import { useTopic, useTopicModules } from '@/features/topics/hooks/use-topics';
import { useAuthStore } from '@/store/auth.store';

/** Centred rather than full-bleed — a form reads badly at 1800px wide. */
const containerClass =
  'mx-auto w-full max-w-[1800px] px-4 pb-28 pt-5 sm:px-6 md:pb-32 md:pt-8 xl:pb-16';

function PageHeader({
  topicName,
  position,
  isEditing,
  onBack,
}: {
  topicName: string;
  /** 1-based slot this module holds in the curriculum. */
  position: number;
  isEditing: boolean;
  onBack: () => void;
}) {
  return (
    <header className="mb-6 md:mb-8">
      {/* The shell's breadcrumb is desktop-only, so the page carries its own
          way back — and names the destination while it's at it. */}
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
        <span className="truncate">{topicName}</span>
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isEditing ? 'Edit module' : 'New module'}
        </h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider tabular-nums text-primary">
          Module {String(position).padStart(2, '0')}
        </span>
      </div>

      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        {isEditing
          ? 'Changes reach learners as soon as you save.'
          : 'Learners work through modules in order — this one goes last.'}
      </p>
    </header>
  );
}

/**
 * Authoring route for a module — the same page whether one is being created or
 * edited, so a mentor returns to the form they filled in, with their answers in
 * it. Only the topic's own mentor authors curriculum, so the page resolves the
 * topic first and sends everyone else back to the topic.
 */
export function ModuleFormPage({
  topicId,
  moduleId,
}: {
  topicId: string;
  /** Present on the edit route; absent authors a new module. */
  moduleId?: string;
}) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const { data: topic, isLoading, isError, refetch } = useTopic(topicId);
  const { data: modules = [], isLoading: modulesLoading } =
    useTopicModules(topicId);

  const backToTopic = () => navigate(`/topics/${topicId}`);
  const isMentor = topic?.mentor != null && topic.mentor.id === userId;
  const editing = moduleId
    ? modules.find((module) => module.id === moduleId)
    : undefined;
  // One past the highest position in use, rather than the module count: a gap
  // left by a delete would make the count collide with an existing module.
  const nextOrder = modules.reduce(
    (next, module) => Math.max(next, module.order + 1),
    0,
  );
  const totalWeight = modules.reduce((sum, m) => sum + m.weight, 0);
  // What the *other* modules hold: editing measures its weight against the
  // topic minus its own share, so re-saving an unchanged module always fits.
  const allocatedWeight = totalWeight - (editing?.weight ?? 0);
  const isPending = isLoading || modulesLoading;

  if (isError) {
    return (
      <main className={containerClass}>
        <div className="mx-auto max-w-md rounded-xl border bg-card px-5 py-14 text-center">
          <p className="text-sm font-semibold text-foreground">
            Couldn’t load this topic
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            The curriculum has to load before a module can be added to it.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => refetch()}>
              Try again
            </Button>
            <Button type="button" variant="ghost" onClick={backToTopic}>
              Back to topic
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (isPending) {
    // Shaped like the page it becomes, so nothing jumps on arrival.
    return (
      <main className={containerClass} aria-busy="true">
        <div className="mb-6 space-y-3 md:mb-8">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-8">
          <div className="space-y-5 sm:space-y-6">
            <div className="h-80 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="hidden h-40 animate-pulse rounded-xl bg-muted xl:block" />
        </div>
      </main>
    );
  }

  if (!topic) return null;

  if (!isMentor) {
    return (
      <main className={containerClass}>
        <div className="mx-auto max-w-md rounded-xl border bg-card px-5 py-14 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-5" strokeWidth={1.75} />
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">
            Only this topic’s mentor can edit modules
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            You can still work through everything already published.
          </p>
          <Button type="button" className="mt-5" onClick={backToTopic}>
            Back to {topic.name}
          </Button>
        </div>
      </main>
    );
  }

  // An id that matches nothing — a deleted module, or a hand-typed URL.
  if (moduleId && !editing) {
    return (
      <main className={containerClass}>
        <div className="mx-auto max-w-md rounded-xl border bg-card px-5 py-14 text-center">
          <p className="text-sm font-semibold text-foreground">
            That module is no longer here
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            It may have been removed since this page was opened.
          </p>
          <Button type="button" className="mt-5" onClick={backToTopic}>
            Back to {topic.name}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className={containerClass}>
      <PageHeader
        topicName={topic.name}
        // Editing shows the slot the module already holds; creating shows the
        // one it is about to take.
        position={editing ? editing.order + 1 : modules.length + 1}
        isEditing={editing != null}
        onBack={backToTopic}
      />

      <ModuleForm
        // Remounts when the mentor switches modules, so the fields reload from
        // the module rather than keeping the previous one's answers.
        key={editing?.id ?? 'new'}
        topicId={topicId}
        nextOrder={nextOrder}
        allocatedWeight={allocatedWeight}
        module={editing}
        onDone={backToTopic}
        onCancel={backToTopic}
      />
    </main>
  );
}
