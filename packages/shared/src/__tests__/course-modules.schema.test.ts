import { describe, it, expect } from 'vitest';
import {
  CreateModuleSchema,
  CreateModuleWithResourcesSchema,
  CreateResourceSchema,
  ReorderModulesSchema,
  buildCreateModuleWithResourcesSchema,
} from '../schemas/course-modules.schema';

/** What a mentor authors; `order` is added by the create endpoint's schema. */
const authoredModule = {
  title: 'Selectors',
  body: 'How selectors narrow a query.',
  weight: 30,
  estTime: 45,
};

/** Every field is mandatory, so cases are built by breaking one at a time. */
const validModule = { ...authoredModule, order: 1 };

const validResource = {
  title: 'Selector reference',
  url: 'https://example.com/selectors',
  kind: 'doc' as const,
};

/** A copy of `source` with one key dropped, for the "rejects missing X" cases. */
function without<T extends object>(source: T, key: keyof T) {
  const copy = { ...source };
  delete copy[key];
  return copy;
}

describe('CreateModuleSchema', () => {
  it('accepts valid data', () => {
    expect(CreateModuleSchema.safeParse(validModule).success).toBe(true);
  });

  it('rejects weight of 0', () => {
    const result = CreateModuleSchema.safeParse({ ...validModule, weight: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects weight > 100', () => {
    const result = CreateModuleSchema.safeParse({
      ...validModule,
      weight: 101,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer weight', () => {
    const result = CreateModuleSchema.safeParse({
      ...validModule,
      weight: 33.5,
    });
    expect(result.success).toBe(false);
  });

  it.each(['title', 'body', 'weight', 'estTime'] as const)(
    'rejects missing %s',
    (field) => {
      const result = CreateModuleSchema.safeParse(without(validModule, field));
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain(field);
    },
  );

  it('rejects an empty body', () => {
    const result = CreateModuleSchema.safeParse({ ...validModule, body: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive estTime', () => {
    const result = CreateModuleSchema.safeParse({ ...validModule, estTime: 0 });
    expect(result.success).toBe(false);
  });
});

describe('CreateResourceSchema', () => {
  it('accepts a valid resource', () => {
    expect(CreateResourceSchema.safeParse(validResource).success).toBe(true);
  });

  it('rejects a missing kind', () => {
    const result = CreateResourceSchema.safeParse(
      without(validResource, 'kind'),
    );
    expect(result.success).toBe(false);
  });

  it('rejects an unknown kind', () => {
    const result = CreateResourceSchema.safeParse({
      ...validResource,
      kind: 'podcast',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-URL link', () => {
    const result = CreateResourceSchema.safeParse({
      ...validResource,
      url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateModuleWithResourcesSchema', () => {
  it('accepts a module carrying one resource', () => {
    const result = CreateModuleWithResourcesSchema.safeParse({
      ...authoredModule,
      resources: [validResource],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a module with no resources', () => {
    const result = CreateModuleWithResourcesSchema.safeParse({
      ...authoredModule,
      resources: [],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('resources');
  });

  it('rejects more than ten resources', () => {
    const result = CreateModuleWithResourcesSchema.safeParse({
      ...authoredModule,
      resources: Array.from({ length: 11 }, () => validResource),
    });
    expect(result.success).toBe(false);
  });
});

describe('buildCreateModuleWithResourcesSchema', () => {
  const withResources = { ...authoredModule, resources: [validResource] };

  it('accepts a weight that fits the remaining budget', () => {
    // 70 allocated + 30 requested lands exactly on 100.
    const result =
      buildCreateModuleWithResourcesSchema(70).safeParse(withResources);
    expect(result.success).toBe(true);
  });

  it('rejects a weight that would push the topic past 100', () => {
    const result =
      buildCreateModuleWithResourcesSchema(80).safeParse(withResources);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('weight');
    expect(result.error?.issues[0].message).toContain('20%');
  });

  it('reports a fully allocated topic differently', () => {
    const result =
      buildCreateModuleWithResourcesSchema(100).safeParse(withResources);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('fully allocated');
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
