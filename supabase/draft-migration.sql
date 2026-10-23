begin;
create table if not exists public.draft_lobbies(code text primary key check(code ~ '^[A-Z0-9]{8}$'),owner_id text not null,state jsonb not null,version integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.draft_lobbies enable row level security;
revoke all on public.draft_lobbies from anon,authenticated;
grant all on public.draft_lobbies to service_role;
create index if not exists draft_owner_idx on public.draft_lobbies(owner_id,created_at desc);
create or replace function public.update_draft(p_code text,p_version integer,p_state jsonb) returns boolean language plpgsql security definer set search_path=public as $$
begin update public.draft_lobbies set state=p_state,version=version+1,updated_at=now() where code=p_code and version=p_version;return found;end;$$;
revoke all on function public.update_draft(text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.update_draft(text,integer,jsonb) to service_role;
commit;
