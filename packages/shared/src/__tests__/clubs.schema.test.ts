import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  CLUB_DESCRIPTION_LENGTH,
  CreateClubSchema,
  JOIN_EXPECTATION_LENGTH,
  JoinClubSchema,
  UpdateClubSchema,
  UpdateMembershipStatusSchema,
} from '../schemas/clubs.schema';

/** A club as the create form submits one; cases break one field at a time. */
const validClub = {
  name: 'Frontend Club',
  description: 'A club for people who build interfaces and argue about them.',
};

/** First message reported for `field`, or `undefined` if the parse succeeded. */
function messageFor(schema: z.ZodTypeAny, value: unknown, field: string) {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path.join('.') === field)
    ?.message;
}

describe('CreateClubSchema', () => {
  it('accepts valid data', () => {
    const result = CreateClubSchema.safeParse(validClub);
    expect(result.success).toBe(true);
  });

  it('accepts an optional coordinator email', () => {
    const result = CreateClubSchema.safeParse({
      ...validClub,
      coordinatorEmail: 'lead@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateClubSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('name');
  });

  // Messages are asserted verbatim: these reach coordinators through the form
  // and API clients through `ZodValidationPipe`, so the wording is the contract.
  it.each([
    ['name', '', 'Club name must contain at least 1 character(s)'],
    ['name', '   ', 'Club name must contain at least 1 character(s)'],
    ['name', undefined, 'Club name is required'],
    ['name', 42, 'Club name must be text'],
    ['name', 'a'.repeat(101), 'Club name must be 100 characters or fewer'],
    ['description', '', 'Description must be at least 40 characters'],
    [
      'description',
      'a'.repeat(39),
      'Description must be at least 40 characters',
    ],
    // 40 spaces cleared the floor before the field was trimmed.
    [
      'description',
      ' '.repeat(40),
      'Description must be at least 40 characters',
    ],
    ['description', undefined, 'Description is required'],
    [
      'description',
      'a'.repeat(1001),
      'Description must be 1000 characters or fewer',
    ],
    [
      'coordinatorEmail',
      'not-an-email',
      'Coordinator must be a valid email address',
    ],
  ] as const)('reports %s of %p as "%s"', (field, value, message) => {
    expect(
      messageFor(CreateClubSchema, { ...validClub, [field]: value }, field),
    ).toBe(message);
  });

  it('trims the text it accepts', () => {
    const result = CreateClubSchema.safeParse({
      name: '  Frontend Club  ',
      description: `  ${validClub.description}  `,
    });
    expect(result.data).toMatchObject({
      name: 'Frontend Club',
      description: validClub.description,
    });
  });

  it('publishes the bounds its description messages quote', () => {
    expect(CLUB_DESCRIPTION_LENGTH).toEqual({ min: 40, max: 1000 });
  });
});

describe('UpdateClubSchema', () => {
  it('accepts a patch carrying one field', () => {
    expect(UpdateClubSchema.safeParse({ name: 'Frontend Club' }).success).toBe(
      true,
    );
  });

  it('accepts a coordinator id', () => {
    const result = UpdateClubSchema.safeParse({
      coordinatorId: '3f1a7c9e-8b2d-4e5f-9a6b-1c2d3e4f5a6b',
    });
    expect(result.success).toBe(true);
  });

  // Inherited from `CreateClubSchema`, so an edit cannot set what a create
  // would have rejected — and reports it in the same words.
  it.each([
    ['name', '', 'Club name must contain at least 1 character(s)'],
    ['name', '   ', 'Club name must contain at least 1 character(s)'],
    ['name', 'a'.repeat(101), 'Club name must be 100 characters or fewer'],
    [
      'description',
      'a'.repeat(39),
      'Description must be at least 40 characters',
    ],
    [
      'description',
      'a'.repeat(1001),
      'Description must be 1000 characters or fewer',
    ],
    ['coordinatorId', 'not-a-uuid', 'Coordinator id must be a valid UUID'],
  ] as const)('reports %s of %p as "%s"', (field, value, message) => {
    expect(messageFor(UpdateClubSchema, { [field]: value }, field)).toBe(
      message,
    );
  });

  it('trims the text it accepts', () => {
    const result = UpdateClubSchema.safeParse({ name: '  Frontend Club  ' });
    expect(result.data).toEqual({ name: 'Frontend Club' });
  });
});

describe('JoinClubSchema', () => {
  const validApplication = {
    memberId: 'DSI-99238',
    expectation: 'I want to learn from the mentors and ship something real.',
  };

  it('accepts a complete application', () => {
    expect(JoinClubSchema.safeParse(validApplication).success).toBe(true);
  });

  it.each([
    'DSI-1',
    'dsi-1',
    'Dsi-1',
    'DSI-001',
    'DSI-99999',
    '  DSI-1  ', // trimmed before the pattern is applied
  ])('accepts the member ID %p', (memberId) => {
    const result = JoinClubSchema.safeParse({ ...validApplication, memberId });
    expect(result.success).toBe(true);
  });

  it.each([
    ['memberId', '', 'Invalid member ID, like DSI-001'],
    ['memberId', '   ', 'Invalid member ID, like DSI-001'],
    ['memberId', undefined, 'Invalid member ID, like DSI-001'],
    ['memberId', 42, 'Invalid member ID, like DSI-001'],
    ['memberId', '99238', 'Invalid member ID, like DSI-001'], // no prefix
    ['memberId', 'DSI99238', 'Invalid member ID, like DSI-001'], // no dash
    ['memberId', 'DSI-', 'Invalid member ID, like DSI-001'], // no digits
    ['memberId', 'DSI-123456', 'Invalid member ID, like DSI-001'], // six digits
    ['memberId', 'DSI-12a', 'Invalid member ID, like DSI-001'], // not all digits
    ['memberId', 'XDSI-1', 'Invalid member ID, like DSI-001'], // prefixed junk
    ['memberId', 'DSI-1 DSI-2', 'Invalid member ID, like DSI-001'], // two of them
    [
      'expectation',
      '',
      'Please share at least a sentence about why you want to join',
    ],
    [
      'expectation',
      'too short',
      'Please share at least a sentence about why you want to join',
    ],
    // Ten spaces cleared the floor before the field was trimmed.
    [
      'expectation',
      ' '.repeat(10),
      'Please share at least a sentence about why you want to join',
    ],
    [
      'expectation',
      undefined,
      'Please share at least a sentence about why you want to join',
    ],
    [
      'expectation',
      'a'.repeat(1001),
      'Please keep this to 1000 characters or fewer',
    ],
  ] as const)('reports %s of %p as "%s"', (field, value, message) => {
    expect(
      messageFor(
        JoinClubSchema,
        { ...validApplication, [field]: value },
        field,
      ),
    ).toBe(message);
  });

  it('trims the text it accepts', () => {
    const result = JoinClubSchema.safeParse({
      ...validApplication,
      memberId: '  DSI-99238  ',
    });
    expect(result.data?.memberId).toBe('DSI-99238');
  });

  it('publishes the bounds its expectation messages quote', () => {
    expect(JOIN_EXPECTATION_LENGTH).toEqual({ min: 10, max: 1000 });
  });
});

describe('UpdateMembershipStatusSchema', () => {
  it('accepts operational statuses', () => {
    expect(
      UpdateMembershipStatusSchema.safeParse({ status: 'active' }).success,
    ).toBe(true);
    expect(
      UpdateMembershipStatusSchema.safeParse({ status: 'on_break' }).success,
    ).toBe(true);
    expect(
      UpdateMembershipStatusSchema.safeParse({ status: 'dropped_out' }).success,
    ).toBe(true);
  });

  it('rejects pending', () => {
    const result = UpdateMembershipStatusSchema.safeParse({
      status: 'pending',
    });
    expect(result.success).toBe(false);
  });

  it('accepts rejected', () => {
    const result = UpdateMembershipStatusSchema.safeParse({
      status: 'rejected',
    });
    expect(result.success).toBe(true);
  });
});
