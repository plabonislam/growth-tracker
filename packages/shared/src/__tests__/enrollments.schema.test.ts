import { describe, it, expect } from 'vitest';
import {
  ApproveEnrollmentSchema,
  EnrollTopicSchema,
  TOPIC_ENROLLMENT_REASON_LENGTH,
} from '../schemas/enrollments.schema';

describe('ApproveEnrollmentSchema', () => {
  it('accepts approve', () => {
    expect(
      ApproveEnrollmentSchema.safeParse({ action: 'approve' }).success,
    ).toBe(true);
  });

  it('accepts reject', () => {
    expect(
      ApproveEnrollmentSchema.safeParse({ action: 'reject' }).success,
    ).toBe(true);
  });

  it('rejects arbitrary string', () => {
    expect(
      ApproveEnrollmentSchema.safeParse({ action: 'pending' }).success,
    ).toBe(false);
  });
});

describe('EnrollTopicSchema', () => {
  const reasonOf = (length: number) => 'a'.repeat(length);

  it('accepts a reason at the minimum length', () => {
    expect(
      EnrollTopicSchema.safeParse({
        reason: reasonOf(TOPIC_ENROLLMENT_REASON_LENGTH.min),
      }).success,
    ).toBe(true);
  });

  it('rejects a reason below the minimum length', () => {
    expect(
      EnrollTopicSchema.safeParse({
        reason: reasonOf(TOPIC_ENROLLMENT_REASON_LENGTH.min - 1),
      }).success,
    ).toBe(false);
  });

  it('measures the trimmed reason, so padding cannot meet the floor', () => {
    const padded = `${' '.repeat(60)}too short${' '.repeat(60)}`;

    expect(EnrollTopicSchema.safeParse({ reason: padded }).success).toBe(false);
  });

  it('rejects a reason past the maximum length', () => {
    expect(
      EnrollTopicSchema.safeParse({
        reason: reasonOf(TOPIC_ENROLLMENT_REASON_LENGTH.max + 1),
      }).success,
    ).toBe(false);
  });
});
