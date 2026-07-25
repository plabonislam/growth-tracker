import { describe, it, expect } from 'vitest';
import { z } from 'zod';
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
  // Past the 30-character floor `body` carries.
  body: 'How selectors narrow a query, with examples.',
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

/** First message reported for `field`, or `undefined` if the parse succeeded. */
function messageFor(schema: z.ZodTypeAny, value: unknown, field: string) {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path.join('.') === field)
    ?.message;
}

describe('CreateModuleSchema', () => {
  it('accepts valid data', () => {
    expect(CreateModuleSchema.safeParse(validModule).success).toBe(true);
  });

  // Messages are asserted verbatim: these reach mentors through the form and
  // API clients through `ZodValidationPipe`, so the wording is the contract.
  it.each([
    ['weight', 0, 'Weight must be at least 1%'],
    ['weight', 101, 'Weight must be 100% or less'],
    ['weight', 33.5, 'Weight must be a whole number'],
    ['weight', NaN, 'Weight must be a number between 1 and 100'],
    ['weight', undefined, 'Weight is required'],
    ['estTime', 0, 'Estimated time must be at least 1 minute'],
    ['estTime', 45.5, 'Estimated time must be a whole number of minutes'],
    ['estTime', NaN, 'Estimated time must be a number of minutes'],
    ['estTime', undefined, 'Estimated time is required'],
    ['estTime', 1441, 'Estimated time must be 1440 minutes (24 hours) or less'],
    ['title', '', 'Title must contain at least 1 character(s)'],
    ['title', '   ', 'Title must contain at least 1 character(s)'],
    ['title', 'a'.repeat(121), 'Title must be 120 characters or fewer'],
    ['title', 42, 'Title must be text'],
    ['body', '', 'Learning content must be at least 30 characters'],
    ['body', '\n\t ', 'Learning content must be at least 30 characters'],
    ['body', 'a'.repeat(29), 'Learning content must be at least 30 characters'],
    [
      'body',
      'a'.repeat(5001),
      'Learning content must be 5000 characters or fewer',
    ],
  ] as const)('reports %s of %p as "%s"', (field, value, message) => {
    expect(
      messageFor(CreateModuleSchema, { ...validModule, [field]: value }, field),
    ).toBe(message);
  });

  it.each(['title', 'body', 'weight', 'estTime'] as const)(
    'rejects missing %s',
    (field) => {
      const result = CreateModuleSchema.safeParse(without(validModule, field));
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain(field);
    },
  );

  it('trims the text it accepts', () => {
    const result = CreateModuleSchema.safeParse({
      ...validModule,
      title: '  Selectors  ',
      body: '\n How selectors narrow a query, with examples. ',
    });
    expect(result.data).toMatchObject({
      title: 'Selectors',
      body: 'How selectors narrow a query, with examples.',
    });
  });

  it('measures the body floor after trimming, not before', () => {
    const result = CreateModuleSchema.safeParse({
      ...validModule,
      body: `${'a'.repeat(29)}          `,
    });
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

  it.each([
    ['title', '', 'Resource title must contain at least 1 character(s)'],
    ['title', '  ', 'Resource title must contain at least 1 character(s)'],
    [
      'title',
      'a'.repeat(121),
      'Resource title must be 120 characters or fewer',
    ],
    // One message for every way a link can be wrong — blank, malformed,
    // over-long, or a scheme `.url()` accepts but a module card must not link.
    ['url', '', 'Link must be a valid URL'],
    ['url', '   ', 'Link must be a valid URL'],
    ['url', 'not-a-url', 'Link must be a valid URL'],
    ['url', 'javascript:alert(1)', 'Link must be a valid URL'],
    ['url', 'ftp://example.com/a', 'Link must be a valid URL'],
    [
      'url',
      `https://example.com/${'a'.repeat(2048)}`,
      'Link must be a valid URL',
    ],
    ['kind', 'podcast', 'Resource type must be Video or Doc'],
    ['kind', undefined, 'Resource type must be Video or Doc'],
  ] as const)('reports %s of %p as "%s"', (field, value, message) => {
    expect(
      messageFor(
        CreateResourceSchema,
        { ...validResource, [field]: value },
        field,
      ),
    ).toBe(message);
  });

  it('accepts http as well as https', () => {
    const result = CreateResourceSchema.safeParse({
      ...validResource,
      url: 'http://example.com/selectors',
    });
    expect(result.success).toBe(true);
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
    expect(result.error?.issues[0].message).toBe(
      'Resources must contain at least 1 item',
    );
  });

  it('rejects more than ten resources', () => {
    const result = CreateModuleWithResourcesSchema.safeParse({
      ...authoredModule,
      resources: Array.from({ length: 11 }, () => validResource),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Resources must contain at most 10 items',
    );
  });

  it('reports a broken row under its own path', () => {
    const result = CreateModuleWithResourcesSchema.safeParse({
      ...authoredModule,
      resources: [validResource, { ...validResource, url: 'nope' }],
    });
    expect(result.error?.issues[0].path).toEqual(['resources', 1, 'url']);
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

  // How editing uses it: the topic sums to 100, but the module being edited
  // holds 30 of that, so the budget it is measured against is the other 70.
  it('accepts an unchanged weight when the module is excluded from the budget', () => {
    const result = buildCreateModuleWithResourcesSchema(100 - 30).safeParse(
      withResources,
    );
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
