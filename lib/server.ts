import { env } from 'cloudflare:workers';
export function db(){const database=(env as any).DB as D1Database;if(!database)throw Error('Database unavailable');return database}
export function json(body:unknown,status=200,headers:Record<string,string>={}){return Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}})}
export function sameOrigin(r:Request){const o=r.headers.get('origin');return !!o&&o===new URL(r.url).origin}
export async function digest(value:string){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
export async function admin(r:Request){const token=r.headers.get('cookie')?.match(/(?:^|;\s*)wales_admin=([^;]+)/)?.[1];if(!token)return false;return !!await db().prepare('SELECT token FROM sessions WHERE token = ? AND expires > ?').bind(await digest(token),Date.now()).first()}
export function cookie(r:Request,token:string,maxAge=28800){return `wales_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${new URL(r.url).protocol==='https:'?'; Secure':''}`}
export function secret(){return (env as any).ADMIN_PASSWORD as string|undefined}
export async function safe(fn:()=>Promise<Response>){try{return await fn()}catch(e){console.error('Wales request failed',e);return json({error:'We could not connect right now. Please try again.'},503)}}
export async function seed(){await db().prepare('INSERT OR IGNORE INTO classes (id,name,subject,band,message,active) VALUES (?,?,?,?,?,1)').bind('example-pradeep','Pradeep Madushan sir','Science','junior','').run()}
