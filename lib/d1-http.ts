type Parameter = string | number | null;
type Query = { sql: string; params: Parameter[] };
type QueryResult<T = Record<string, unknown>> = {
  success: boolean;
  results: T[];
  meta: { changes: number };
};
type Configuration = {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_D1_DATABASE_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
};

// D1's HTTP query API allows the same database to be used from Vercel Node functions.
export function createDatabase(configuration: Configuration) {
  const account = configuration.CLOUDFLARE_ACCOUNT_ID;
  const id = configuration.CLOUDFLARE_D1_DATABASE_ID;
  const token = configuration.CLOUDFLARE_API_TOKEN;
  if (!account || !id || !token) {
    throw new Error('Configure CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID and CLOUDFLARE_API_TOKEN.');
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(id)}/query`;
  async function execute(body: Query | { batch: Query[] }): Promise<QueryResult[]> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Database request failed (${response.status}).`);
    const payload = await response.json() as { success?: boolean; result?: QueryResult[] };
    const expected = 'batch' in body ? body.batch.length : 1;
    if (!payload.success || !Array.isArray(payload.result) || payload.result.length !== expected ||
        payload.result.some(result => !result.success || !Array.isArray(result.results) || typeof result.meta?.changes !== 'number')) {
      // Do not log remote response bodies: they may contain SQL or student data.
      throw new Error('Database query failed.');
    }
    return payload.result;
  }
  class Statement {
    readonly query: Query;
    constructor(sql: string, params: Parameter[] = []) { this.query = { sql, params }; }
    bind(...params: Parameter[]) { return new Statement(this.query.sql, params); }
    async all<T = Record<string, unknown>>() { return (await execute(this.query))[0] as QueryResult<T>; }
    async first<T = Record<string, unknown>>() { return (await this.all<T>()).results[0] ?? null; }
    async run() { return (await execute(this.query))[0]; }
  }
  return {
    prepare(sql: string) { return new Statement(sql); },
    batch(statements: Statement[]) { return execute({ batch: statements.map(statement => statement.query) }); },
  };
}
