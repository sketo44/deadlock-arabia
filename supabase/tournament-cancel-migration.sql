create or replace function public.save_cup_bracket(p_id text,p_bracket jsonb,p_expected jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare t public.community_tournaments; valid_count integer;
begin
 select * into t from public.community_tournaments where id=p_id for update;
 if not found or t.bracket is distinct from p_expected then return jsonb_build_object('ok',false,'error','تغيّر الجدول. حدّث الصفحة وأعد المحاولة');end if;
 if t.status='cancelled' then return jsonb_build_object('ok',false,'error','البطولة ملغاة؛ لا يمكن تعديل المواجهات أو النتائج');end if;
 if t.bracket is null then
  if t.status not in('registration','ongoing') or (t.status='registration' and (t.registration_closes_at is null or t.registration_closes_at>now())) then return jsonb_build_object('ok',false,'error','أغلق التسجيل قبل تثبيت القرعة');end if;
  select count(*) into valid_count from public.tournament_registrations where tournament_id=p_id and review_status='approved';
  if valid_count<2 or valid_count>t.max_teams then return jsonb_build_object('ok',false,'error','يلزم اعتماد فريقين على الأقل');end if;
  if valid_count<>(select count(*) from jsonb_array_elements(p_bracket->'rounds'->0) m cross join lateral jsonb_array_elements(m->'teams') team where team<>'null'::jsonb) or exists(select 1 from jsonb_array_elements(p_bracket->'rounds'->0) m cross join lateral jsonb_array_elements(m->'teams') team where team<>'null'::jsonb and not exists(select 1 from public.tournament_registrations r where r.tournament_id=p_id and r.review_status='approved' and r.id::text=team->>'id')) then return jsonb_build_object('ok',false,'error','تغيّرت الفرق المعتمدة؛ حدّث الصفحة وأعد التوزيع');end if;
  if exists(select 1 from public.tournament_registrations where tournament_id=p_id and review_status='pending') then return jsonb_build_object('ok',false,'error','راجع كل الفرق المعلقة أولًا');end if;
 end if;
 update public.community_tournaments set bracket=p_bracket,status=case when p_bracket->'champion'<>'null'::jsonb then 'completed' else 'ongoing' end,updated_at=now() where id=p_id;return jsonb_build_object('ok',true);
end;$$;
revoke all on function public.save_cup_bracket(text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.save_cup_bracket(text,jsonb,jsonb) to service_role;
