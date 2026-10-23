-- Additive migration; existing tournaments and registrations are preserved.
begin;
alter table public.community_tournaments add column if not exists registration_opens_at timestamptz;
alter table public.community_tournaments add column if not exists registration_closes_at timestamptz;
alter table public.community_tournaments add column if not exists discord_url text not null default '';
alter table public.community_tournaments add column if not exists require_discord boolean not null default true;
alter table public.community_tournaments add column if not exists best_of integer not null default 1;
alter table public.community_tournaments add column if not exists final_best_of integer not null default 3;
alter table public.community_tournaments add column if not exists bracket jsonb;
alter table public.community_tournaments add column if not exists rules_version integer not null default 1;
alter table public.community_tournaments add column if not exists updated_at timestamptz not null default now();
alter table public.tournament_registrations add column if not exists id uuid not null default gen_random_uuid();
create unique index if not exists cup_registration_id on public.tournament_registrations(id);
alter table public.tournament_registrations add column if not exists team_number integer;
alter table public.tournament_registrations add column if not exists roster jsonb not null default '[]';
alter table public.tournament_registrations add column if not exists logo_data text not null default '';
alter table public.tournament_registrations add column if not exists review_status text not null default 'pending';
alter table public.tournament_registrations add column if not exists review_note text not null default '';
alter table public.tournament_registrations add column if not exists rules_version integer not null default 1;
with numbered as (select id,row_number() over(partition by tournament_id order by created_at,id) n from public.tournament_registrations)
update public.tournament_registrations r set team_number=n.n from numbered n where r.id=n.id and r.team_number is null;
create unique index if not exists cup_team_number on public.tournament_registrations(tournament_id,team_number);
create table if not exists public.tournament_moderators(steam_id text primary key check(steam_id ~ '^[0-9]{17}$'),enabled boolean not null default true,created_at timestamptz not null default now());
alter table public.tournament_moderators add column if not exists role text not null default 'moderator' check(role in('owner','moderator'));
alter table public.tournament_moderators enable row level security;
revoke all on public.tournament_moderators from public,anon,authenticated;
grant select,insert,update,delete on public.tournament_moderators to service_role;

