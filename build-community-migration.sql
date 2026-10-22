-- Apply once to enable protected community publication for the new planner.
-- Existing rows remain untouched; all new inserts/updates must pass these checks.
alter table public.builds add column if not exists planner_state text not null default '';
create or replace function public.build_text_allowed(content text) returns boolean language sql immutable set search_path=public as $$
 select regexp_replace(translate(regexp_replace(lower(normalize(coalesce(content,''),NFKC)), '[ً-ٰٟـ​-‏‪-‮⁠-⁯]', '', 'g'),'أإآٱى','ااااي'),'[^a-z0-9ء-ي]','','g') !~ '(كسمك|كسامك|كسام|كسختك|شرموط|قحبه|قحبة|منيوك|زبي|زبك|طيزك|fuck|shit|bitch|cunt)';
$$;
alter table public.builds drop constraint if exists build_clean_content;
alter table public.builds add constraint build_clean_content check(char_length(trim(title)) between 3 and 80 and char_length(trim(notes)) between 5 and 2000 and public.build_text_allowed(title||' '||notes) and char_length(planner_state)<=4000) not valid;
create or replace function public.build_moderation_ready() returns boolean language sql stable set search_path=public as $$ select exists(select 1 from pg_constraint where conrelid='public.builds'::regclass and conname='build_clean_content'); $$;
grant execute on function public.build_moderation_ready() to anon,authenticated;
grant execute on function public.build_text_allowed(text) to anon,authenticated;
create index if not exists builds_by_hero_date on public.builds(hero_id,created_at desc);
