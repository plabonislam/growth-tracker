import type { ActivitySheetResponse } from 'shared';

import { httpClient } from '@/services/http/client';
import { monthLabel } from '../activity-sheet.constants';
import type {
  ActivitySheet,
  SessionLogRow,
  SheetMetric,
} from '../activity-sheet.types';

/**
 * The club activity sheet — `GET /dashboard/activity-sheet?clubId=&month=`.
 *
 * The API answers in counts and dates; the wording around them is built here,
 * where the page's language lives. An authority may omit the club to read every
 * one at once; a coordinator or mentor names theirs.
 */

/** `2025-12-10` → "10 Dec 2025". */
function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** `2025-12-10` → "Wednesday". */
function formatWeekday(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function buildMetrics(api: ActivitySheetResponse): SheetMetric[] {
  const { stats } = api;
  const net = stats.joined.value - stats.dropped.value;

  return [
    {
      key: 'sessions',
      label: 'Sessions held',
      value: String(stats.sessionsHeld.value),
      note:
        stats.sessionsHeld.value === 0
          ? 'Nothing logged this month'
          : 'Weekly and monthly sessions',
      delta: stats.sessionsHeld.delta,
      deltaNote: 'vs the month before',
      muted: stats.sessionsHeld.value === 0,
    },
    {
      key: 'attendance',
      label: 'Avg. attendance',
      value: stats.avgAttendance === null ? '—' : String(stats.avgAttendance),
      unit: stats.avgAttendance === null ? '' : `of ${stats.activeMembers}`,
      // Says what the average was taken from, so a figure drawn from two of
      // five sessions is never read as the whole month.
      note:
        stats.avgAttendance === null
          ? 'No headcounts recorded yet'
          : `${plural(stats.countedSessions, 'session', 'sessions')} counted of ${
              stats.sessionsHeld.value
            }`,
      delta: null,
      muted: stats.avgAttendance === null,
    },
    {
      key: 'active',
      label: 'Active members',
      value: String(stats.activeMembers),
      unit: stats.onBreak > 0 ? `${stats.onBreak} on break` : '',
      note: 'Active in the club right now',
      delta: null,
    },
    {
      key: 'net',
      label: 'Net membership',
      value: `${net > 0 ? '+' : ''}${net}`,
      note: `${stats.joined.value} joined · ${stats.dropped.value} dropped out`,
      delta: null,
      muted: net === 0,
    },
    {
      key: 'certifications',
      label: 'Certifications',
      value: String(stats.certifications.value),
      unit: 'obtained',
      note:
        stats.certifications.value === 0
          ? 'None obtained this month'
          : 'Awarded this month',
      delta: stats.certifications.delta,
      deltaNote: 'vs the month before',
      muted: stats.certifications.value === 0,
    },
  ];
}

function toSessions(api: ActivitySheetResponse): SessionLogRow[] {
  return api.sessions.map((session) => ({
    id: session.id,
    day: formatDay(session.date),
    weekday: formatWeekday(session.date),
    cadence: session.type,
    objective: session.objective,
    facilitator: session.facilitator,
    attendance: session.attendance,
    // What the headcount is read against — the club as it stands today, which
    // is the only membership figure anything records.
    activeMembers: api.stats.activeMembers,
  }));
}

/** Role as it is written on the roster. */
const ROLE_LABEL: Record<string, string> = {
  coordinator: 'Coordinator',
  mentor: 'Mentor',
  member: 'Member',
};

function toSheet(api: ActivitySheetResponse): ActivitySheet {
  const label = monthLabel(api.month);
  const sessions = api.stats.sessionsHeld.value;

  return {
    clubName: api.clubName,
    monthLabel: label,
    generatedNote:
      sessions === 0
        ? `Nothing was logged for ${api.clubName} in ${label}.`
        : `Built from ${plural(sessions, 'logged session', 'logged sessions')}.`,
    metrics: buildMetrics(api),
    sessions: toSessions(api),
    roster: api.roster.map((member) => ({
      id: member.userId,
      name: member.name,
      role: ROLE_LABEL[member.role] ?? 'Member',
      onBreak: member.status === 'on_break',
    })),
    joined: api.stats.joined.value,
    dropped: api.stats.dropped.value,
  };
}

export const activitySheetService = {
  getActivitySheet: ({
    clubId,
    month,
  }: {
    clubId?: string;
    month: string;
  }): Promise<ActivitySheet> =>
    httpClient
      .get<ActivitySheetResponse>('/dashboard/activity-sheet', {
        params: { clubId, month },
      })
      .then((r) => toSheet(r.data)),
};
