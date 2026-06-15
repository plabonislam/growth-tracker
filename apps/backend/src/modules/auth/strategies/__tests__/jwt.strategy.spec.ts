import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtStrategy } from '../jwt.strategy';

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('validate returns user payload for valid JWT', () => {
    const payload = {
      sub: 'uuid-1',
      email: 'alice@dsinnovators.com',
      isAuthority: false,
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: 'uuid-1',
      email: 'alice@dsinnovators.com',
      isAuthority: false,
    });
  });
});
