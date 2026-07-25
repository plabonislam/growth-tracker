import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  CreateTopicSchema,
  TOPIC_DESCRIPTION_LENGTH,
  UpdateTopicSchema,
} from '../schemas/topics.schema';

const MENTOR_ID = '11111111-1111-1111-1111-111111111111';

/** A topic as the create modal submits one; cases break one field at a time. */
const validTopic = {
  name: 'React Basics',
  description: 'Hooks, state, and the render cycle, from the ground up.',
  mentorId: MENTOR_ID,
};

/** First message reported for `field`, or `undefined` if the parse succeeded. */
function messageFor(schema: z.ZodTypeAny, value: unknown, field: string) {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path.join('.') === field)
    ?.message;
}

describe('CreateTopicSchema', () => {
  it('accepts valid data with certificationRequired omitted', () => {
    const result = CreateTopicSchema.safeParse(validTopic);
    expect(result.success).toBe(true);
    expect(result.data?.certificationRequired).toBe(false);
  });

  it('accepts explicit certificationRequired', () => {
    const result = CreateTopicSchema.safeParse({
      ...validTopic,
      certificationRequired: true,
    });
    expect(result.success).toBe(true);
    expect(result.data?.certificationRequired).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateTopicSchema.safeParse({
      description: validTopic.description,
      mentorId: MENTOR_ID,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('name');
  });

  it('rejects a missing mentor — a mentor is mandatory', () => {
    const result = CreateTopicSchema.safeParse({
      name: validTopic.name,
      description: validTopic.description,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes('mentorId'))).toBe(
      true,
    );
  });

  // Messages are asserted verbatim: these reach coordinators through the modal
  // and API clients through `ZodValidationPipe`, so the wording is the contract.
  it.each([
    ['name', '', 'Topic name must contain at least 1 character(s)'],
    ['name', '   ', 'Topic name must contain at least 1 character(s)'],
    ['name', undefined, 'Topic name is required'],
    ['name', 42, 'Topic name must be text'],
    ['name', 'a'.repeat(101), 'Topic name must be 100 characters or fewer'],
    ['description', '', 'Description must be at least 10 characters'],
    [
      'description',
      'a'.repeat(9),
      'Description must be at least 10 characters',
    ],
    // Ten spaces cleared the floor before the field was trimmed.
    [
      'description',
      ' '.repeat(10),
      'Description must be at least 10 characters',
    ],
    ['description', undefined, 'Description is required'],
    [
      'description',
      'a'.repeat(1001),
      'Description must be 1000 characters or fewer',
    ],
    ['certificationRequired', 'yes', 'Certification must be yes or no'],
    ['mentorId', 'not-a-uuid', 'Select a mentor'],
    ['mentorId', '', 'Select a mentor'],
    ['mentorId', undefined, 'Select a mentor'],
  ] as const)('reports %s of %p as "%s"', (field, value, message) => {
    expect(
      messageFor(CreateTopicSchema, { ...validTopic, [field]: value }, field),
    ).toBe(message);
  });

  it('trims the text it accepts', () => {
    const result = CreateTopicSchema.safeParse({
      ...validTopic,
      name: '  React Basics  ',
      description: `  ${validTopic.description}  `,
    });
    expect(result.data).toMatchObject({
      name: 'React Basics',
      description: validTopic.description,
    });
  });

  it('publishes the bounds its description messages quote', () => {
    expect(TOPIC_DESCRIPTION_LENGTH).toEqual({ min: 10, max: 1000 });
  });
});

describe('UpdateTopicSchema', () => {
  it('accepts a patch carrying one field', () => {
    expect(UpdateTopicSchema.safeParse({ name: 'React Basics' }).success).toBe(
      true,
    );
  });

  it('leaves an omitted certificationRequired undefined rather than false', () => {
    const result = UpdateTopicSchema.safeParse({ name: 'React Basics' });
    expect(result.data).toEqual({ name: 'React Basics' });
  });

  // Inherited from `CreateTopicSchema`, so an edit cannot set what a create
  // would have rejected — and reports it in the same words.
  it.each([
    ['name', '', 'Topic name must contain at least 1 character(s)'],
    ['name', 'a'.repeat(101), 'Topic name must be 100 characters or fewer'],
    [
      'description',
      'a'.repeat(9),
      'Description must be at least 10 characters',
    ],
    [
      'description',
      'a'.repeat(1001),
      'Description must be 1000 characters or fewer',
    ],
  ] as const)('reports %s of %p as "%s"', (field, value, message) => {
    expect(messageFor(UpdateTopicSchema, { [field]: value }, field)).toBe(
      message,
    );
  });
});
