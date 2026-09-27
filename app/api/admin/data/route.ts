import {db,json,safe,sameOrigin,admin,seed} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(r:Request){return safe(async()=>{
  if(!await admin(r))return json({error:'Please sign in.'},401);
  await seed();
  const requested=Number(new URL(r.url).searchParams.get('page')||1);
  if(!Number.isSafeInteger(requested)||requested<1)return json({error:'Invalid page.'},400);
  const count=await db().prepare('SELECT COUNT(*) AS total FROM submissions').first<{total:number}>();
  const total=count?.total||0,pageSize=50,pages=Math.max(1,Math.ceil(total/pageSize)),page=Math.min(requested,pages);
  const [teachers,students]=await Promise.all([
    db().prepare('SELECT * FROM classes WHERE active=1 ORDER BY name,subject,band').all(),
    db().prepare('SELECT id,name,phone,teacher_name,subject,created_at,status FROM submissions ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?').bind(pageSize,(page-1)*pageSize).all()
  ]);
  return json({teachers:teachers.results,students:students.results,pagination:{page,pageSize,pages,total}});
})}
export async function POST(r:Request){return safe(async()=>{if(!sameOrigin(r)||!await admin(r))return json({error:'Please sign in.'},401);let b:any;try{b=await r.json();if(!b||typeof b!=='object')throw Error()}catch{return json({error:'Invalid details.'},400)}if(b.action==='delete'){if(typeof b.id!=='string')return json({error:'Invalid class.'},400);await db().prepare('UPDATE classes SET active=0 WHERE id=?').bind(b.id).run();return json({ok:true})}if(typeof b.name!=='string'||!b.name.trim()||b.name.length>80||typeof b.subject!=='string'||!b.subject.trim()||b.subject.length>60||!['junior','senior','al'].includes(b.band)||typeof b.message!=='string'||b.message.length>240||b.id&&typeof b.id!=='string')return json({error:'Check the teacher, subject, group and wish message.'},400);const id=b.id||crypto.randomUUID();await db().prepare('INSERT INTO classes(id,name,subject,band,message,active) VALUES(?,?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET name=excluded.name,subject=excluded.subject,band=excluded.band,message=excluded.message,active=1').bind(id,b.name.trim(),b.subject.trim(),b.band,b.message.trim()).run();return json({ok:true,id})})}
