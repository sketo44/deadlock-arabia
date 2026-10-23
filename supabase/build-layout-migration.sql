begin;
alter table public.builds add column if not exists build_document jsonb;
create or replace function public.build_groups_valid(d jsonb, h bigint, t text, n text) returns boolean language plpgsql immutable set search_path=public as $$
declare g jsonb; i jsonb; total integer:=0; seen text[]:='{}'; ids text[]; k text;
begin
 if d is null then return true;end if;
 if jsonb_typeof(d)<>'object' or octet_length(d::text)>60000 or (d->>'version') is distinct from '1' or (d->>'heroId') is distinct from h::text or (d->>'title') is distinct from t or (d->>'notes') is distinct from n or jsonb_typeof(d->'groups') is distinct from 'array' then return false;end if;
 for k in select jsonb_object_keys(d) loop if k not in('version','heroId','title','notes','groups') then return false;end if;end loop;
 if jsonb_array_length(d->'groups') not between 1 and 16 then return false;end if;
 for g in select value from jsonb_array_elements(d->'groups') loop
  if jsonb_typeof(g)<>'object' or jsonb_typeof(g->'id') is distinct from 'string' or (g->>'id') !~ '^[a-zA-Z0-9-]{1,64}$' or g->>'id'=any(seen) or jsonb_typeof(g->'name') is distinct from 'string' or char_length(trim(g->>'name')) not between 1 and 80 or jsonb_typeof(g->'description') is distinct from 'string' or char_length(g->>'description')>800 or jsonb_typeof(g->'optional') is distinct from 'boolean' or jsonb_typeof(g->'items') is distinct from 'array' then return false;end if;
  for k in select jsonb_object_keys(g) loop if k not in('id','name','description','optional','items','width','height') then return false;end if;end loop;
  if not public.build_text_allowed((g->>'name')||' '||(g->>'description')) or jsonb_array_length(g->'items')>48 then return false;end if;
  if g ? 'width' and (jsonb_typeof(g->'width')<>'number' or (g->>'width') !~ '^[0-9]+$' or (g->>'width')::integer not between 300 and 1200) then return false;end if;
  if g ? 'height' and (jsonb_typeof(g->'height')<>'number' or (g->>'height') !~ '^[0-9]+$' or (g->>'height')::integer not between 180 and 1200) then return false;end if;
  seen:=array_append(seen,g->>'id');ids:='{}';
  for i in select value from jsonb_array_elements(g->'items') loop
   if jsonb_typeof(i)<>'object' or jsonb_typeof(i->'id') is distinct from 'number' or (i->>'id') !~ '^[0-9]+$' or (i->>'id')::bigint not between 1 and 4294967295 or i->>'id'=any(ids) or jsonb_typeof(i->'note') is distinct from 'string' or char_length(i->>'note')>300 or not public.build_text_allowed(i->>'note') then return false;end if;
   for k in select jsonb_object_keys(i) loop if k not in('id','note') then return false;end if;end loop;
   ids:=array_append(ids,i->>'id');total:=total+1;
  end loop;
 end loop;
 return total between 1 and 128;
exception when others then return false;
end;$$;
alter table public.builds drop constraint if exists build_document_content;
alter table public.builds add constraint build_document_content check(public.build_groups_valid(build_document,hero_id,title,notes)) not valid;
create or replace function public.build_moderation_ready() returns boolean language sql stable set search_path=public as $$ select count(*)=2 from pg_constraint where conrelid='public.builds'::regclass and conname in('build_clean_content','build_document_content'); $$;
grant execute on function public.build_groups_valid(jsonb,bigint,text,text) to anon,authenticated;
commit;
