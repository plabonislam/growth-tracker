import type { LearnerDashboardResponse } from 'shared';

import { httpClient } from '@/services/http/client';
import type { AgendaItem, LearnerDashboard } from '../dashboard.types';

/**
 * Learner dashboard service — `GET /dashboard/me`.
 *
 * The API answers in figures and dates; the wording around them is built here,
 * where the page's language lives. Two things the design asks for have nothing
 * behind them and are therefore absent rather than invented: a cohort ranking,
 * and deadlines (no task carries a due date).
 */

/** ISO → "12 Jan 2026". */
function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** A session's date → "Wednesday, 12 Aug" — near enough to read at a glance. */
function formatSessionDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

/** Minutes → whole hours; the metric has no room for a second unit. */
function toHours(minutes: number): number {
  return Math.round(minutes / 60);
}

/** The one thing worth doing next, from what the learner actually has. */
function buildNudge(api: LearnerDashboardResponse): string {
  if (!api.club) return 'Join a club to start learning.';
  if (!api.activeTopic) {
    return `Pick a topic in ${api.club.name} to get started.`;
  }
  const { moduleIndex, moduleCount, title } = api.activeTopic;
  return moduleCount === 0
    ? `${title} is still being written — check back soon.`
    : `Pick up module ${moduleIndex} of ${title}.`;
}

function toEvents(api: LearnerDashboardResponse): AgendaItem[] {
  return api.events.map((event, index) => ({
    id: event.id,
    title: event.title,
    when: `${formatSessionDay(event.date)} · ${event.type} session`,
    // No icon or tone is recorded for a session; alternate so a short list
    // still reads as a list rather than a block of one colour.
    iconKey: index % 2 === 0 ? 'workshop' : 'podcast',
    tone: index % 2 === 0 ? 'info' : 'amber',
  }));
}

function toDashboard(api: LearnerDashboardResponse): LearnerDashboard {
  const { stats } = api;

  return {
    nudge: buildNudge(api),
    club: api.club && {
      id: api.club.id,
      clubName: api.club.name,
      description: api.club.description ?? '',
      memberSince: formatDay(api.club.memberSince),
      progressPct: api.club.progressPct,
      memberNames: api.club.memberNames,
      // The stack shows the sample; the count covers everyone it left out.
      extraMembers: Math.max(
        0,
        api.club.memberCount - api.club.memberNames.length,
      ),
      membersNote: `${api.club.memberCount} active ${
        api.club.memberCount === 1 ? 'learner' : 'learners'
      } in this club`,
    },
    activeTopic: api.activeTopic && {
      id: api.activeTopic.id,
      title: api.activeTopic.title,
      description: api.activeTopic.description ?? '',
      startedOn: formatDay(api.activeTopic.startedAt),
      moduleLabel:
        api.activeTopic.moduleCount === 0
          ? 'No modules yet'
          : `Module ${api.activeTopic.moduleIndex} of ${api.activeTopic.moduleCount}`,
      progressPct: api.activeTopic.progressPct,
    },
    stats: {
      completedTopics: {
        value: stats.completedTopics,
        note:
          stats.completedTopicClubs === 0
            ? 'None finished yet'
            : `Across ${stats.completedTopicClubs} ${
                stats.completedTopicClubs === 1 ? 'club' : 'clubs'
              }`,
      },
      earnedCertificates: {
        value: stats.earnedCertificates,
        note: stats.latestCertificateTopic
          ? `Latest: ${stats.latestCertificateTopic}`
          : 'None earned yet',
      },
      clubProgress: {
        value: api.club?.progressPct ?? 0,
        unit: '%',
        note: api.club ? api.club.name : 'No club joined',
      },
      learningTime: {
        value: toHours(stats.learningMinutes),
        unit: 'h',
        // Named for what it is: the estimates on finished modules, not a clock.
        note: 'Estimated across completed modules',
      },
    },
    // Nothing records a due date, so this list stays empty until tasks carry one.
    deadlines: [],
    events: toEvents(api),
  };
}

export const dashboardService = {
  getLearnerDashboard: (): Promise<LearnerDashboard> =>
    httpClient
      .get<LearnerDashboardResponse>('/dashboard/me')
      .then((r) => toDashboard(r.data)),
};
