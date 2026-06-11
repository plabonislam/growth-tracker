import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database.service';

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    end: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: jest.fn().mockReturnValue({ _tag: 'DrizzleInstance' }),
}));

describe('DatabaseService', () => {
  let service: DatabaseService;

  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.getOrThrow.mockReturnValue(
      'postgresql://test:test@localhost:5432/testdb',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('initialises db instance with valid DATABASE_URL', () => {
    expect(service.db).toBeDefined();
    expect(service.db).not.toBeNull();
  });

  it('exposes db for injection into consumers', () => {
    const injected = service;
    expect(injected.db).toBeDefined();
    expect(injected.db).toBe(service.db);
  });

  it('throws when DATABASE_URL is missing', async () => {
    mockConfigService.getOrThrow.mockImplementation(() => {
      throw new Error('DATABASE_URL is not defined');
    });

    await expect(
      Test.createTestingModule({
        providers: [
          DatabaseService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile(),
    ).rejects.toThrow('DATABASE_URL is not defined');
  });
});
