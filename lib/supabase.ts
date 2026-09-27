type Row = Record<string, unknown>;
export function createDatabase(config: { url?: string; key?: string }) {
  if (!config.url || !config.key) throw new Error('Configure SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.');
  const base = new URL('/rest/v1/', config.url);
  const key = config.key;
  async function request<T>(path: string, method = 'GET', body?: unknown, prefer?: string): Promise<T> {
    const headers: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' };
    // Legacy service_role JWTs require Authorization; new secret keys use apikey only.
    if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
    if (prefer) headers.Prefer = prefer;
    const response = await fetch(new URL(path, base), { method, headers,
      body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as { code?: string };
      const code = typeof error.code === 'string' && /^[A-Za-z0-9_]+$/.test(error.code) ? error.code : 'unknown';
      throw new Error(`Supabase request failed (HTTP ${response.status}, code ${code}). Check credentials and supabase/setup.sql.`);
    }
    return response.status === 204 ? undefined as T : await response.json() as T;
  }
  const query = (table: string, values: Record<string, string>) => table + '?' + new URLSearchParams(values);
  const rpc = <T>(name: string, args: Row) => request<T>('rpc/' + name, 'POST', args);
  return {
    async classes() {
      // Page through PostgREST's response cap so all active teachers remain available.
      const rows: Row[] = [];
      for (let offset = 0;;) {
        const page = await request<Row[]>(query('wales_classes', {select:'id,name,subject,band,message',active:'eq.true',order:'name.asc,subject.asc,band.asc,id.asc',limit:'500',offset:String(offset)}));
        rows.push(...page); if (!page.length) return rows; offset += page.length;
      }
    },
    async teacher(id: string) { return (await request<{name:string;subject:string}[]>(query('wales_classes',{select:'name,subject',id:'eq.'+id,active:'eq.true'})))[0]; },
    saveClass(row: Row) { return request('wales_classes?on_conflict=id','POST',{...row,active:true},'resolution=merge-duplicates,return=minimal'); },
    removeClass(id: string) { return request(query('wales_classes',{id:'eq.'+id}),'PATCH',{active:false},'return=minimal'); },
    saveVisit(id:string,name:string,phone:string,token:string) { return rpc<boolean>('wales_save_visit',{p_id:id,p_name:name,p_phone:phone,p_token:token}); },
    async completeVisit(id:string,token:string,teacherId:string,teacher:{name:string;subject:string}) {
      return (await request<Row[]>(query('wales_submissions',{id:'eq.'+id,edit_token:'eq.'+token,select:'id'}),'PATCH',
        {teacher_id:teacherId,teacher_name:teacher.name,subject:teacher.subject,status:'completed'},'return=representation')).length > 0;
    },
    count() { return rpc<number>('wales_submission_count',{}); },
    students(limit:number,offset:number) { return request<Row[]>(query('wales_submissions',{select:'id,name,phone,teacher_name,subject,created_at,status',order:'created_at.desc,id.desc',limit:String(limit),offset:String(offset)})); },
    async session(token:string,now:number) { return (await request<Row[]>(query('wales_sessions',{select:'token',token:'eq.'+token,expires:'gt.'+now}))).length > 0; },
    attempt(ip:string,now:number) { return rpc<number>('wales_login_attempt',{p_ip:ip,p_now:now}); },
    createSession(token:string,ip:string,now:number) { return rpc('wales_create_session',{p_token:token,p_ip:ip,p_now:now}); },
    deleteSession(token:string) { return request(query('wales_sessions',{token:'eq.'+token}),'DELETE',undefined,'return=minimal'); },
  };
}
