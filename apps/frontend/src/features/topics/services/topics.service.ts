import type { EnrolledTopicDetail } from '../topics.types';

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
  },
  moduleCount: 12,
  taskCount: 42,
  modules: [
    {
      id: 'distributed-systems',
      order: 1,
      title: 'Introduction to Distributed Systems',
      weightPct: 20,
      status: 'completed',
      resources: [
        {
          id: 'mapreduce-history',
          kind: 'video',
          label: 'History of MapReduce and Spark (12:45)',
          done: true,
        },
        {
          id: 'distributed-fundamentals',
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
      status: 'in_progress',
      resources: [
        {
          id: 'spark-basics',
          kind: 'video',
          label: 'Spark Basics & Cluster UI (15:20)',
          done: true,
        },
        {
          id: 'rdd-guide',
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
      status: 'todo',
      resources: [
        {
          id: 'sparksql-intro',
          kind: 'video',
          label: 'Querying with SparkSQL (18:10)',
          done: false,
        },
        {
          id: 'dataframes-reference',
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
      status: 'todo',
      resources: [
        {
          id: 'streaming-basics',
          kind: 'video',
          label: 'Streaming Pipelines in Practice (21:35)',
          done: false,
        },
        {
          id: 'realtime-ops-guide',
          kind: 'doc',
          label: 'Real-time Operations Guide',
          done: false,
        },
      ],
    },
  ],
};

export const topicsService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getEnrolledTopic: (_id: string): Promise<EnrolledTopicDetail> =>
    Promise.resolve(ENROLLED_TOPIC),
};
