import { z } from 'zod';

/** Matches the `varchar(100)` the name column is declared as. */
const MAX_CLUB_NAME_LENGTH = 100;

/**
 * The description's bounds, published so the form's counter can read them
 * instead of restating the numbers and drifting from them.
 */
export const CLUB_DESCRIPTION_LENGTH = { min: 40, max: 1000 } as const;

export const CreateClubSchema = z.object({
  name: z
    .string({
      required_error: 'Club name is required',
      invalid_type_error: 'Club name must be text',
    })
    // Trimmed before it is measured, so a name of spaces can't pass the floor
    // and land in a `NOT NULL` column looking blank.
    .trim()
    .min(1, 'Club name must contain at least 1 character(s)')
    .max(
      MAX_CLUB_NAME_LENGTH,
      `Club name must be ${MAX_CLUB_NAME_LENGTH} characters or fewer`,
    ),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be text',
    })
    .trim()
    .min(
      CLUB_DESCRIPTION_LENGTH.min,
      `Description must be at least ${CLUB_DESCRIPTION_LENGTH.min} characters`,
    )
    .max(
      CLUB_DESCRIPTION_LENGTH.max,
      `Description must be ${CLUB_DESCRIPTION_LENGTH.max} characters or fewer`,
    ),
  /** Backend resolves this to a user id — see ClubsService.create(). */
  coordinatorEmail: z
    .string({ invalid_type_error: 'Coordinator must be a valid email address' })
    .trim()
    .email('Coordinator must be a valid email address')
    .optional(),
});

/**
 * Wire contract for `PATCH /clubs/:id`. Name and description carry the rules and
 * wording they were created under — picked from `CreateClubSchema` so an edit
 * can never accept what a create would reject — each optional, since a patch
 * carries only what changed. The coordinator arrives as an id rather than an
 * email: by this point the caller has already resolved the user.
 */
export const UpdateClubSchema = CreateClubSchema.pick({
  name: true,
  description: true,
})
  .partial()
  .extend({
    coordinatorId: z
      .string({ invalid_type_error: 'Coordinator id must be a valid UUID' })
      .uuid('Coordinator id must be a valid UUID')
      .optional(),
  });

export const UpdateMembershipStatusSchema = z.object({
  // 'active' approves a pending application; 'rejected' declines it.
  // 'on_break' / 'dropped_out' are operational transitions for existing members.
  status: z.enum(['active', 'on_break', 'dropped_out', 'rejected']),
  droppedReason: z.string().optional(),
});

export const ClubResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  coordinatorId: z.string().uuid().nullable(),
  archived: z.boolean(),
  createdAt: z.string(),
});

/**
 * `DSI-` in either case, then one to five digits — `DSI-1`, `dsi-1`, `DSI-001`,
 * `DSI-99238`. Leading zeros are kept as typed, since the number is a printed
 * reference rather than something arithmetic happens to.
 */
const MEMBER_ID_PATTERN = /^dsi-\d{1,5}$/i;

/**
 * One message for every way the ID can be wrong. Which rule it broke — no
 * prefix, too many digits, letters after the dash — matters less to the
 * applicant than seeing the shape it should have taken.
 */
const MEMBER_ID_MESSAGE = 'Invalid member ID, like DSI-001';

/**
 * The expectation's bounds, published so the form's counter can read them
 * instead of restating the numbers and drifting from them.
 */
export const JOIN_EXPECTATION_LENGTH = { min: 10, max: 1000 } as const;

/**
 * What to write, rather than how long to make it — a character count is no help
 * to someone who has not worked out what to say yet.
 */
const EXPECTATION_MESSAGE =
  'Please share at least a sentence about why you want to join';

/**
 * Payload a member submits to apply for a club. The applicant's authenticated
 * identity is taken from the JWT server-side; `memberId` is a self-entered
 * reference number in the `DSI-00000` house format, not the account id.
 */
export const JoinClubSchema = z.object({
  // The pattern subsumes the old length bounds: nothing shorter than `DSI-0` or
  // longer than `DSI-99999` can match it, so one check covers empty, malformed,
  // and over-long alike.
  memberId: z
    .string({
      required_error: MEMBER_ID_MESSAGE,
      invalid_type_error: MEMBER_ID_MESSAGE,
    })
    .trim()
    .regex(MEMBER_ID_PATTERN, MEMBER_ID_MESSAGE),
  expectation: z
    .string({
      required_error: EXPECTATION_MESSAGE,
      invalid_type_error: EXPECTATION_MESSAGE,
    })
    .trim()
    .min(JOIN_EXPECTATION_LENGTH.min, EXPECTATION_MESSAGE)
    .max(
      JOIN_EXPECTATION_LENGTH.max,
      `Please keep this to ${JOIN_EXPECTATION_LENGTH.max} characters or fewer`,
    ),
});

export type CreateClub = z.infer<typeof CreateClubSchema>;
export type UpdateClub = z.infer<typeof UpdateClubSchema>;
export type UpdateMembershipStatus = z.infer<
  typeof UpdateMembershipStatusSchema
>;
export type ClubResponse = z.infer<typeof ClubResponseSchema>;
export type JoinClub = z.infer<typeof JoinClubSchema>;
