/** Completion state of a module inside an enrolled topic. */
export type ModuleStatus = 'completed' | 'in_progress' | 'todo';

/** Resource kind, resolved to an icon + action label in `topics.constants.ts`. */
export type ResourceKind = 'video' | 'doc';

export interface ModuleResource {
  id: string;
  kind: ResourceKind;
  label: string;
  /** Finished resources render with the success icon and dim inside active modules. */
  done: boolean;
}

export interface TopicModule {
  id: string;
  /** 1-based position, rendered as "Module 01". */
  order: number;
  title: string;
  weightPct: number;
  status: ModuleStatus;
  /** Empty for locked (`todo`) modules — they show an unlock hint instead. */
  resources: ModuleResource[];
}

export interface TopicMentor {
  name: string;
  role: string;
  online: boolean;
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
