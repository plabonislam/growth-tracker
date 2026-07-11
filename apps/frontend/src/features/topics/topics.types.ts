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
