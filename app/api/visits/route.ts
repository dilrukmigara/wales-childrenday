import {db,json,safe,sameOrigin,digest} from '@/lib/server';
export async function POST(r:Request){return safe(async()=>{
  if(!sameOrigin(r))return json({error:'Invalid request.'},403);
  let b:any;try{b=await r.json()}catch{return json({error:'Invalid details.'},400)}
  if(!b||typeof b.name!=='string'||b.name.trim().length<2||b.name.length>80||typeof b.phone!=='string'||!/^\+?[0-9 ()-]{7,20}$/.test(b.phone)||b.phone.replace(/\D/g,'').length<7||typeof b.id!=='string'||!/^[a-f0-9-]{36}$/.test(b.id)||typeof b.token!=='string'||!/^[a-f0-9-]{72}$/.test(b.token))return json({error:'Please enter your name and a valid contact number.'},400);
  const tokenHash=await digest(b.token);
  const result=await db().prepare(`INSERT INTO submissions (id,name,birthday,phone,teacher_id,teacher_name,subject,created_at,edit_token,status) VALUES (?,?,'',?,'','','',?,?,'details_saved') ON CONFLICT(id) DO UPDATE SET name=excluded.name,phone=excluded.phone WHERE submissions.edit_token=excluded.edit_token`).bind(b.id,b.name.trim(),b.phone.trim(),new Date().toISOString(),tokenHash).run();
  if(!result.meta.changes)return json({error:'This visit could not be updated. Please start again.'},403);
  return json({ok:true,id:b.id});
})}
