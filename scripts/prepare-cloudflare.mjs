import { readFileSync, writeFileSync } from 'node:fs';
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
if (!databaseId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databaseId) || databaseId === '00000000-0000-4000-8000-000000000000') {
  throw new Error('Set CLOUDFLARE_D1_DATABASE_ID to the database_id returned by wrangler d1 create wales-childrenday.');
}
const configPath = new URL('../dist/server/wrangler.json', import.meta.url);
const config = JSON.parse(readFileSync(configPath, 'utf8'));
config.name = 'wales-childrenday';
config.workers_dev = true;
config.d1_databases = [{ binding: 'DB', database_name: 'wales-childrenday', database_id: databaseId, migrations_dir: '../../drizzle' }];
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('Cloudflare deployment configuration prepared.');
