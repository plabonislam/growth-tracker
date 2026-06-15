import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../core/database/database.service';
import { UserService } from '../user.service';

const mockDb = {
  select: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: DatabaseService, useValue: { db: mockDb } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('hardcoded Alice response is gone — stub fully replaced', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).not.toEqual([
        { id: 1, name: 'Alice', email: 'alice@example.com' },
      ]);
    });

    it('returns empty array when no users exist', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('returns all users from DB', async () => {
      const users = [
        {
          id: 'uuid-1',
          name: 'Alice',
          email: 'alice@dsinnovators.com',
          avatarUrl: null,
        },
        {
          id: 'uuid-2',
          name: 'Bob',
          email: 'bob@dsinnovators.com',
          avatarUrl: 'https://example.com/bob.png',
        },
      ];
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(users),
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'uuid-1',
        name: 'Alice',
        email: 'alice@dsinnovators.com',
      });
    });
  });
});
