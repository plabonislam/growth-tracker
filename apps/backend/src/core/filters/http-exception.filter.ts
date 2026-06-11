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
    const message = isHttp
      ? typeof httpResponse === 'object' &&
        httpResponse !== null &&
        'message' in httpResponse
        ? (httpResponse as Record<string, unknown>).message
        : exception.message
      : 'Internal server error';

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
