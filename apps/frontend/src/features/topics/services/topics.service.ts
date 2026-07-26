import type {
  CreateModule,
  CreateResource,
  ModuleResponse,
  ModuleWithResourcesResponse,
  TopicStatus,
  UpdateModule,
} from 'shared';

import { httpClient } from '@/services/http/client';
import type {
  CurriculumModule,
  EnrolledTopicDetail,
  TopicDetail,
  TopicMentorRef,
} from '../topics.types';

/**
 * Topics service.
 *
 * Would normally be `httpClient.get('/topics/:id')` (see docs/frontend.md —
 * Service Pattern); until that endpoint exists we resolve a local fixture so
 * the TanStack Query wiring is real and swappable.
 */

const ENROLLED_TOPIC: EnrolledTopicDetail = {
  id: 'data-engineering-spark',
  title: 'Data Engineering with Apache Spark',
  startedOn: 'Jun 12, 2026',
  estCompletion: 'Aug 28, 2026',
  progressPct: 65,
  mentor: {
    name: 'Dr. Aris Thorne',
    role: 'Senior Data Architect',
    online: true,
    rating: 4.9,
    avgResponseTime: '~2h',
  },
  moduleCount: 12,
  taskCount: 42,
  modules: [
    {
      id: 'distributed-systems',
      order: 1,
      title: 'Introduction to Distributed Systems',
      weightPct: 20,
      estTime: '1h 45m',
      status: 'completed',
      resources: [
        {
          id: 'mapreduce-history',
          url: 'https://www.udemy.com/course/apache-spark/learn/lecture/mapreduce-history',
          kind: 'video',
          label: 'History of MapReduce and Spark (12:45)',
          done: true,
        },
        {
          id: 'distributed-fundamentals',
          url: 'https://blog.example.com/distributed-computing-fundamentals',
          kind: 'doc',
          label: 'Distributed Computing Fundamentals',
          done: true,
        },
      ],
    },
    {
      id: 'spark-architecture',
      order: 2,
      title: 'Spark Architecture & RDDs',
      weightPct: 25,
      estTime: '2h 30m',
      status: 'in_progress',
      resources: [
        {
          id: 'spark-basics',
          url: 'https://www.udemy.com/course/apache-spark/learn/lecture/spark-basics',
          kind: 'video',
          label: 'Spark Basics & Cluster UI (15:20)',
          done: true,
        },
        {
          id: 'rdd-guide',
          url: 'https://blog.example.com/rdd-transformation-guide',
          kind: 'doc',
          label: 'RDD Transformation Guide',
          done: false,
        },
      ],
    },
    {
      id: 'sparksql-dataframes',
      order: 3,
      title: 'SparkSQL & DataFrames API',
      weightPct: 25,
      estTime: '2h 15m',
      status: 'todo',
      resources: [
        {
          id: 'sparksql-intro',
          url: 'https://www.udemy.com/course/apache-spark/learn/lecture/sparksql-intro',
          kind: 'video',
          label: 'Querying with SparkSQL (18:10)',
          done: false,
        },
        {
          id: 'dataframes-reference',
          url: 'https://blog.example.com/dataframes-api-reference',
          kind: 'doc',
          label: 'DataFrames API Reference',
          done: false,
        },
      ],
    },
    {
      id: 'structured-streaming',
      order: 4,
      title: 'Structured Streaming & Real-time Ops',
      weightPct: 30,
      estTime: '3h 10m',
      status: 'todo',
      resources: [
        {
          id: 'streaming-basics',
          url: 'https://www.udemy.com/course/apache-spark/learn/lecture/streaming-basics',
          kind: 'video',
          label: 'Streaming Pipelines in Practice (21:35)',
          done: false,
        },
        {
          id: 'realtime-ops-guide',
          url: 'https://blog.example.com/real-time-operations-guide',
          kind: 'doc',
          label: 'Real-time Operations Guide',
          done: false,
        },
      ],
    },
  ],
};

/** Shape returned by `GET /topics/:id` — see TopicsRepository.findById(). */
interface ApiTopicDetail {
  id: string;
  clubId: string;
  name: string;
  certificationRequired: boolean | null;
  status: TopicStatus | null;
  mentor: TopicMentorRef | null;
}

function toTopicDetail(api: ApiTopicDetail): TopicDetail {
  return {
    id: api.id,
    clubId: api.clubId,
    name: api.name,
    certificationRequired: api.certificationRequired ?? false,
    // Topics written before publishing existed read as drafts, which is what
    // they are — no mentor has said they are ready.
    status: api.status ?? 'draft',
    mentor: api.mentor,
  };
}

function toCurriculumModule(
  api: ModuleResponse | ModuleWithResourcesResponse,
): CurriculumModule {
  return {
    id: api.id,
    title: api.title,
    body: api.body,
    weight: api.weight,
    estTime: api.estTime,
    order: api.order,
    // Absent on the create response — resources are attached in a second pass.
    resources: 'resources' in api ? api.resources : [],
  };
}

export const topicsService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getEnrolledTopic: (_id: string): Promise<EnrolledTopicDetail> =>
    Promise.resolve(ENROLLED_TOPIC),
  getTopic: (id: string): Promise<TopicDetail> =>
    httpClient
      .get<ApiTopicDetail>(`/topics/${id}`)
      .then((r) => toTopicDetail(r.data)),
  getTopicModules: (id: string): Promise<CurriculumModule[]> =>
    httpClient
      .get<ModuleWithResourcesResponse[]>(`/topics/${id}/modules`)
      .then((r) => r.data.map(toCurriculumModule)),
  createModule: (
    topicId: string,
    payload: CreateModule,
  ): Promise<CurriculumModule> =>
    httpClient
      .post<ModuleResponse>(`/topics/${topicId}/modules`, payload)
      .then((r) => toCurriculumModule(r.data)),
  updateModule: (
    topicId: string,
    moduleId: string,
    payload: UpdateModule,
  ): Promise<CurriculumModule> =>
    httpClient
      .patch<ModuleResponse>(`/topics/${topicId}/modules/${moduleId}`, payload)
      .then((r) => toCurriculumModule(r.data)),
  addModuleResource: (
    moduleId: string,
    payload: CreateResource,
  ): Promise<void> =>
    httpClient.post(`/modules/${moduleId}/resources`, payload).then(() => {}),
  deleteModule: (moduleId: string): Promise<void> =>
    httpClient.delete(`/modules/${moduleId}`).then(() => {}),
  /** Rewrites every module's position from the order of the ids given. */
  reorderModules: (topicId: string, moduleIds: string[]): Promise<void> =>
    httpClient
      .patch(`/topics/${topicId}/modules/reorder`, { moduleIds })
      .then(() => {}),
  /** Mentor-only; the API refuses unless the curriculum totals 100%. */
  publishTopic: (topicId: string): Promise<void> =>
    httpClient.post(`/topics/${topicId}/publish`).then(() => {}),
  unpublishTopic: (topicId: string): Promise<void> =>
    httpClient.post(`/topics/${topicId}/unpublish`).then(() => {}),
  deleteModuleResource: (moduleId: string, resourceId: string): Promise<void> =>
    httpClient
      .delete(`/modules/${moduleId}/resources/${resourceId}`)
      .then(() => {}),
};
