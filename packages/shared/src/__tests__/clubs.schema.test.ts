import { describe, it, expect } from 'vitest';
import {
  CreateClubSchema,
  UpdateMembershipStatusSchema,
} from '../schemas/clubs.schema';

describe('CreateClubSchema', () => {
  it('accepts valid data', () => {
    const result = CreateClubSchema.safeParse({ name: 'Frontend Club' });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateClubSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('name');
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
