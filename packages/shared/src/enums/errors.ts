import { z } from 'zod';

/**
 * Stable identifiers for the refusals a club join can end in.
 *
 * The server owns the sentence a person reads; the code is what lets a screen
 * add the affordance that sentence points at — a link to the club they are
 * already in, a way back to Explore — without matching on prose that copy
 * edits are free to change.
 */
export const clubJoinErrorCodeSchema = z.enum([
  'CLUB_NOT_FOUND',
  'CLUB_ARCHIVED',
  /** An application of theirs is already waiting on a coordinator. */
  'APPLICATION_PENDING',
  'ALREADY_MEMBER',
  /** Membership paused, not ended — a coordinator reactivates it. */
  'MEMBERSHIP_ON_BREAK',
  /** They left, or were dropped. Re-entry is a coordinator's call. */
  'MEMBERSHIP_ENDED',
  'APPLICATION_REJECTED',
  /** The one-club rule: active somewhere else. */
  'ACTIVE_IN_OTHER_CLUB',
]);
export type ClubJoinErrorCode = z.infer<typeof clubJoinErrorCodeSchema>;
export const ClubJoinErrorCode = clubJoinErrorCodeSchema.Values;
