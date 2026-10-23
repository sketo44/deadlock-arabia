-- Private 6v6 community rooms. All mutations run through the verified server.
create table if not exists public.game_rooms(id uuid primary key default gen_random_uuid(),name text not null check(char_length(name) between 1 and 60),map_id text not null check(map_id in ('cursed-apple')),leader_id text not null check(leader_id ~ '^[0-9]{17}$'),status text not null default 'open' check(status in ('open','full','closed')),created_at timestamptz not null default now(),filled_at timestamptz,expires_at timestamptz,closed_at timestamptz);
create table if not exists public.game_room_players(room_id uuid references public.game_rooms(id) on delete cascade,steam_id text not null check(steam_id ~ '^[0-9]{17}$'),display_name text not null check(char_length(display_name) between 1 and 80),joined_at timestamptz not null default now(),primary key(room_id,steam_id));
alter table public.game_rooms enable row level security;
alter table public.game_room_players enable row level security;
revoke all on public.game_rooms,public.game_room_players from public,anon,authenticated;
grant select,insert,update,delete on public.game_rooms,public.game_room_players to service_role;
create index if not exists game_rooms_active_idx on public.game_rooms(status,created_at desc);
create index if not exists game_room_players_steam_idx on public.game_room_players(steam_id);
alter table public.game_rooms add column if not exists visibility text not null default 'public' check(visibility in ('public','private'));
alter table public.game_rooms add column if not exists access_code text;
drop function if exists public.room_action(text,text,uuid,text,text,text);
create or replace function public.room_action(p_op text,p_steam_id text default null,p_room_id uuid default null,p_name text default null,p_map text default null,p_display_name text default null,p_visibility text default null,p_access_code text default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.game_rooms; n integer; new_id uuid;
begin
 -- Expiry is enforced before every read/write, including requests from stale browser tabs.
 update public.game_rooms set status='closed',closed_at=expires_at where status='full' and expires_at<=now();
 if p_op='expire' then return jsonb_build_object('ok',true); end if;
 if p_steam_id is null or p_steam_id !~ '^[0-9]{17}$' then return jsonb_build_object('ok',false,'error','سجّل بحساب Steam أولًا'); end if;
 perform pg_advisory_xact_lock(hashtextextended(p_steam_id,0));
 if p_op='create' then
  if p_name is null or char_length(trim(p_name)) not between 1 and 60 or p_map is distinct from 'cursed-apple' then return jsonb_build_object('ok',false,'error','راجع اسم الغرفة والماب'); end if;
  if exists(select 1 from public.game_room_players gp join public.game_rooms gr on gr.id=gp.room_id where gp.steam_id=p_steam_id and gr.status in ('open','full')) then return jsonb_build_object('ok',false,'error','عندك غرفة نشطة بالفعل. اطلع منها أو أنهِها أولًا'); end if;
  if (select count(*) from public.game_rooms where leader_id=p_steam_id and created_at>now()-interval '1 hour')>=3 then return jsonb_build_object('ok',false,'error','وصلت حد إنشاء الغرف. جرّب بعد ساعة'); end if;
  if coalesce(p_visibility,'public') not in ('public','private') or (p_visibility='private' and (p_access_code is null or p_access_code !~ '^[A-F0-9]{24}$')) then return jsonb_build_object('ok',false,'error','إعداد الخصوصية غير صحيح'); end if;
  insert into public.game_rooms(name,map_id,leader_id,visibility,access_code) values(trim(p_name),p_map,p_steam_id,coalesce(p_visibility,'public'),case when p_visibility='private' then p_access_code else null end) returning id into new_id;
  insert into public.game_room_players(room_id,steam_id,display_name) values(new_id,p_steam_id,left(coalesce(nullif(trim(p_display_name),''),'لاعب Steam'),80));
  return jsonb_build_object('ok',true,'roomId',new_id);
 end if;
 select * into r from public.game_rooms where id=p_room_id for update;
 if not found then return jsonb_build_object('ok',false,'error','الغرفة غير موجودة'); end if;
 if r.status='closed' then return jsonb_build_object('ok',false,'error','انتهت الغرفة'); end if;
 if p_op='close' then
  if r.leader_id<>p_steam_id then return jsonb_build_object('ok',false,'error','الليدر فقط يقدر ينهي الغرفة'); end if;
  update public.game_rooms set status='closed',closed_at=now() where id=r.id;
 elsif p_op='leave' then
  if r.leader_id=p_steam_id then return jsonb_build_object('ok',false,'error','أنت الليدر؛ أنهِ الغرفة بدل الخروج'); end if;
  delete from public.game_room_players where room_id=r.id and steam_id=p_steam_id;
  -- A full room stays locked even when a participant leaves.
 elsif p_op='join' then
  if r.visibility='private' and (p_access_code is null or r.access_code is null or upper(trim(p_access_code))<>r.access_code) then return jsonb_build_object('ok',false,'error','كود الغرفة غير صحيح'); end if;
  if r.status<>'open' then return jsonb_build_object('ok',false,'error','اكتملت الغرفة وتقفل الانضمام'); end if;
  if exists(select 1 from public.game_room_players gp join public.game_rooms gr on gr.id=gp.room_id where gp.steam_id=p_steam_id and gr.status in ('open','full')) then return jsonb_build_object('ok',false,'error','أنت داخل غرفة بالفعل'); end if;
  select count(*) into n from public.game_room_players where room_id=r.id;
  if n>=12 then return jsonb_build_object('ok',false,'error','الغرفة مكتملة'); end if;
  insert into public.game_room_players(room_id,steam_id,display_name) values(r.id,p_steam_id,left(coalesce(nullif(trim(p_display_name),''),'لاعب Steam'),80));
  if n+1=12 then update public.game_rooms set status='full',filled_at=now(),expires_at=now()+interval '90 minutes' where id=r.id; end if;
 else return jsonb_build_object('ok',false,'error','طلب غير صحيح'); end if;
 return jsonb_build_object('ok',true,'roomId',r.id);
end $$;
revoke all on function public.room_action(text,text,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.room_action(text,text,uuid,text,text,text,text,text) to service_role;
alter table public.community_tournaments add column if not exists stream_url text not null default '';
