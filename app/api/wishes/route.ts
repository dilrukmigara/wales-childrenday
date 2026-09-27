import {db,json,safe,sameOrigin,digest} from '@/lib/server';
export async function POST(r:Request){return safe(async()=>{
  if(!sameOrigin(r))return json({error:'Invalid request.'},403);
  let b:any;try{b=await r.json()}catch{return json({error:'Invalid details.'},400)}
  if(!b||typeof b.id!=='string'||typeof b.token!=='string'||b.token.length!==72||typeof b.teacherId!=='string')return json({error:'Please save your details first.'},400);
  const teacher=await db().prepare('SELECT name,subject FROM classes WHERE id=? AND active=1').bind(b.teacherId).first<{name:string;subject:string}>();
  if(!teacher)return json({error:'This class is no longer available. Please refresh and choose another.'},400);
  const result=await db().prepare("UPDATE submissions SET teacher_id=?,teacher_name=?,subject=?,status='completed' WHERE id=? AND edit_token=?").bind(b.teacherId,teacher.name,teacher.subject,b.id,await digest(b.token)).run();
  if(!result.meta.changes)return json({error:'Please go back and save your details again.'},403);
  return json({ok:true});
})}
