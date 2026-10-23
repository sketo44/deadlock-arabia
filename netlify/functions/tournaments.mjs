import {randomInt} from 'node:crypto';
import {Buffer} from 'node:buffer';
import {normalizeStreamUrl} from './_shared/streams.mjs';
import {db,json} from './_shared/store.mjs';
import {ready,verify,readCookie,sameOrigin} from './_shared/steam.mjs';
import {isAdmin} from './_shared/community.mjs';
import {publicSteamProfile} from './_shared/steam-profile.mjs';
import {blockedTerms,normalizeContent} from '../../build-moderation.js';
import {createBracket,recordResult,arrangeBracket} from '../../tournament-core.js';
const validId=s=>/^[a-z0-9][a-z0-9-]{0,63}$/.test(s||'');
const uuid=s=>/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(s||'');
const safeText=s=>!blockedTerms.some(w=>normalizeContent(s).includes(normalizeContent(w)));
const fields='id,title,description,starts_at,status,format,max_teams,rules,stream_url,registration_opens_at,registration_closes_at,discord_url,require_discord,best_of,final_best_of,bracket,rules_version';
export async function tournamentRole(user){if(!user)return '';if(isAdmin(user))return 'owner';return (await db('tournament_moderators?steam_id=eq.'+user.steamId+'&enabled=eq.true&select=role&limit=1'))[0]?.role||''}
export function validateLogo(value=''){
 if(!value)return '';if(typeof value!=='string'||value.length>280000)throw Error('الشعار أكبر من الحد المسموح');
 const m=value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);if(!m)throw Error('استخدم صورة PNG أو JPG أو WebP');
 const bytes=Buffer.from(m[2],'base64');if(bytes.length<12||bytes.length>200000)throw Error('حجم الشعار غير مسموح');
 const valid=m[1]==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):m[1]==='jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
 if(!valid)throw Error('ملف الشعار ليس صورة صحيحة');return value;
}
export default async function handler(request){
 const url=new URL(request.url),op=url.searchParams.get('op')||'list';
 if(!ready())return json({configured:false,tournaments:[],registrations:[],signedIn:false},request.method==='GET'?200:503);
 const user=verify(readCookie(request,'steam'),'steam');
 if(request.method==='POST'&&!sameOrigin(request))return json({error:'Origin rejected'},403);
 if(request.method==='POST'&&!user)return json({error:'وثّق حساب Steam أولًا'},401);
 try{
  const role=await tournamentRole(user),admin=!!role;
  if(request.method==='GET'&&op==='status')return json({configured:true,signedIn:!!user,admin,owner:role==='owner'});
  if(request.method==='GET'&&op==='moderators'){if(role!=='owner')return json({error:'للمالك فقط'},403);return json({moderators:await db('tournament_moderators?select=steam_id,role,enabled&order=created_at.asc')})}
  if(request.method==='GET'&&op==='list')return json({configured:true,signedIn:!!user,admin,owner:role==='owner',tournaments:await db('community_tournaments?'+(admin?'':'status=neq.draft&')+'select='+fields+'&order=starts_at.asc&limit=100')});
  if(request.method==='GET'&&['details','registrations'].includes(op)){
   const id=url.searchParams.get('tournamentId');if(!validId(id))return json({error:'بطولة غير صحيحة'},400);
   if(op==='registrations'&&!admin)return json({error:'للمشرف فقط'},403);
   const t=(await db('community_tournaments?id=eq.'+id+'&select='+fields))[0];if(!t||(!admin&&t.status==='draft'))return json({error:'البطولة غير متاحة'},404);
   const teams=await db('tournament_registrations?tournament_id=eq.'+id+(admin?'':'&review_status=eq.approved')+'&select='+(admin?'id,steam_id,team_name,team_number,roster,logo_data,review_status,review_note,created_at,rules_version':'id,team_name,team_number,logo_data')+'&order=team_number.asc');
   const mine=user?(await db('tournament_registrations?tournament_id=eq.'+id+'&steam_id=eq.'+user.steamId+'&select=id,team_name,team_number,roster,logo_data,review_status,review_note,rules_version'))[0]||null:null;
   const visibleTeams=admin?teams:teams.map(({id,team_name,team_number,logo_data})=>({id,team_name,team_number,logo_data}));
   return json({configured:true,admin,owner:role==='owner',signedIn:!!user,tournament:t,teams:visibleTeams,mine});
  }
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(!sameOrigin(request))return json({error:'Origin rejected'},403);
  if(!user)return json({error:'وثّق حساب Steam أولًا'},401);
  const raw=await request.text();if(raw.length>320000)return json({error:'الطلب أكبر من الحد المسموح'},413);
  let body;try{body=JSON.parse(raw)}catch{return json({error:'طلب غير صحيح'},400)}
  if(op==='moderator'){
   if(role!=='owner')return json({error:'تعيين المشرفين للمالك فقط'},403);
   if(!/^[0-9]{17}$/.test(body.steamId||'')||typeof body.enabled!=='boolean'||body.steamId===user.steamId)return json({error:'أدخل SteamID64 صحيحًا لمشرف آخر'},400);
   const existing=(await db('tournament_moderators?steam_id=eq.'+body.steamId+'&select=role'))[0];if(existing?.role==='owner')return json({error:'لا يمكن تعديل المالك من هذه اللوحة'},403);
   const member=(await db('arab_members?steam_id=eq.'+body.steamId+'&select=steam_id'))[0];if(!member)return json({error:'يلزم أن يوثّق الحساب بالموقع أولًا'},400);
   await db('tournament_moderators?on_conflict=steam_id',{method:'POST',body:JSON.stringify({steam_id:body.steamId,enabled:body.enabled,role:'moderator'})});return json({ok:true});
  }
  if(['save','review','generate','arrange','result','close'].includes(op)&&!admin)return json({error:'إدارة البطولة للمشرف فقط'},403);
  if(op==='save'){
   const {id,title,description='',starts_at,status='draft',max_teams=16,rules='',stream_url='',registration_opens_at,registration_closes_at,discord_url='',require_discord=true,best_of=1,final_best_of=3}=body;
   let stream,discord='';try{stream=normalizeStreamUrl(stream_url);if(discord_url){const d=new URL(discord_url);if(d.protocol!=='https:'||!['discord.gg','discord.com'].includes(d.hostname)||d.username||d.password)throw Error();discord=d.href}}catch{return json({error:'راجع رابط البث أو دسكورد'},400)}
   const open=Date.parse(registration_opens_at),close=Date.parse(registration_closes_at),start=Date.parse(starts_at);
   if(!validId(id)||typeof title!=='string'||!title.trim()||title.length>120||!safeText(title)||typeof description!=='string'||description.length>5000||typeof rules!=='string'||rules.length<20||rules.length>15000||!['draft','registration','ongoing','completed','cancelled'].includes(status)||!Number.isInteger(max_teams)||max_teams<2||max_teams>256||![1,3,5].includes(best_of)||![1,3,5,7].includes(final_best_of)||typeof require_discord!=='boolean'||![open,close,start].every(Number.isFinite)||open>=close||close>start)return json({error:'راجع الاسم والقوانين والمواعيد وعدد الفرق. الإغلاق بعد الفتح وقبل بداية البطولة.'},400);
   const result=await db('rpc/save_cup_settings',{method:'POST',body:JSON.stringify({p_data:{id,title:title.trim(),description,starts_at:new Date(start).toISOString(),status,format:'6v6',max_teams,rules,stream_url:stream,registration_opens_at:new Date(open).toISOString(),registration_closes_at:new Date(close).toISOString(),discord_url:discord,require_discord,best_of,final_best_of,updated_by:user.steamId}})});return result?.ok?json(result):json({error:result?.error||'تعذّر الحفظ'},409);
  }
  if(!validId(body.tournamentId))return json({error:'بطولة غير صحيحة'},400);
  if(op==='close'){await db('community_tournaments?id=eq.'+body.tournamentId+'&bracket=is.null&status=eq.registration',{method:'PATCH',body:JSON.stringify({status:'ongoing',updated_by:user.steamId,updated_at:new Date().toISOString()})});return json({ok:true})}
  if(op==='join'){
   const teamName=String(body.teamName||'').trim(),roster=body.roster;
   if(teamName.length>80||!safeText(teamName)||!Array.isArray(roster)||roster.length<6||roster.length>7||roster.some(x=>typeof x!=='string'||x.trim().length<2||x.length>80||!safeText(x))||new Set(roster.map(x=>x.trim().toLowerCase())).size!==roster.length||body.acceptRules!==true||body.discordConfirmed!==true||!Number.isInteger(body.rulesVersion))return json({error:'راجع اسم الفريق و6 يوزرات مختلفة، ووافق على القوانين وشرط دسكورد.'},400);
   let logo;try{logo=validateLogo(body.logoData)}catch(e){return json({error:e.message},400)}
   const existing=(await db('arab_members?steam_id=eq.'+user.steamId+'&select=steam_id'))[0];
   if(!existing){let name={display_name:'لاعب Steam',avatar_url:''};try{name=await publicSteamProfile(user.steamId)}catch{}await db('arab_members?on_conflict=steam_id',{method:'POST',headers:{Prefer:'return=representation,resolution=ignore-duplicates'},body:JSON.stringify({steam_id:user.steamId,account_id:user.accountId,opted_in:false,...name})})}
   const result=await db('rpc/register_cup',{method:'POST',body:JSON.stringify({p_tournament_id:body.tournamentId,p_steam_id:user.steamId,p_team_name:teamName,p_roster:roster.map(x=>x.trim()),p_logo:logo,p_rules_version:body.rulesVersion})});return result?.ok?json(result):json({error:result?.error||'التسجيل غير متاح'},409);
  }
  if(op==='leave'){const result=await db('rpc/leave_cup',{method:'POST',body:JSON.stringify({p_tournament_id:body.tournamentId,p_steam_id:user.steamId})});return result?.ok?json(result):json({error:result?.error||'تعذّر الانسحاب'},409)}
  if(op==='review'){
   if(!uuid(body.id)||!['approved','rejected'].includes(body.status)||typeof(body.note||'')!=='string'||(body.note||'').length>500)return json({error:'قرار غير صحيح'},400);
   const result=await db('rpc/review_cup_team',{method:'POST',body:JSON.stringify({p_tournament:body.tournamentId,p_id:body.id,p_status:body.status,p_note:body.note||''})});return result?.ok?json(result):json({error:result?.error||'تعذرت المراجعة'},409);
  }
  if(['generate','arrange','result'].includes(op)){
   const t=(await db('community_tournaments?id=eq.'+body.tournamentId+'&select='+fields))[0];if(!t)return json({error:'البطولة غير موجودة'},404);let bracket;
   try{if(op==='generate'||op==='arrange'){
    if(t.bracket)return json({error:'القرعة مثبتة بالفعل'},409);
    const teams=await db('tournament_registrations?tournament_id=eq.'+t.id+'&review_status=eq.approved&select=id,team_name,team_number&order=team_number.asc');bracket=op==='arrange'?arrangeBracket(teams,body.slots,t.max_teams):createBracket(teams,t.max_teams,()=>randomInt(0,4294967296)/4294967296);
   }else{if(!t.bracket||t.status!=='ongoing')throw Error('البطولة ليست جارية');bracket=recordResult(t.bracket,body.matchId,body.scoreA,body.scoreB,t.best_of,t.final_best_of)}}catch(e){return json({error:e.message},400)}
   const result=await db('rpc/save_cup_bracket',{method:'POST',body:JSON.stringify({p_id:t.id,p_bracket:bracket,p_expected:t.bracket||null})});return result?.ok?json({ok:true,bracket}):json({error:result?.error||'تغيّر الجدول. حدّث الصفحة'},409);
  }
  return json({error:'Not found'},404);
 }catch{return json({error:'تعذّر إكمال طلب البطولة. جرّب مرة ثانية.'},503)}
}
