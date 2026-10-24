begin;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create or replace function public.discord_schedule_jobs(p_secret text) returns boolean language plpgsql security definer set search_path=public as $fn$
declare v uuid;
begin
if length(p_secret)<>64 then raise exception 'Invalid scheduler key';end if;
select id into v from vault.secrets where name='deadlock_discord_jobs';
if v is null then perform vault.create_secret(p_secret,'deadlock_discord_jobs','Custom Game internal job authentication');else perform vault.update_secret(v,p_secret);end if;
perform cron.schedule('deadlock-discord-jobs','* * * * *',$job$
select net.http_post(url:='https://ezrvthodvzywskwqlfsy.supabase.co/functions/v1/deadlock-community?fn=discord-bot&op=jobs',headers:=jsonb_build_object('Content-Type','application/json','x-discord-job-secret',(select decrypted_secret from vault.decrypted_secrets where name='deadlock_discord_jobs')),body:='{}'::jsonb,timeout_milliseconds:=5000);
$job$);
return true;end;$fn$;
revoke all on function public.discord_schedule_jobs(text) from public,anon,authenticated;
grant execute on function public.discord_schedule_jobs(text) to service_role;
commit;
