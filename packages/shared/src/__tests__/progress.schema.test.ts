import { describe, it, expect } from 'vitest';
import {
  UpdateModuleProgressSchema,
  CreateSubmissionSchema,
} from '../schemas/progress.schema';

describe('UpdateModuleProgressSchema', () => {
  it('accepts learner-valid transitions', () => {
    expect(
      UpdateModuleProgressSchema.safeParse({ status: 'in_progress' }).success,
    ).toBe(true);
    expect(
      UpdateModuleProgressSchema.safeParse({ status: 'pending_confirmation' })
        .success,
    ).toBe(true);
    expect(
      UpdateModuleProgressSchema.safeParse({ status: 'to_do' }).success,
    ).toBe(true);
  });

  it('rejects completed', () => {
    expect(
      UpdateModuleProgressSchema.safeParse({ status: 'completed' }).success,
    ).toBe(false);
  });
});

describe('CreateSubmissionSchema', () => {
  it('accepts valid content', () => {
    expect(
      CreateSubmissionSchema.safeParse({ content: 'My answer' }).success,
    ).toBe(true);
  });

  it('rejects empty string', () => {
    expect(CreateSubmissionSchema.safeParse({ content: '' }).success).toBe(
      false,
    );
  });
});
