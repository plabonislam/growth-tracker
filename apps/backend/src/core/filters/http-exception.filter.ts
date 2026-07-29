import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

interface HttpResponse {
  status(code: number): this;
  json(body: unknown): this;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponse>();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp ? exception.getStatus() : 500;
    const httpResponse = isHttp ? exception.getResponse() : null;
    const body =
      typeof httpResponse === 'object' && httpResponse !== null
        ? (httpResponse as Record<string, unknown>)
        : null;

    const message = isHttp
      ? body && 'message' in body
        ? body.message
        : exception.message
      : 'Internal server error';

    // A thrown `{ code, message }` keeps its code all the way to the client:
    // the message is what a person reads, the code is what a screen branches
    // on. Anything thrown as a plain string simply has no code.
    const code = typeof body?.code === 'string' ? body.code : undefined;

    response.status(statusCode).json({
      statusCode,
      ...(code ? { code } : {}),
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
