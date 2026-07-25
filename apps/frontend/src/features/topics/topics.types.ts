/** A topic's assigned mentor, as returned by `GET /topics/:id`. */
export interface TopicMentorRef {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** Topic identity + mentor — drives the role split on the topic page. */
export interface TopicDetail {
  id: string;
  clubId: string;
  name: string;
  certificationRequired: boolean;
  mentor: TopicMentorRef | null;
}

/**
 * A curriculum module as the mentor authors it (`GET /topics/:id/modules`) —
 * no learner progress, unlike `TopicModule`.
 */
export interface CurriculumModule {
  id: string;
  title: string;
  body: string | null;
  /** Share of the topic's total weight, 1–100. */
  weight: number;
  /** Estimated minutes to complete; `null` when the mentor left it blank. */
  estTime: number | null;
  order: number;
}

/** Completion state of a module inside an enrolled topic. */
export type ModuleStatus = 'completed' | 'in_progress' | 'todo';

/** Resource kind, resolved to an icon + action label in `topics.constants.ts`. */
export type ResourceKind = 'video' | 'doc';

export interface ModuleResource {
  id: string;
  kind: ResourceKind;
  label: string;
  /** External destination (Udemy, blog post, …). Omitted → action badge is hidden. */
  url?: string;
  /** Finished resources render with the success icon and dim inside active modules. */
  done: boolean;
}

export interface TopicModule {
  id: string;
  /** 1-based position, rendered as "Module 01". */
  order: number;
  title: string;
  weightPct: number;
  /** Estimated time to complete, e.g. "2h 30m". */
  estTime: string;
  status: ModuleStatus;
  /** Empty for locked (`todo`) modules — they show an unlock hint instead. */
  resources: ModuleResource[];
}

export interface TopicMentor {
  name: string;
  role: string;
  online: boolean;
  /** Average learner rating out of 5, e.g. 4.9. */
  rating: number;
  /** Typical reply delay, e.g. "~2h". */
  avgResponseTime: string;
}

export interface EnrolledTopicDetail {
  id: string;
  title: string;
  startedOn: string;
  estCompletion: string;
  progressPct: number;
  mentor: TopicMentor;
  moduleCount: number;
  taskCount: number;
  modules: TopicModule[];
}
