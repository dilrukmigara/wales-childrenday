import {db,json,safe,sameOrigin,digest,cookie} from '@/lib/server';
export async function POST(r:Request){return safe(async()=>{if(!sameOrigin(r))return json({error:'Invalid request.'},403);const token=r.headers.get('cookie')?.match(/(?:^|;\s*)wales_admin=([^;]+)/)?.[1];if(token)await db().deleteSession(await digest(token));return json({ok:true},200,{'Set-Cookie':cookie(r,'',0)})})}
