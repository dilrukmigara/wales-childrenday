-- Execute after setup.sql in a disposable PostgreSQL database; rolls back test rows.
begin;
set local role service_role;
do $$
declare n integer;
begin
 if not public.wales_save_visit('test-id','Student','0771234567','hash-a') then raise exception 'save failed'; end if;
 if not public.wales_save_visit('test-id','Updated','0771234567','hash-a') then raise exception 'retry failed'; end if;
 if public.wales_save_visit('test-id','Intruder','0771234567','hash-b') then raise exception 'token bypass'; end if;
 if (select name from public.wales_submissions where id='test-id') <> 'Updated' then raise exception 'ownership failed'; end if;
 for i in 1..11 loop n := public.wales_login_attempt('test-ip',1000); end loop;
 if n <> 11 then raise exception 'rate counter failed'; end if;
 if public.wales_login_attempt('test-ip',901001) <> 1 then raise exception 'rate expiry failed'; end if;
 perform public.wales_create_session('test-session','test-ip',901001);
 if exists(select 1 from public.wales_attempts where ip='test-ip') then raise exception 'attempt cleanup failed'; end if;
 if not exists(select 1 from public.wales_sessions where token='test-session' and expires=29701001) then raise exception 'session expiry failed'; end if;
 insert into public.wales_submissions(id,name,phone,edit_token) select 'bulk-'||i,'Test','0771234567','hash' from generate_series(1,505) i;
 if public.wales_submission_count() <> 506 then raise exception 'count cap'; end if;
 select count(*) into n from (select id from public.wales_submissions order by created_at desc,id desc limit 50 offset 500) page;
 if n <> 6 then raise exception 'pagination failed'; end if;
end $$;
reset role;
do $$
begin
 if has_table_privilege('anon','public.wales_submissions','SELECT') or has_table_privilege('authenticated','public.wales_submissions','SELECT') then raise exception 'public data exposed'; end if;
 if has_function_privilege('anon','public.wales_submission_count()','EXECUTE') or has_function_privilege('authenticated','public.wales_save_visit(text,text,text,text)','EXECUTE') then raise exception 'public RPC exposed'; end if;
 if exists(select 1 from pg_class where relname in ('wales_submissions','wales_sessions','wales_attempts','wales_classes') and not relrowsecurity) then raise exception 'RLS disabled'; end if;
end $$;
rollback;
