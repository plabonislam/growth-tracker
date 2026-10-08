import {
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { ZodType } from 'zod';

/**
 * Generic over the schema's output so callers get the parsed type back rather
 * than `any` — `ZodSchema` is `ZodType<any>`, which would spread that `any`
 * through every handler the pipe feeds.
 */
@Injectable()
export class ZodValidationPipe<TOutput = unknown>
  implements PipeTransform<unknown, TOutput>
{
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private readonly schema: ZodType<TOutput>) {}

  transform(value: unknown): TOutput {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const flattened = result.error.flatten();
      // Field names + messages only — the payload itself may carry user data.
      this.logger.warn(
        `Validation failed: ${JSON.stringify({
          fieldErrors: flattened.fieldErrors,
          formErrors: flattened.formErrors,
        })}`,
      );
      throw new BadRequestException(flattened);
    }
    return result.data;
  }
}
