import { describe, it, expect } from 'vitest';
import { CreateTopicSchema } from '../schemas/topics.schema';

describe('CreateTopicSchema', () => {
  it('accepts valid data with certificationRequired omitted', () => {
    const result = CreateTopicSchema.safeParse({ name: 'React Basics' });
    expect(result.success).toBe(true);
    expect(result.data?.certificationRequired).toBe(false);
  });

  it('accepts explicit certificationRequired', () => {
    const result = CreateTopicSchema.safeParse({
      name: 'React Basics',
      certificationRequired: true,
    });
    expect(result.success).toBe(true);
    expect(result.data?.certificationRequired).toBe(true);
  });

  it('rejects missing name', () => {
    const result = CreateTopicSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('name');
  });
});
