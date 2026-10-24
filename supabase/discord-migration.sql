begin;
create table if not exists public.discord_queues(id text primary key, guild_id text not null, channel_id text not null, message_id text, creator_id text not null, state jsonb not null, version integer not null default 0, draft_code text unique references public.draft_lobbies(code), result_message_id text, created_at timestamptz not null default now());
create table if not exists public.discord_accounts(discord_id text primary key,steam_id text not null unique,display_name text not null,linked_at timestamptz not null default now());
create table if not exists public.discord_link_tokens(hash text primary key,discord_id text not null,display_name text not null,expires_at timestamptz not null);
create table if not exists public.discord_interactions(id text primary key,created_at timestamptz not null default now());
create table if not exists public.discord_outbox(id text primary key,queue_id text not null references public.discord_queues(id),kind text not null check(kind in ('draft','result')),status text not null default 'pending' check(status in ('pending','sending','sent')),attempts integer not null default 0,locked_at timestamptz,created_at timestamptz not null default now(),unique(queue_id,kind));
alter table public.discord_queues enable row level security;
alter table public.discord_accounts enable row level security;
alter table public.discord_link_tokens enable row level security;
alter table public.discord_interactions enable row level security;
alter table public.discord_outbox enable row level security;
revoke all on public.discord_queues,public.discord_accounts,public.discord_link_tokens,public.discord_interactions,public.discord_outbox from anon,authenticated;
grant all on public.discord_queues,public.discord_accounts,public.discord_link_tokens,public.discord_interactions,public.discord_outbox to service_role;
create index if not exists discord_queue_draft_idx on public.discord_queues(draft_code);
create or replace function public.discord_claim_interaction(p_id text) returns boolean language plpgsql security definer set search_path=public as $$
begin delete from public.discord_interactions where created_at<now()-interval '1 day'; insert into public.discord_interactions(id) values(p_id) on conflict do nothing; return found;end;$$;
create or replace function public.discord_update_queue(p_id text,p_version integer,p_state jsonb) returns boolean language plpgsql security definer set search_path=public as $$
begin update public.discord_queues set state=p_state,version=version+1 where id=p_id and version=p_version and draft_code is null;return found;end;$$;
create or replace function public.discord_start_draft(p_id text,p_version integer,p_code text,p_state jsonb,p_queue jsonb) returns boolean language plpgsql security definer set search_path=public as $$
declare q public.discord_queues;
begin select * into q from public.discord_queues where id=p_id for update;
if not found or q.version<>p_version or q.draft_code is not null then return false;end if;
insert into public.draft_lobbies(code,owner_id,state) values(p_code,p_state->>'owner',p_state);
update public.discord_queues set draft_code=p_code,state=p_queue,version=version+1 where id=p_id;
insert into public.discord_outbox(id,queue_id,kind) values(p_id||':draft',p_id,'draft') on conflict do nothing;return true;end;$$;
create or replace function public.discord_consume_link(p_hash text,p_steam text) returns jsonb language plpgsql security definer set search_path=public as $$
declare t public.discord_link_tokens;begin
select * into t from public.discord_link_tokens where hash=p_hash and expires_at>now() for update;
if not found then raise exception 'Link expired';end if;
if exists(select 1 from public.discord_accounts where (steam_id=p_steam and discord_id<>t.discord_id) or (discord_id=t.discord_id and steam_id<>p_steam)) then raise exception 'Account already linked';end if;
insert into public.discord_accounts(discord_id,steam_id,display_name) values(t.discord_id,p_steam,t.display_name) on conflict(discord_id) do update set display_name=excluded.display_name;
delete from public.discord_link_tokens where hash=p_hash;
return jsonb_build_object('displayName',t.display_name);end;$$;
create or replace function public.discord_claim_outbox(p_id text) returns boolean language plpgsql security definer set search_path=public as $$
begin update public.discord_outbox set status='sending',attempts=attempts+1,locked_at=now() where id=p_id and attempts<5 and (status='pending' or (status='sending' and locked_at<now()-interval '3 minutes'));return found;end;$$;
revoke all on function public.discord_claim_interaction(text),public.discord_update_queue(text,integer,jsonb),public.discord_start_draft(text,integer,text,jsonb,jsonb),public.discord_consume_link(text,text),public.discord_claim_outbox(text) from public,anon,authenticated;
grant execute on function public.discord_claim_interaction(text),public.discord_update_queue(text,integer,jsonb),public.discord_start_draft(text,integer,text,jsonb,jsonb),public.discord_consume_link(text,text),public.discord_claim_outbox(text) to service_role;
commit;
