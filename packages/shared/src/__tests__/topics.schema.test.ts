import { describe, it, expect } from 'vitest';
import { CreateTopicSchema } from '../schemas/topics.schema';

const MENTOR_ID = '11111111-1111-1111-1111-111111111111';

describe('CreateTopicSchema', () => {
  it('accepts valid data with certificationRequired omitted', () => {
    const result = CreateTopicSchema.safeParse({
      name: 'React Basics',
      mentorId: MENTOR_ID,
    });
    expect(result.success).toBe(true);
    expect(result.data?.certificationRequired).toBe(false);
  });

  it('accepts explicit certificationRequired', () => {
    const result = CreateTopicSchema.safeParse({
      name: 'React Basics',
      certificationRequired: true,
      mentorId: MENTOR_ID,
    });
    expect(result.success).toBe(true);
    expect(result.data?.certificationRequired).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateTopicSchema.safeParse({ mentorId: MENTOR_ID });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('name');
  });

  it('rejects a missing mentor — a mentor is mandatory', () => {
    const result = CreateTopicSchema.safeParse({ name: 'React Basics' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes('mentorId'))).toBe(
      true,
    );
  });

  it('rejects a non-uuid mentor id', () => {
    const result = CreateTopicSchema.safeParse({
      name: 'React Basics',
      mentorId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});
