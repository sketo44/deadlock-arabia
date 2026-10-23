-- Run in Supabase SQL Editor. Public read, authenticated owner-only writes.
create table if not exists public.builds (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 80),
 hero_id bigint not null check (hero_id > 0),
 item_ids bigint[] not null check (cardinality(item_ids) between 1 and 12),
 ability_order integer[] not null default '{}' check (cardinality(ability_order) <= 16 and ability_order <@ array[0,1,2,3]),
 notes text not null default '' check (char_length(notes) <= 2000),
 created_at timestamptz not null default now()
);
create index if not exists builds_created_idx on public.builds(created_at desc);
alter table public.builds enable row level security;
revoke all on public.builds from anon, authenticated;
grant select on public.builds to anon, authenticated;
grant insert, delete on public.builds to authenticated;
drop policy if exists "Read published builds" on public.builds;
create policy "Read published builds" on public.builds for select to anon,authenticated using (true);
drop policy if exists "Publish own builds" on public.builds;
create policy "Publish own builds" on public.builds for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Delete own builds" on public.builds;
create policy "Delete own builds" on public.builds for delete to authenticated using ((select auth.uid()) = user_id);
create or replace function public.validate_build() returns trigger language plpgsql set search_path=public as $$
declare n integer;
begin
 if (select count(distinct x) from unnest(new.item_ids) x) <> cardinality(new.item_ids) then raise exception 'Duplicate item'; end if;
 for n in 0..3 loop
  if (select count(*) from unnest(new.ability_order) x where x=n) > 4 then raise exception 'Invalid ability progression'; end if;
 end loop;
 if (select count(*) from public.builds where user_id=new.user_id and created_at > now()-interval '1 hour') >= 10 then raise exception 'Publishing limit: 10 builds per hour'; end if;
 return new;
end $$;
drop trigger if exists validate_build_trigger on public.builds;
create trigger validate_build_trigger before insert on public.builds for each row execute function public.validate_build();

grant select,insert,update,delete on public.builds to service_role;
