-- Run once in the Supabase SQL Editor. Safe to rerun for this schema version.
begin;
create table if not exists public.wales_classes (
 id text primary key, name text not null, subject text not null,
 band text not null check (band in ('junior','senior','al')),
 message text not null default '', active boolean not null default true
);
create table if not exists public.wales_submissions (
 id text primary key, name text not null, phone text not null,
 teacher_id text not null default '', teacher_name text not null default '', subject text not null default '',
 created_at timestamptz not null default now(), edit_token text not null,
 status text not null default 'details_saved' check (status in ('details_saved','completed'))
);
create index if not exists wales_submissions_created_id on public.wales_submissions(created_at desc,id desc);
create table if not exists public.wales_sessions (token text primary key, expires bigint not null);
create table if not exists public.wales_attempts (ip text primary key, count integer not null, reset bigint not null);

-- Data is accessed only through the Next.js server, never through a public browser key.
alter table public.wales_classes enable row level security;
alter table public.wales_submissions enable row level security;
alter table public.wales_sessions enable row level security;
alter table public.wales_attempts enable row level security;
revoke all on public.wales_classes,public.wales_submissions,public.wales_sessions,public.wales_attempts from anon,authenticated;
grant select,insert,update,delete on public.wales_classes,public.wales_submissions,public.wales_sessions,public.wales_attempts to service_role;

create or replace function public.wales_save_visit(p_id text,p_name text,p_phone text,p_token text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
 insert into public.wales_submissions(id,name,phone,edit_token) values(p_id,p_name,p_phone,p_token)
 on conflict(id) do update set name=excluded.name,phone=excluded.phone
 where public.wales_submissions.edit_token=excluded.edit_token;
 get diagnostics affected = row_count;
 return affected > 0;
end $$;

create or replace function public.wales_login_attempt(p_ip text,p_now bigint)
returns integer language plpgsql security invoker set search_path = '' as $$
declare attempts integer;
begin
 insert into public.wales_attempts(ip,count,reset) values(p_ip,1,p_now+900000)
 on conflict(ip) do update set count=case when public.wales_attempts.reset<p_now then 1 else public.wales_attempts.count+1 end,
 reset=case when public.wales_attempts.reset<p_now then p_now+900000 else public.wales_attempts.reset end
 returning count into attempts;
 return attempts;
end $$;

create or replace function public.wales_create_session(p_token text,p_ip text,p_now bigint)
returns void language plpgsql security invoker set search_path = '' as $$
begin
 insert into public.wales_sessions(token,expires) values(p_token,p_now+28800000);
 delete from public.wales_sessions where expires<p_now;
 delete from public.wales_attempts where reset<p_now or ip=p_ip;
end $$;

create or replace function public.wales_submission_count()
returns bigint language sql security invoker set search_path = '' as $$ select count(*) from public.wales_submissions $$;

revoke all on function public.wales_save_visit(text,text,text,text),public.wales_login_attempt(text,bigint),public.wales_create_session(text,text,bigint),public.wales_submission_count() from public,anon,authenticated;
grant execute on function public.wales_save_visit(text,text,text,text),public.wales_login_attempt(text,bigint),public.wales_create_session(text,text,bigint),public.wales_submission_count() to service_role;
insert into public.wales_classes(id,name,subject,band) values('example-pradeep','Pradeep Madushan sir','Science','junior') on conflict(id) do nothing;
notify pgrst, 'reload schema';
commit;
