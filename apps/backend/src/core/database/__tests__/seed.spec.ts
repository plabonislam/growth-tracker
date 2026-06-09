import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/index';
import { seed } from '../seed';

const mockWhere = jest.fn().mockResolvedValue([{ rowCount: 1 }]);
const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
const mockDb = { update: mockUpdate } as unknown as NodePgDatabase<
  typeof schema
>;

describe('seed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWhere.mockResolvedValue([{ rowCount: 1 }]);
  });

  it('sets is_authority = true for matching user', async () => {
    await seed(mockDb, 'admin@dsinnovators.com');

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({ isAuthority: true });
    expect(mockWhere).toHaveBeenCalledTimes(1);
  });

  it('is idempotent — re-running on already-seeded user does not throw', async () => {
    await seed(mockDb, 'admin@dsinnovators.com');
    await expect(
      seed(mockDb, 'admin@dsinnovators.com'),
    ).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledTimes(2);
  });

  it('logs error when no user found and does not throw', async () => {
    mockWhere.mockResolvedValue([{ rowCount: 0 }]);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(
      seed(mockDb, 'nobody@dsinnovators.com'),
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('nobody@dsinnovators.com'),
    );

    consoleSpy.mockRestore();
  });
});
