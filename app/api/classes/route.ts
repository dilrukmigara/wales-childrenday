import {db,json,safe} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){return safe(async()=>json(await db().classes()))}
