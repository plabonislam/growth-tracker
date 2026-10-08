import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/index';
import { seed } from '../seed';
import { FAKE_USERS } from '../seed-data/users';

const SEED_EMAIL = 'someone@gmail.com';
const FIXTURE_EMAIL = FAKE_USERS[0].email;

function createMockDb() {
  // insert(table).values(rows).onConflictDoNothing() — and values(row) awaited directly
  const onConflictDoNothing = jest.fn().mockResolvedValue(undefined);
  const values = jest.fn((payload: unknown) => ({
    onConflictDoNothing,
    then: (resolve: (v: undefined) => unknown) => resolve(undefined),
    payload,
  }));
  const insert = jest.fn(() => ({ values }));

  // update(table).set(...).where(...).returning(...)
  const returning = jest.fn().mockResolvedValue([{ id: 'user-1' }]);
  const updateWhere = jest.fn(() => ({ returning }));
  const set = jest.fn(() => ({ where: updateWhere }));
  const update = jest.fn(() => ({ set }));

  // select(...).from(...).where(...).limit(1) — clubs/topics lookups
  const limit = jest.fn().mockResolvedValue([{ id: 'row-1' }]);
  const selectWhere = jest.fn(() => ({ limit }));
  const from = jest.fn(() => ({ where: selectWhere }));
  const select = jest.fn(() => ({ from }));

  const db = { insert, update, select } as unknown as NodePgDatabase<
    typeof schema
  >;

  return {
    db,
    insert,
    values,
    onConflictDoNothing,
    update,
    set,
    returning,
    /** payloads handed to .values(), one entry per insert call */
    insertedValues: () => values.mock.calls.map(([payload]) => payload),
  };
}

/** the single-row insert the promotion fallback makes, if any */
function promotionInsert(payloads: unknown[]) {
  return payloads.find(
    (p): p is { email: string; isAuthority: boolean; name: string } =>
      !Array.isArray(p) &&
      typeof p === 'object' &&
      p !== null &&
      'isAuthority' in p,
  );
}

describe('seed', () => {
  it('seeds the fixture users without clobbering existing rows', async () => {
    const m = createMockDb();

    await seed(m.db, SEED_EMAIL);

    const [fixtureRows] = m.insertedValues() as [
      Array<{ email: string; isAuthority: boolean }>,
    ];
    expect(fixtureRows).toHaveLength(FAKE_USERS.length);
    // no onConflictDoUpdate — an account that already logged in keeps its flag
    expect(m.onConflictDoNothing).toHaveBeenCalled();
  });

  it('promotes SEED_EMAIL when the account already exists', async () => {
    const m = createMockDb();

    await seed(m.db, SEED_EMAIL);

    expect(m.set).toHaveBeenCalledWith({ isAuthority: true });
    expect(m.update).toHaveBeenCalledTimes(1);
    // the row was found, so no fallback insert
    expect(promotionInsert(m.insertedValues())).toBeUndefined();
  });

  it('creates SEED_EMAIL as authority when no row exists yet', async () => {
    const m = createMockDb();
    m.returning.mockResolvedValue([]);

    await seed(m.db, SEED_EMAIL);

    expect(promotionInsert(m.insertedValues())).toEqual({
      name: 'someone',
      email: SEED_EMAIL,
      isAuthority: true,
    });
  });

  it('promotes an address outside FAKE_USERS, not just fixture addresses', async () => {
    const m = createMockDb();
    m.returning.mockResolvedValue([]);

    await seed(m.db, SEED_EMAIL);

    const fixtureRows = m.insertedValues()[0] as Array<{ email: string }>;
    expect(fixtureRows.some((u) => u.email === SEED_EMAIL)).toBe(false);
    expect(promotionInsert(m.insertedValues())?.email).toBe(SEED_EMAIL);
  });

  it('promotes a fixture address too', async () => {
    const m = createMockDb();

    await seed(m.db, FIXTURE_EMAIL);

    expect(m.update).toHaveBeenCalledTimes(1);
    expect(m.set).toHaveBeenCalledWith({ isAuthority: true });
  });

  it('skips promotion when SEED_EMAIL is unset', async () => {
    const m = createMockDb();

    await expect(seed(m.db)).resolves.toBeUndefined();

    expect(m.update).not.toHaveBeenCalled();
    expect(promotionInsert(m.insertedValues())).toBeUndefined();
  });

  it('is idempotent — re-running does not throw', async () => {
    const m = createMockDb();

    await seed(m.db, SEED_EMAIL);
    await expect(seed(m.db, SEED_EMAIL)).resolves.toBeUndefined();

    expect(m.update).toHaveBeenCalledTimes(2);
  });
});
