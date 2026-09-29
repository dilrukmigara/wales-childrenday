'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Users, Heart, Camera, MailOpen, Music2 } from 'lucide-react';

export function WalesSocials(){return <aside className="wales-socials" aria-labelledby="social-heading"><span className="letter-kicker">THE LETTER ENDS. THE CONNECTION CONTINUES.</span><h2 id="social-heading">A little more Wales, every day.</h2><p>Class updates, happy moments and a little inspiration. Come say hello to your Wales family.</p><div className="social-links">{[
 {name:'Facebook',note:'Our community',url:'https://www.facebook.com/share/19bjfvvrjA/?mibextid=wwXIfr',Icon:Users},
 {name:'TikTok',note:'Little moments',url:'https://www.tiktok.com/@wales.higher.educ7?is_from_webapp=1&sender_device=pc',Icon:Music2},
 {name:'Instagram',note:'Life at Wales',url:'https://www.instagram.com/wales_higher_education/',Icon:Camera}
].map(({name,note,url,Icon})=><a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Visit Wales on ${name} (opens in a new tab)`}><Icon size={21} aria-hidden="true"/><span><strong>{name}</strong><small>{note}</small></span><ArrowUpRight size={16} aria-hidden="true"/></a>)}</div><small className="social-optional">Explore whenever you like. Your letter is already yours.</small></aside>}

export function TeacherLetter({name,teacher,band,children}:{name:string;teacher:string;band:string;children:React.ReactNode}){
 const [phase,setPhase]=useState<'sealed'|'opening'|'open'>('sealed');
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(phase!=='opening')return;const timer=setTimeout(()=>setPhase('open'),window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:850);return()=>clearTimeout(timer)},[phase]);
 useEffect(()=>{if(phase==='open')heading.current?.focus({preventScroll:true})},[phase]);
 return <div className={`teacher-letter ${band}`}>
 {phase!=='open'?<section className="letter-arrival" aria-label="A letter from your teacher"><span className="letter-kicker">SPECIAL DELIVERY · CHILDREN’S DAY</span><h2>Someone believes<br/>in your <em>beautiful future.</em></h2><p>A little message from <strong>{teacher}</strong>, just for you.</p><button className={`envelope ${phase}`} onClick={()=>setPhase('opening')} disabled={phase==='opening'} aria-label={`Open my letter from ${teacher}`}><span className="envelope-paper" aria-hidden="true">Happy Children’s Day!<Heart size={25}/></span><span className="envelope-front"/><span className="envelope-flap"/><span className="envelope-address"><small>DELIVER TO</small><strong>{name}</strong><span>With love, from {teacher}</span></span><span className="wax-seal" aria-hidden="true">W</span></button><button className="primary" onClick={()=>setPhase('opening')} disabled={phase==='opening'}><MailOpen size={19}/>{phase==='opening'?'Opening your letter…':'Open my letter'}</button><p className="letter-keepsake" role="status">{phase==='opening'?'A little encouragement is on its way…':'Made just for you. A keepsake to come back to.'}</p></section>:<section className="opened-letter"><h2 className="opened-heading" tabIndex={-1} ref={heading}><MailOpen size={20}/> A letter to keep close.</h2>{children}<WalesSocials/></section>}
 </div>
}
