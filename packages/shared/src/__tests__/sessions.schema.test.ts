import { describe, it, expect } from 'vitest';
import { CreateSessionSchema } from '../schemas/sessions.schema';

describe('CreateSessionSchema', () => {
  it('accepts valid data', () => {
    const result = CreateSessionSchema.safeParse({
      date: '2026-06-08',
      type: 'weekly',
      objective: 'Review hooks',
      facilitator: 'Alice',
      participantCount: 12,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const result = CreateSessionSchema.safeParse({
      date: '2026-06-08',
      type: 'daily',
      objective: 'Review hooks',
      facilitator: 'Alice',
      participantCount: 12,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive participantCount', () => {
    const result = CreateSessionSchema.safeParse({
      date: '2026-06-08',
      type: 'weekly',
      objective: 'Review hooks',
      facilitator: 'Alice',
      participantCount: 0,
    });
    expect(result.success).toBe(false);
  });
});
