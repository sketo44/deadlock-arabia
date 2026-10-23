-- Private, short-lived browser login exchanges. No browser table access.
create table if not exists public.edge_login_flows(id text primary key,flow_token text not null,challenge text not null,next_route text not null,ip_hash text not null,created_at timestamptz not null default now(),expires_at timestamptz not null);
create table if not exists public.edge_login_codes(id text primary key,challenge text not null,payload jsonb not null,expires_at timestamptz not null);
alter table public.edge_login_flows enable row level security;
alter table public.edge_login_codes enable row level security;
revoke all on public.edge_login_flows,public.edge_login_codes from public,anon,authenticated;
grant all on public.edge_login_flows,public.edge_login_codes to service_role;
create or replace function public.edge_consume_login_code(p_hash text,p_challenge text) returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb;
begin
 delete from public.edge_login_codes where id=p_hash and challenge=p_challenge and expires_at>now() returning payload into result;
 return result;
end $$;
revoke all on function public.edge_consume_login_code(text,text) from public,anon,authenticated;
grant execute on function public.edge_consume_login_code(text,text) to service_role;
grant select,insert,update,delete on public.builds to service_role;
