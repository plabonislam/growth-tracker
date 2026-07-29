/**
 * The club activity sheet — what a coordinator or authority reads at
 * `/dashboard`. A sheet covers one club for one calendar month: the figures for
 * that month, the sessions logged in it, and the roster as it stands.
 */

/** A month the sheet can be asked for. */
export interface MonthOption {
  /** `2025-12` — what the API is asked for, and what the URL would carry. */
  id: string;
  /** "December 2025". */
  label: string;
  /** Nothing was recorded in this month, flagged before it is opened. */
  empty?: boolean;
}

/** One figure on the sheet's metric strip. */
export interface SheetMetric {
  key: string;
  label: string;
  /** Already formatted — "6", "+2", or "—" when nothing was recorded. */
  value: string;
  /** Set beside the figure, e.g. "of 13" or "in progress". */
  unit?: string;
  /** What the figure is drawn from, under the value. */
  note: string;
  /** Movement on the month before. Null when there is nothing to compare to. */
  delta: number | null;
  /** Names what the delta is measured against, e.g. "vs November 2025". */
  deltaNote?: string;
  /** The figure is absent rather than zero, so it reads back as grey. */
  muted?: boolean;
}

/** Weekly or monthly — the club's own cadence for the session. */
export type SessionCadence = 'weekly' | 'monthly';

export interface SessionLogRow {
  id: string;
  /** "10 Dec 2025". */
  day: string;
  /** "Wednesday" — the column stacks it under the date. */
  weekday: string;
  cadence: SessionCadence;
  objective: string;
  /** Always recorded: a session cannot be logged without one. */
  facilitator: string;
  /**
   * Heads counted. Null while attendance is still to be collected — it is
   * gathered after the session, so a logged session legitimately has none yet.
   */
  attendance: number | null;
  /** Active members at the time, which the attendance is read against. */
  activeMembers: number;
}

/** Which slice of the roster the panel is showing. */
export type RosterTab = 'all' | 'active' | 'break';

export interface RosterMember {
  id: string;
  name: string;
  /** "Coordinator", "Mentor", "Member" — what they do in this club. */
  role: string;
  onBreak: boolean;
}

/** Everything one club's month adds up to. */
export interface ActivitySheet {
  clubName: string;
  monthLabel: string;
  /** "Built from 3 logged sessions", or why there is nothing to build from. */
  generatedNote: string;
  metrics: SheetMetric[];
  sessions: SessionLogRow[];
  roster: RosterMember[];
  joined: number;
  dropped: number;
}
