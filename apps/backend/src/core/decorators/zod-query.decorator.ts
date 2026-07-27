import { Query } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

/**
 * `@ZodBody`'s counterpart for the query string — same pipe, same 400 shape.
 * Query values arrive as strings, so the schema has to coerce anything that
 * isn't one.
 */
export const ZodQuery = (schema: ZodSchema) =>
  Query(new ZodValidationPipe(schema));
