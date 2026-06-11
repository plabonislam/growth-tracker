import { describe, it, expect } from 'vitest';
import {
  CreateModuleSchema,
  ReorderModulesSchema,
} from '../schemas/course-modules.schema';

describe('CreateModuleSchema', () => {
  it('accepts valid data', () => {
    const result = CreateModuleSchema.safeParse({
      title: 'Selectors',
      weight: 30,
      order: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects weight of 0', () => {
    const result = CreateModuleSchema.safeParse({
      title: 'Selectors',
      weight: 0,
      order: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects weight > 100', () => {
    const result = CreateModuleSchema.safeParse({
      title: 'Selectors',
      weight: 101,
      order: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer weight', () => {
    const result = CreateModuleSchema.safeParse({
      title: 'Selectors',
      weight: 33.5,
      order: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const result = CreateModuleSchema.safeParse({ weight: 10, order: 1 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('title');
  });

  it('rejects missing weight', () => {
    const result = CreateModuleSchema.safeParse({
      title: 'Selectors',
      order: 1,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('weight');
  });
});

describe('ReorderModulesSchema', () => {
  it('accepts non-empty array', () => {
    const result = ReorderModulesSchema.safeParse({
      moduleIds: ['id-1', 'id-2'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty array', () => {
    const result = ReorderModulesSchema.safeParse({ moduleIds: [] });
    expect(result.success).toBe(false);
  });
});
