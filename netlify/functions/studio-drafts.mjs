import {publicSteamProfile} from './_shared/steam-profile.mjs';
import {randomBytes} from 'node:crypto';
import {db,json} from './_shared/store.mjs';
import {ready,verify,readCookie,sameOrigin} from './_shared/steam.mjs';
import {createStudio,upgradeStudio,applyStudio,expireStudio,publicStudio,accessStudio} from '../../draft-studio-core.js';
import {blockedTerms,normalizeContent} from '../../build-moderation.js';
import {notifyStudioResult} from './_studio-discord.mjs';
import {discordBackground} from './_discord-service.mjs';
const clean=n=>typeof n==='string'&&!blockedTerms.some(w=>normalizeContent(n).includes(normalizeContent(w)));
export default async function handler(request){
 const u=new URL(request.url),op=u.searchParams.get('op')||'list',user=verify(readCookie(request,'steam'),'steam');
 if(!ready())return json({error:'ربط الدرافت غير جاهز'},503);
 if(!['GET','POST'].includes(request.method))return json({error:'طلب غير مسموح'},405);
 if(request.method==='POST'&&(!user||!sameOrigin(request)))return json({error:'ادخل بحساب Steam أولًا'},user?403:401);
 try{
 let profile=user?(await db('arab_members?steam_id=eq.'+user.steamId+'&select=display_name,avatar_url&limit=1'))[0]:null;
 if(user&&(!profile?.avatar_url||!profile?.display_name||/^لاعب(?: Steam| \d+)?$/.test(profile.display_name))){try{profile=await publicSteamProfile(user.steamId);await db('arab_members?on_conflict=steam_id',{method:'POST',body:JSON.stringify({steam_id:user.steamId,account_id:user.accountId,...profile})})}catch{}}
 const actor=user?{id:user.steamId,name:profile?.display_name||'لاعب Steam',avatar:profile?.avatar_url||''}:null;
 if(op==='list'&&request.method==='GET'){const rows=user?await db('draft_lobbies?owner_id=eq.'+user.steamId+'&select=code,state,created_at&order=created_at.desc&limit=20'):[];return json({me:actor,rooms:rows.map(r=>({code:r.code,teams:r.state.teams.map(t=>({name:t.name})),config:r.state.config||{mode:'live'},status:r.state.status,created:Date.parse(r.created_at)}))})}
 let body={};if(request.method==='POST'){const text=await request.text();if(text.length>140000)return json({error:'الطلب كبير'},413);body=JSON.parse(text)}
 if(op==='create'&&request.method==='POST'){
 if(!body.config?.names?.every(clean))throw Error('استخدم أسماء مناسبة للفريقين');
 const recent=await db('draft_lobbies?owner_id=eq.'+user.steamId+'&created_at=gt.'+encodeURIComponent(new Date(Date.now()-3600000).toISOString())+'&select=code&limit=10');if(recent.length>=10)return json({error:'وصلت حد الغرف؛ حاول بعد ساعة'},429);
 const code=randomBytes(4).toString('hex').toUpperCase(),state=createStudio(actor,body.config,code,randomBytes(24).toString('base64url'));
 await db('draft_lobbies',{method:'POST',body:JSON.stringify({code,owner_id:actor.id,state})});return json({code,state:publicStudio(state,actor.id,state.key,false),version:0,me:actor,serverNow:Date.now()});
 }
 const code=String(body.code||u.searchParams.get('code')||'').toUpperCase();if(!/^[A-Z0-9]{8}$/.test(code))throw Error('رمز الغرفة 8 حروف أو أرقام');
 const row=(await db('draft_lobbies?code=eq.'+code+'&select=code,state,version'))[0];if(!row)return json({error:'الغرفة غير موجودة؛ تأكد من الرمز'},404);
 const key=body.key||u.searchParams.get('key')||'',watch=body.watch===true||u.searchParams.get('watch')==='1';let state=upgradeStudio(row.state,code,randomBytes(24).toString('base64url'));
 if(actor)for(const team of state.teams)for(const seat of team.seats)if(seat?.id===actor.id){seat.name=actor.name;seat.avatar=actor.avatar}
 const canEnter=accessStudio(state,actor?.id,key,watch);const expired=expireStudio(state);
 if(!row.state.studio||expired!==state){if(!await db('rpc/update_draft',{method:'POST',body:JSON.stringify({p_code:code,p_version:row.version,p_state:expired})}))return json({error:'تحدّثت الغرفة؛ أعد المحاولة'},409);state=expired;row.version++}
 if(request.method==='POST'){
 if(!canEnter)throw Error('رابط المشاهد للعرض فقط');if(body.version!==row.version)return json({error:'تحدّثت الغرفة؛ راجع الدور وأعد المحاولة'},409);
 if(op==='settings'&&!body.config?.names?.every(clean))throw Error('استخدم أسماء مناسبة للفريقين');
 const next=applyStudio(state,actor,op,body);
 if(!await db('rpc/update_draft',{method:'POST',body:JSON.stringify({p_code:code,p_version:row.version,p_state:next})}))return json({error:'تحدّثت الغرفة؛ أعد المحاولة'},409);state=next;row.version++;
 }else if(op!=='get')throw Error('طلب غير معروف');
 if(state.status==='complete'&&state.config.mode!=='mock')discordBackground(notifyStudioResult(code));
 return json({code,state:publicStudio(state,actor?.id,key,watch),version:row.version,me:actor,serverNow:Date.now()});
 }catch(e){return json({error:e.message==='Storage request failed'?'تعذّر حفظ الغرفة؛ حاول مجددًا':e.message},400)}
}
