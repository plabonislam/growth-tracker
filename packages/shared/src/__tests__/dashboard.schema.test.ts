import { describe, it, expect } from 'vitest';
import { DashboardQuerySchema } from '../schemas/dashboard.schema';

describe('DashboardQuerySchema', () => {
  it('accepts all valid ranges', () => {
    expect(DashboardQuerySchema.safeParse({ range: '7d' }).success).toBe(true);
    expect(DashboardQuerySchema.safeParse({ range: '1m' }).success).toBe(true);
    expect(DashboardQuerySchema.safeParse({ range: '6m' }).success).toBe(true);
  });

  it('defaults range to 1m when omitted', () => {
    const result = DashboardQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.range).toBe('1m');
  });

  it('rejects invalid range', () => {
    expect(DashboardQuerySchema.safeParse({ range: '3m' }).success).toBe(false);
  });

  it('clubId is optional', () => {
    expect(DashboardQuerySchema.safeParse({ range: '1m' }).success).toBe(true);
  });
});