create or replace function public.register_cup(p_tournament_id text,p_steam_id text,p_team_name text,p_roster jsonb,p_logo text,p_rules_version integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare t public.community_tournaments; occupied integer; number integer; result_id uuid; members integer;
begin
 select * into t from public.community_tournaments where id=p_tournament_id for update;
 if not found or t.status<>'registration' or t.bracket is not null or t.starts_at<=now() or t.registration_opens_at is null or t.registration_closes_at is null or now()<t.registration_opens_at or now()>=t.registration_closes_at then return jsonb_build_object('ok',false,'error','التسجيل غير مفتوح الآن');end if;
 if t.rules_version<>p_rules_version then return jsonb_build_object('ok',false,'error','تغيّرت القوانين. حدّث الصفحة واقرأها قبل التسجيل');end if;
 if not exists(select 1 from public.arab_members where steam_id=p_steam_id) then return jsonb_build_object('ok',false,'error','وثّق Steam أولًا');end if;
 if jsonb_typeof(p_roster)<>'array' or jsonb_array_length(p_roster) not between 6 and 7 then return jsonb_build_object('ok',false,'error','أدخل 6 لاعبين واحتياطًا اختياريًا');end if;
 select count(distinct lower(trim(value #>> '{}'))) into members from jsonb_array_elements(p_roster);
 if members<>jsonb_array_length(p_roster) or exists(select 1 from jsonb_array_elements_text(p_roster) x where length(trim(x)) not between 2 and 80) then return jsonb_build_object('ok',false,'error','يوزرات اللاعبين مطلوبة ومختلفة');end if;
 if exists(select 1 from public.tournament_registrations r,jsonb_array_elements_text(r.roster) x where r.tournament_id=p_tournament_id and r.review_status<>'rejected' and lower(trim(x)) in(select lower(trim(value)) from jsonb_array_elements_text(p_roster))) then return jsonb_build_object('ok',false,'error','يوجد لاعب مسجل بالفعل مع فريق آخر');end if;
 if exists(select 1 from public.tournament_registrations where tournament_id=p_tournament_id and steam_id=p_steam_id) then return jsonb_build_object('ok',false,'error','أنت مسجل بالفعل؛ ألغِ التسجيل أولًا إذا أردت تغييره');end if;
 select count(*) into occupied from public.tournament_registrations where tournament_id=p_tournament_id and review_status<>'rejected';
 if occupied>=t.max_teams then return jsonb_build_object('ok',false,'error','اكتمل عدد الفرق');end if;
 select coalesce(max(team_number),0)+1 into number from public.tournament_registrations where tournament_id=p_tournament_id;
 if length(p_logo)>280000 or length(trim(p_team_name))>80 then return jsonb_build_object('ok',false,'error','بيانات الفريق أكبر من الحد المسموح');end if;
 insert into public.tournament_registrations(tournament_id,steam_id,team_name,team_number,roster,logo_data,rules_version) values(p_tournament_id,p_steam_id,coalesce(nullif(trim(p_team_name),''),'الفريق '||number),number,p_roster,p_logo,p_rules_version) returning id into result_id;
 return jsonb_build_object('ok',true,'id',result_id,'teamNumber',number);
exception when unique_violation then return jsonb_build_object('ok',false,'error','اسم الفريق أو تسجيل الكابتن مستخدم بالفعل');
end;$$;

create or replace function public.leave_cup(p_tournament_id text,p_steam_id text) returns jsonb language plpgsql security definer set search_path=public as $$
declare t public.community_tournaments;
begin
 select * into t from public.community_tournaments where id=p_tournament_id for update;
 if not found or t.bracket is not null or t.status in('ongoing','completed') then return jsonb_build_object('ok',false,'error','بدأت المواجهات؛ تواصل مع المشرف للانسحاب');end if;
 delete from public.tournament_registrations where tournament_id=p_tournament_id and steam_id=p_steam_id;return jsonb_build_object('ok',true);
end;$$;

create or replace function public.save_cup_bracket(p_id text,p_bracket jsonb,p_expected jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare t public.community_tournaments; valid_count integer;
begin
 select * into t from public.community_tournaments where id=p_id for update;
 if not found or t.bracket is distinct from p_expected then return jsonb_build_object('ok',false,'error','تغيّر الجدول. حدّث الصفحة وأعد المحاولة');end if;
 if t.bracket is null then
  if t.status not in('registration','ongoing') or (t.status='registration' and (t.registration_closes_at is null or t.registration_closes_at>now())) then return jsonb_build_object('ok',false,'error','أغلق التسجيل قبل تثبيت القرعة');end if;
  select count(*) into valid_count from public.tournament_registrations where tournament_id=p_id and review_status='approved';
  if valid_count<2 or valid_count>t.max_teams then return jsonb_build_object('ok',false,'error','يلزم اعتماد فريقين على الأقل');end if;
  if valid_count<>(select count(*) from jsonb_array_elements(p_bracket->'rounds'->0) m cross join lateral jsonb_array_elements(m->'teams') team where team<>'null'::jsonb) or exists(select 1 from jsonb_array_elements(p_bracket->'rounds'->0) m cross join lateral jsonb_array_elements(m->'teams') team where team<>'null'::jsonb and not exists(select 1 from public.tournament_registrations r where r.tournament_id=p_id and r.review_status='approved' and r.id::text=team->>'id')) then return jsonb_build_object('ok',false,'error','تغيّرت الفرق المعتمدة؛ حدّث الصفحة وأعد التوزيع');end if;
  if exists(select 1 from public.tournament_registrations where tournament_id=p_id and review_status='pending') then return jsonb_build_object('ok',false,'error','راجع كل الفرق المعلقة أولًا');end if;
 end if;
 update public.community_tournaments set bracket=p_bracket,status=case when p_bracket->'champion'<>'null'::jsonb then 'completed' else 'ongoing' end,updated_at=now() where id=p_id;return jsonb_build_object('ok',true);
end;$$;

create or replace function public.review_cup_team(p_tournament text,p_id uuid,p_status text,p_note text) returns jsonb language plpgsql security definer set search_path=public as $$
declare t public.community_tournaments;
begin
 select * into t from public.community_tournaments where id=p_tournament for update;
 if not found or t.bracket is not null then return jsonb_build_object('ok',false,'error','تم تثبيت الجدول؛ لا يمكن تغيير الفرق');end if;
 if p_status not in('approved','rejected') then return jsonb_build_object('ok',false,'error','قرار غير صحيح');end if;
 update public.tournament_registrations set review_status=p_status,review_note=left(p_note,500) where tournament_id=p_tournament and id=p_id;
 return jsonb_build_object('ok',found);
end;$$;
revoke all on function public.register_cup(text,text,text,jsonb,text,integer),public.leave_cup(text,text),public.save_cup_bracket(text,jsonb,jsonb),public.review_cup_team(text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.register_cup(text,text,text,jsonb,text,integer),public.leave_cup(text,text),public.save_cup_bracket(text,jsonb,jsonb),public.review_cup_team(text,uuid,text,text) to service_role;
-- Retire the older registration path so it cannot bypass the new schedule and roster checks.
revoke execute on function public.register_tournament(text,text,text) from service_role;
create or replace function public.save_cup_settings(p_data jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare old public.community_tournaments; n public.community_tournaments; occupied integer; version integer;
begin
 n:=jsonb_populate_record(null::public.community_tournaments,p_data);
 select * into old from public.community_tournaments where id=n.id for update;
 select count(*) into occupied from public.tournament_registrations where tournament_id=n.id and review_status<>'rejected';
 if occupied>n.max_teams then return jsonb_build_object('ok',false,'error','عدد الفرق المحدد أقل من الفرق المسجلة');end if;
 if old.bracket is not null and (old.max_teams<>n.max_teams or old.best_of<>n.best_of or old.final_best_of<>n.final_best_of or old.rules<>n.rules or n.status not in('ongoing','completed','cancelled')) then return jsonb_build_object('ok',false,'error','لا يمكن تغيير نظام المواجهات بعد تثبيت الجدول');end if;
 if occupied>0 and old.rules<>n.rules then return jsonb_build_object('ok',false,'error','لا يمكن تغيير القوانين بعد تسجيل الفرق وموافقتها عليها');end if;
 version:=coalesce(old.rules_version,1)+case when old.rules is not null and old.rules<>n.rules then 1 else 0 end;
 insert into public.community_tournaments(id,title,description,starts_at,status,format,max_teams,rules,stream_url,registration_opens_at,registration_closes_at,discord_url,require_discord,best_of,final_best_of,updated_by,rules_version)
 values(n.id,n.title,n.description,n.starts_at,n.status,n.format,n.max_teams,n.rules,n.stream_url,n.registration_opens_at,n.registration_closes_at,n.discord_url,n.require_discord,n.best_of,n.final_best_of,n.updated_by,version)
 on conflict(id) do update set title=excluded.title,description=excluded.description,starts_at=excluded.starts_at,status=excluded.status,max_teams=excluded.max_teams,rules=excluded.rules,stream_url=excluded.stream_url,registration_opens_at=excluded.registration_opens_at,registration_closes_at=excluded.registration_closes_at,discord_url=excluded.discord_url,require_discord=excluded.require_discord,best_of=excluded.best_of,final_best_of=excluded.final_best_of,updated_by=excluded.updated_by,rules_version=excluded.rules_version,updated_at=now();
 return jsonb_build_object('ok',true);
end;$$;
revoke all on function public.save_cup_settings(jsonb) from public,anon,authenticated;
grant execute on function public.save_cup_settings(jsonb) to service_role;
commit;
