-- Execute after supabase.sql. These records are written only by server functions.
create table if not exists public.patch_translations (
 id text primary key,
 source_url text not null,
 source_hash text not null,
 title_ar text not null,
 body_ar text not null,
 kind text not null default 'full' check (kind in ('full','summary')),
 published_at timestamptz not null,
 translated_at timestamptz not null default now(),
 locked_by_editor boolean not null default false
);
create table if not exists public.arab_members (
 steam_id text primary key check (steam_id ~ '^[0-9]{17}$'),
 account_id text not null unique check (account_id ~ '^[0-9]+$'),
 display_name text not null check (char_length(display_name) <= 80),
 avatar_url text not null default '',
 opted_in boolean not null default false,
 badge integer not null default 0 check (badge >= 0),
 matches bigint not null default 0 check (matches >= 0),
 wins bigint not null default 0 check (wins >= 0),
 top_hero_ids bigint[] not null default '{}',
 stats_updated_at timestamptz not null default now()
);
create table if not exists public.steam_nonces (
 id text primary key,
 created_at timestamptz not null default now()
);
alter table public.patch_translations enable row level security;
alter table public.arab_members enable row level security;
alter table public.steam_nonces enable row level security;
revoke all on public.patch_translations,public.arab_members,public.steam_nonces from anon,authenticated;
grant select, insert, update, delete on public.patch_translations,public.arab_members,public.steam_nonces to service_role;
-- No direct public table policies: browser clients use the server's restricted read endpoints.
create index if not exists arab_members_rank_idx on public.arab_members (badge desc,wins desc) where opted_in;
create index if not exists patch_published_idx on public.patch_translations (published_at desc);

-- Registered community only: hero statistics are fetched by the server, never submitted by browsers.
create table if not exists public.arab_hero_stats (
 account_id text references public.arab_members(account_id) on delete cascade,
 hero_id integer not null check (hero_id > 0),
 matches bigint not null check (matches >= 0),
 wins bigint not null check (wins >= 0 and wins <= matches),
 stats_updated_at timestamptz not null default now(),
 primary key (account_id,hero_id)
);
create table if not exists public.community_tournaments (
 id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
 title text not null check (char_length(title) between 1 and 120),
 description text not null default '',
 starts_at timestamptz not null,
 status text not null default 'draft' check (status in ('draft','registration','ongoing','completed','cancelled')),
 format text not null default '6v6',
 max_teams integer not null default 16 check (max_teams between 2 and 256),
 rules text not null default '',
 updated_by text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.tournament_registrations (
 tournament_id text references public.community_tournaments(id) on delete cascade,
 steam_id text references public.arab_members(steam_id) on delete cascade,
 team_name text not null check (char_length(team_name) between 1 and 80),
 created_at timestamptz not null default now(),
 primary key (tournament_id,steam_id),
 unique (tournament_id,team_name)
);
alter table public.arab_hero_stats enable row level security;
alter table public.community_tournaments enable row level security;
alter table public.tournament_registrations enable row level security;
revoke all on public.arab_hero_stats,public.community_tournaments,public.tournament_registrations from anon,authenticated;
grant all on public.arab_hero_stats,public.community_tournaments,public.tournament_registrations to service_role;
create index if not exists arab_hero_stats_hero_idx on public.arab_hero_stats(hero_id) where matches >= 30;

-- Service-role-only RPC serializes registrations; a slot belongs to a verified community team captain.
create or replace function public.register_tournament(p_tournament_id text,p_steam_id text,p_team_name text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t public.community_tournaments; current_count integer;
begin
 select * into t from public.community_tournaments where id=p_tournament_id for update;
 if not found or t.status <> 'registration' or t.starts_at <= now() then
  return jsonb_build_object('ok',false,'error','التسجيل مقفل لهذه البطولة');
 end if;
 if not exists (select 1 from public.arab_members where steam_id=p_steam_id and opted_in) then
  return jsonb_build_object('ok',false,'error','انضم للمجتمع أولًا');
 end if;
 if exists (select 1 from public.tournament_registrations where tournament_id=p_tournament_id and steam_id=p_steam_id) then
  return jsonb_build_object('ok',false,'error','أنت مسجل في البطولة');
 end if;
 select count(*) into current_count from public.tournament_registrations where tournament_id=p_tournament_id;
 if current_count >= t.max_teams then return jsonb_build_object('ok',false,'error','اكتمل عدد الفرق'); end if;
 insert into public.tournament_registrations(tournament_id,steam_id,team_name) values (p_tournament_id,p_steam_id,trim(p_team_name));
 return jsonb_build_object('ok',true);
exception when unique_violation then return jsonb_build_object('ok',false,'error','اسم الفريق مسجل من قبل');
end;
$$;
revoke all on function public.register_tournament(text,text,text) from public,anon,authenticated;
grant execute on function public.register_tournament(text,text,text) to service_role;
