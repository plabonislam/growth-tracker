import {
  ArgumentsHost,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../http-exception.filter';

/** The body the filter is expected to write. */
interface ErrorBody {
  statusCode: number;
  message: string;
  timestamp: string;
  code?: string;
}

/**
 * Typed rather than a bare `jest.Mock` so reading `mock.calls` back gives the
 * body's real field types instead of `any`. The type argument has to go on the
 * `jest.fn()` call itself — annotating the variable would just be assigning a
 * `Mock<any, any>` to it.
 */
type JsonMock = jest.Mock<void, [ErrorBody]>;

const makeJsonMock = (): JsonMock => jest.fn<void, [ErrorBody]>();

const makeHost = (mockJson: JsonMock) =>
  ({
    switchToHttp: () => ({
      getResponse: () => ({
        status: jest.fn().mockReturnThis(),
        json: mockJson,
      }),
    }),
  }) as unknown as ArgumentsHost;

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('normalises unknown errors to 500', () => {
    const mockJson = makeJsonMock();
    filter.catch(new Error('something broke'), makeHost(mockJson));

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('timestamp is valid ISO 8601', () => {
    const mockJson = makeJsonMock();
    filter.catch(new ForbiddenException(), makeHost(mockJson));

    const { timestamp } = mockJson.mock.calls[0][0];
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('passes a thrown code through, and omits the field without one', () => {
    const withCode = makeJsonMock();
    filter.catch(
      new ConflictException({ code: 'ALREADY_MEMBER', message: 'Already in.' }),
      makeHost(withCode),
    );
    expect(withCode).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        code: 'ALREADY_MEMBER',
        message: 'Already in.',
      }),
    );

    const withoutCode = makeJsonMock();
    filter.catch(
      new ForbiddenException('Access denied'),
      makeHost(withoutCode),
    );
    expect(withoutCode.mock.calls[0][0]).not.toHaveProperty('code');
  });

  it('normalises HttpException to { statusCode, message, timestamp }', () => {
    const mockJson = makeJsonMock();
    filter.catch(new ForbiddenException('Access denied'), makeHost(mockJson));

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        // `expect.any` is typed `any`; narrowed here so the matcher object
        // stays assignable to the body's own field types.
        message: expect.any(String) as string,
        timestamp: expect.any(String) as string,
      }),
    );
  });
});
