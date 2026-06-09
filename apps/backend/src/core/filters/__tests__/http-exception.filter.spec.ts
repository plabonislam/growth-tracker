import { ArgumentsHost, ForbiddenException } from '@nestjs/common';
import { HttpExceptionFilter } from '../http-exception.filter';

const makeHost = (mockJson: jest.Mock) =>
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
    const mockJson = jest.fn();
    filter.catch(new Error('something broke'), makeHost(mockJson));

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('timestamp is valid ISO 8601', () => {
    const mockJson = jest.fn();
    filter.catch(new ForbiddenException(), makeHost(mockJson));

    const { timestamp } = mockJson.mock.calls[0][0];
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('normalises HttpException to { statusCode, message, timestamp }', () => {
    const mockJson = jest.fn();
    filter.catch(new ForbiddenException('Access denied'), makeHost(mockJson));

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
  });
});
