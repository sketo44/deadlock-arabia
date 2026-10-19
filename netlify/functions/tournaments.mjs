import {normalizeStreamUrl} from './_shared/streams.mjs';
import {db,json} from './_shared/store.mjs';
import {ready,verify,readCookie,sameOrigin} from './_shared/steam.mjs';
import {isAdmin} from './_shared/community.mjs';
const validId=s=>/^[a-z0-9][a-z0-9-]{0,63}$/.test(s||'');
export default async function handler(request){
 const url=new URL(request.url),op=url.searchParams.get('op')||'list';
 if(!ready())return json({configured:false,tournaments:[],registrations:[],signedIn:false},request.method==='GET'?200:503);
 const user=verify(readCookie(request,'steam'),'steam');
 try{
  if(request.method==='GET'&&op==='status')return json({configured:true,signedIn:!!user,admin:isAdmin(user)});
  if(request.method==='GET'&&op==='registrations'){if(!isAdmin(user))return json({error:'Forbidden'},403);const id=url.searchParams.get('tournamentId');if(!validId(id))return json({error:'بطولة غير صحيحة'},400);return json({configured:true,registrations:await db('tournament_registrations?tournament_id=eq.'+id+'&select=steam_id,team_name,created_at&order=created_at.asc')})}
  if(request.method==='GET'&&op==='list'){const tournaments=await db('community_tournaments?'+(isAdmin(user)?'':'status=neq.draft&')+'select=id,title,description,starts_at,status,format,max_teams,rules,stream_url&order=starts_at.asc&limit=100');const registrations=user?await db('tournament_registrations?steam_id=eq.'+user.steamId+'&select=tournament_id,team_name,created_at'):[];return json({configured:true,tournaments,registrations,signedIn:!!user,admin:isAdmin(user)})}
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(!sameOrigin(request))return json({error:'Origin rejected'},403);
  if(!user)return json({error:'سجّل دخولك بحساب Steam أولًا'},401);
  if(!['join','leave','save'].includes(op))return json({error:'Not found'},404);
  let body;try{body=await request.json()}catch{return json({error:'طلب غير صحيح'},400)}
  if(op==='save'){
   if(!isAdmin(user))return json({error:'إدارة البطولات للمشرف فقط'},403);
   const {id,title,description='',starts_at,status='draft',format='6v6',max_teams=16,rules='',stream_url=''}=body;
   let safeStream;try{safeStream=normalizeStreamUrl(stream_url)}catch(e){return json({error:e.message},400)}
   if(!validId(id)||typeof title!=='string'||!title.trim()||title.length>120||typeof description!=='string'||description.length>5000||typeof rules!=='string'||rules.length>10000||!['draft','registration','ongoing','completed','cancelled'].includes(status)||!Number.isInteger(max_teams)||max_teams<2||max_teams>256||typeof format!=='string'||format.length>50||!Number.isFinite(Date.parse(starts_at)))return json({error:'راجع بيانات البطولة'},400);
   await db('community_tournaments?on_conflict=id',{method:'POST',body:JSON.stringify({id,title:title.trim(),description,starts_at:new Date(starts_at).toISOString(),status,format,max_teams,rules,stream_url:safeStream,updated_by:user.steamId})});return json({ok:true});
  }
  if(!validId(body.tournamentId))return json({error:'بطولة غير صحيحة'},400);
  if(op==='leave'){await db('tournament_registrations?tournament_id=eq.'+body.tournamentId+'&steam_id=eq.'+user.steamId,{method:'DELETE'});return json({ok:true})}
  if(typeof body.teamName!=='string'||!body.teamName.trim()||body.teamName.length>80)return json({error:'اكتب اسم الفريق بحد أقصى 80 حرف'},400);
  // One transaction locks the tournament row, preventing capacity races. Identity is from Steam cookie only.
  const result=await db('rpc/register_tournament',{method:'POST',body:JSON.stringify({p_tournament_id:body.tournamentId,p_steam_id:user.steamId,p_team_name:body.teamName.trim()})});
  return result?.ok?json({ok:true}):json({error:result?.error||'التسجيل غير متاح'},409);
 }catch{return json({error:'تعذّر تحميل البطولات. جرّب مرة ثانية.'},503)}
}
