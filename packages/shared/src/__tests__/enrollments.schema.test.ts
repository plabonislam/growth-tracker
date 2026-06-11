import { describe, it, expect } from 'vitest';
import { ApproveEnrollmentSchema } from '../schemas/enrollments.schema';

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
