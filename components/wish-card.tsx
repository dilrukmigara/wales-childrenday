'use client';
import {useEffect,useState} from 'react';
export type CardTeacher={name:string;subject:string;band:string;message:string};
type Wish={title:string;message:string};
const palettes:Record<string,{bg:string;ink:string;accent:string;soft:string;label:string}>={
 junior:{bg:'#fffbed',ink:'#173e32',accent:'#d39054',soft:'#e7edcc',label:'POSTCARDS FROM A WORLD OF WONDER'},
 senior:{bg:'#f7f0fc',ink:'#3c2660',accent:'#aa6d9d',soft:'#e9ddf2',label:'A LETTER TO YOUR BRIGHTER TOMORROW'},
 al:{bg:'#102b41',ink:'#fbecd0',accent:'#d6b773',soft:'#294a60',label:'A LETTER TO YOUR EXTRAORDINARY FUTURE'}
};
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
let logoPromise:Promise<string>|undefined;
function logoData(){if(!logoPromise)logoPromise=fetch('/wales-logo.png').then(r=>{if(!r.ok)throw Error('Logo unavailable');return r.blob()}).then(blob=>new Promise<string>((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(String(f.result));f.onerror=reject;f.readAsDataURL(blob)})).catch(e=>{logoPromise=undefined;throw e});return logoPromise}
function lines(text:string,size:number,width:number,font='Arial'){const c=document.createElement('canvas').getContext('2d')!;c.font=`${size}px ${font}`;const output:string[]=[];let current='';for(const word of text.trim().split(/\s+/)){if(c.measureText((current?current+' ':'')+word).width>width&&current){output.push(current);current=''}if(c.measureText(word).width>width){for(const char of word){if(c.measureText(current+char).width>width){output.push(current);current=''}current+=char}}else current+=(current?' ':'')+word}if(current)output.push(current);return output}
function textBlock(text:string,x:number,y:number,size:number,width:number,lineHeight:number,fill:string,font='Arial',weight='normal'){const rows=lines(text,size,width,font);return {svg:rows.map((row,i)=>`<text x="${x}" y="${y+i*lineHeight}" text-anchor="middle" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}">${escape(row)}</text>`).join(''),end:y+(rows.length-1)*lineHeight}}
function sparkle(x:number,y:number,size:number,color:string){return `<path d="M ${x} ${y-size} Q ${x+size*.2} ${y-size*.2} ${x+size} ${y} Q ${x+size*.2} ${y+size*.2} ${x} ${y+size} Q ${x-size*.2} ${y+size*.2} ${x-size} ${y} Q ${x-size*.2} ${y-size*.2} ${x} ${y-size}Z" fill="${color}"/>`}
export function createCardSvg(name:string,t:CardTeacher,w:Wish,logo:string){
 const p=palettes[t.band]||palettes.junior;
 const dear=textBlock(name,500,494,48,790,59,p.ink,'Georgia','bold');
 const message=textBlock(t.message||w.message,500,dear.end+83,29,735,46,p.ink);
 const signY=Math.max(820,message.end+113);
 const teacher=textBlock(t.name,500,signY+62,39,790,48,p.ink,'Georgia');
 const subject=textBlock(t.subject,500,teacher.end+40,22,790,32,p.ink);
 const brandY=subject.end+100,height=Math.max(1320,brandY+288);
 let geometry='';
 geometry=`<path d="M48 210V48H275M725 48h227v162M48 ${height-210}v162h227M725 ${height-48}h227v-162" fill="none" stroke="${p.accent}" stroke-width="3"/><rect x="785" y="78" width="105" height="115" rx="4" fill="none" stroke="${p.accent}" stroke-width="2" stroke-dasharray="5 5"/>${sparkle(837,122,22,p.accent)}<text x="837" y="170" text-anchor="middle" fill="${p.ink}" font-family="Georgia" font-size="16">WITH LOVE</text><path d="M85 168q45-20 90 0t90 0m-180 13q45-20 90 0t90 0" fill="none" stroke="${p.accent}" stroke-width="2"/>`;
 const titleY=253;
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="${height}" viewBox="0 0 1000 ${height}" role="img" aria-label="Happy Children’s Day, ${escape(name)}. ${escape(t.message||w.message)} With love from ${escape(t.name)}, ${escape(t.subject)}. Wales Higher Education Center."><defs><clipPath id="logo-circle-${t.band}"><circle cx="500" cy="${brandY+46}" r="49"/></clipPath></defs><rect width="1000" height="${height}" rx="12" fill="${p.bg}"/>${geometry}<rect x="24" y="24" width="952" height="${height-48}" rx="4" fill="none" stroke="${p.ink}" stroke-opacity=".2"/>
 <text x="500" y="190" text-anchor="middle" fill="${p.ink}" font-family="Arial" font-size="15" letter-spacing="2">${p.label}</text>
 <text x="500" y="${titleY+34}" text-anchor="middle" fill="${p.ink}" font-family="Georgia" font-size="83" font-style="italic">Happy</text>
 <text x="500" y="${titleY+140}" text-anchor="middle" fill="${p.ink}" font-family="Georgia" font-size="96" letter-spacing="-4">Children’s Day!</text>
 <text x="500" y="${dear.end===494?439:430}" text-anchor="middle" fill="${p.ink}" font-family="Arial" font-size="18" letter-spacing="4">DEAR</text>
 ${dear.svg}<path d="M385 ${dear.end+26}Q500 ${dear.end+42}615 ${dear.end+26}" stroke="${p.accent}" stroke-width="5" fill="none"/>
 ${message.svg}${sparkle(500,signY-53,16,p.accent)}<text x="500" y="${signY}" text-anchor="middle" font-family="Arial" font-size="20" fill="${p.ink}">With love and belief in you,</text>${teacher.svg}${subject.svg}
 <path d="M175 ${brandY-26}H825" stroke="${p.ink}" stroke-opacity=".25"/><image x="451" y="${brandY-3}" width="98" height="98" clip-path="url(#logo-circle-${t.band})" xlink:href="${logo}"/>
 <text x="500" y="${brandY+144}" text-anchor="middle" fill="${p.ink}" font-family="Georgia" font-weight="bold" font-size="35" letter-spacing="6">WALES</text><text x="500" y="${brandY+180}" text-anchor="middle" fill="${p.ink}" font-family="Arial" font-size="19" letter-spacing="2.3">HIGHER EDUCATION CENTER</text>
 <text x="500" y="${height-53}" text-anchor="middle" fill="${p.ink}" font-family="Arial" font-size="15" letter-spacing="3">01 OCTOBER 2026 · KEEP SHINING</text></svg>`;
}
export function WishCard({name,teacher,wish}:{name:string;teacher:CardTeacher;wish:Wish}){const [svg,setSvg]=useState(''),[error,setError]=useState(false);useEffect(()=>{let current=true;setError(false);logoData().then(logo=>{if(current)setSvg(createCardSvg(name,teacher,wish,logo))}).catch(()=>{if(current)setError(true)});return()=>{current=false}},[name,teacher,wish]);return <article className="creative-card" aria-label={`Children’s Day wish for ${name}`}>{svg?<div dangerouslySetInnerHTML={{__html:svg}}/>:<p role="status">{error?'The logo could not load. Please refresh to try again.':'Adding a little magic…'}</p>}</article>}
export async function downloadWishCard(name:string,t:CardTeacher,w:Wish){const svg=createCardSvg(name,t,w,await logoData());const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=Math.round(img.naturalHeight*1.5);const context=canvas.getContext('2d');if(!context)throw Error('Image export unavailable');context.drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Image export failed')),'image/png'));const fileUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=fileUrl;a.download='Wales-A-Letter-For-You.png';a.click();setTimeout(()=>URL.revokeObjectURL(fileUrl),10000)}finally{URL.revokeObjectURL(url)}}
