import {db,json,safe,sameOrigin,digest} from '@/lib/server';
export async function POST(r:Request){return safe(async()=>{
  if(!sameOrigin(r))return json({error:'Invalid request.'},403);
  let b:any;try{b=await r.json()}catch{return json({error:'Invalid details.'},400)}
  if(!b||typeof b.id!=='string'||typeof b.token!=='string'||b.token.length!==72||typeof b.teacherId!=='string')return json({error:'Please save your details first.'},400);
  const teacher=await db().teacher(b.teacherId);
  if(!teacher)return json({error:'This class is no longer available. Please refresh and choose another.'},400);
  const saved=await db().completeVisit(b.id,await digest(b.token),b.teacherId,teacher);
  if(!saved)return json({error:'Please go back and save your details again.'},403);
  return json({ok:true});
})}
