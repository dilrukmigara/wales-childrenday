import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../lib/d1-http.ts';

const configuration = { CLOUDFLARE_ACCOUNT_ID: 'test-account', CLOUDFLARE_D1_DATABASE_ID: 'test-db', CLOUDFLARE_API_TOKEN: 'test-token' };
const result = (results = [], changes = 0) => ({ success: true, results, meta: { changes } });

test('D1 adapter preserves parameters, batch, empty results and mutation counts', async (t) => {
  const requests = [];
  const responses = [[result([{ name: "O'Neil" }])], [result()], [result([], 1)], [result([], 1), result([], 2)]];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, ...options, body: JSON.parse(options.body) });
    return Response.json({ success: true, result: responses.shift() });
  });
  const db = createDatabase(configuration);
  const statement = db.prepare('SELECT name FROM submissions WHERE name=?');
  assert.deepEqual(await statement.bind("O'Neil").first(), { name: "O'Neil" });
  assert.equal(await statement.bind('missing').first(), null);
  assert.equal((await db.prepare('UPDATE classes SET active=? WHERE id=?').bind(0, 'id').run()).meta.changes, 1);
  assert.equal((await db.batch([db.prepare('DELETE FROM sessions WHERE expires<?').bind(123), db.prepare('DELETE FROM attempts WHERE ip=?').bind('ip')])).length, 2);
  assert.deepEqual(requests[0].body, { sql: 'SELECT name FROM submissions WHERE name=?', params: ["O'Neil"] });
  assert.deepEqual(requests[1].body.params, ['missing']);
  assert.equal(requests[0].headers.Authorization, 'Bearer test-token');
  assert.equal(requests[0].cache, 'no-store');
  assert.equal(requests[0].url, 'https://api.cloudflare.com/client/v4/accounts/test-account/d1/database/test-db/query');
  assert.deepEqual(requests[3].body.batch.map(query => query.params), [[123], ['ip']]);
});

test('D1 adapter fails closed on missing configuration, HTTP errors and partial batches', async (t) => {
  assert.throws(() => createDatabase({}), /Configure/);
  const db = createDatabase(configuration);
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('sensitive remote error', { status: 403 }));
  await assert.rejects(db.prepare('SELECT 1').all(), /Database request failed \(403\)/);
  mock.mock.mockImplementation(async () => Response.json({ success: false, errors: [{ message: 'sensitive SQL' }] }));
  await assert.rejects(db.prepare('SELECT 1').all(), /^Error: Database query failed\.$/);
  mock.mock.mockImplementation(async () => Response.json({ success: true, result: [result()] }));
  await assert.rejects(db.batch([db.prepare('SELECT 1'), db.prepare('SELECT 2')]), /Database query failed/);
});
