import {db,json,safe,sameOrigin,admin} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(r:Request){return safe(async()=>{
  if(!await admin(r))return json({error:'Please sign in.'},401);
  const requested=Number(new URL(r.url).searchParams.get('page')||1);
  if(!Number.isSafeInteger(requested)||requested<1)return json({error:'Invalid page.'},400);
  const total=await db().count(),pageSize=50,pages=Math.max(1,Math.ceil(total/pageSize)),page=Math.min(requested,pages);
  const [teachers,students]=await Promise.all([db().classes(),db().students(pageSize,(page-1)*pageSize)]);
  return json({teachers,students,pagination:{page,pageSize,pages,total}});
})}
export async function POST(r:Request){return safe(async()=>{if(!sameOrigin(r)||!await admin(r))return json({error:'Please sign in.'},401);let b:any;try{b=await r.json();if(!b||typeof b!=='object')throw Error()}catch{return json({error:'Invalid details.'},400)}if(b.action==='delete'){if(typeof b.id!=='string')return json({error:'Invalid class.'},400);await db().removeClass(b.id);return json({ok:true})}if(typeof b.name!=='string'||!b.name.trim()||b.name.length>80||typeof b.subject!=='string'||!b.subject.trim()||b.subject.length>60||!['junior','senior','al'].includes(b.band)||typeof b.message!=='string'||b.message.length>240||b.id&&typeof b.id!=='string')return json({error:'Check the teacher, subject, group and wish message.'},400);const id=b.id||crypto.randomUUID();await db().saveClass({id,name:b.name.trim(),subject:b.subject.trim(),band:b.band,message:b.message.trim()});return json({ok:true,id})})}
