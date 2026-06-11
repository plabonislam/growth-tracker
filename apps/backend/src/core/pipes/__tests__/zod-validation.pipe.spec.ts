import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../zod-validation.pipe';

const testSchema = z.object({
  name: z.string(),
  age: z.number(),
});

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(testSchema);
  });

  it('throws 400 with field name in error for missing required field', () => {
    expect(() => pipe.transform({ age: 30 })).toThrow(BadRequestException);

    try {
      pipe.transform({ age: 30 });
    } catch (e) {
      if (e instanceof BadRequestException) {
        expect(JSON.stringify(e.getResponse())).toContain('name');
      }
    }
  });

  it('throws 400 for wrong type', () => {
    expect(() =>
      pipe.transform({ name: 'Alice', age: 'not-a-number' }),
    ).toThrow(BadRequestException);
  });

  it('passes valid body through unchanged', () => {
    const body = { name: 'Alice', age: 30 };

    const result = pipe.transform(body);

    expect(result).toEqual(body);
  });
});
