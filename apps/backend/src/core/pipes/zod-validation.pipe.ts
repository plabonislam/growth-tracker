import {
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
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
