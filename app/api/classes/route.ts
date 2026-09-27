import {db,json,safe,seed} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){return safe(async()=>{await seed();const r=await db().prepare('SELECT id,name,subject,band,message FROM classes WHERE active=1 ORDER BY name,subject,band').all();return json(r.results)})}
