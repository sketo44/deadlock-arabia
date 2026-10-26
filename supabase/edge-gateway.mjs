import studio from '../netlify/functions/studio-drafts.mjs';
import discord from '../netlify/functions/discord-bot.mjs';
import drafts from '../netlify/functions/draft-rooms.mjs';
import community from '../netlify/functions/arab-community.mjs';
import rooms from '../netlify/functions/game-rooms.mjs';
import tournaments from '../netlify/functions/tournaments.mjs';
import patches from '../netlify/functions/patch-translations.mjs';
import {db,json} from '../netlify/functions/_shared/store.mjs';
import {loginStart,verify,cookieName} from '../netlify/functions/_shared/steam.mjs';
import {randomBytes,createHash} from 'node:crypto';
const hash=v=>createHash('sha256').update(v).digest('hex');
const SITE='https://sketo44.github.io/deadlock-arabia/';
const ORIGIN=new URL(SITE).origin;
const routes={'arab-community':community,'game-rooms':rooms,tournaments,'draft-rooms':drafts,'patch-translations':patches,'discord-bot':discord,'studio-drafts':studio};
const challengeHash=v=>createHash('sha256').update(v).digest('base64url');
function redirect(route,params){const url=new URL(SITE);if(route==='draft')url.pathname=new URL('draft/',SITE).pathname;else url.hash=route;for(const[k,v]of Object.entries(params))url.searchParams.set(k,v);return new Response(null,{status:302,headers:{Location:url.href,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}})}
async function auth(path,body){const r=await fetch(process.env.SUPABASE_URL+'/auth/v1/'+path,{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Account exchange failed');return r.json()}
async function start(request,url){
 const challenge=url.searchParams.get('challenge')||'',next=url.searchParams.get('next')||'community';
 if(!/^[A-Za-z0-9_-]{43}$/.test(challenge)||!['community','tournaments','account','planner','draft'].includes(next))return json({error:'ابدأ الدخول من الموقع'},400);
 const ip=hash(request.headers.get('x-forwarded-for')?.split(',')[0]||request.headers.get('cf-connecting-ip')||'unknown');
 await db('edge_login_flows?expires_at=lt.'+encodeURIComponent(new Date().toISOString()),{method:'DELETE'});
 await db('edge_login_codes?expires_at=lt.'+encodeURIComponent(new Date().toISOString()),{method:'DELETE'});
 const recent=await db('edge_login_flows?ip_hash=eq.'+ip+'&created_at=gt.'+encodeURIComponent(new Date(Date.now()-60000).toISOString())+'&select=id&limit=10');
 if(recent.length>=10)return json({error:'انتظر دقيقة ثم حاول مجددًا'},429);
 const flow=loginStart(next),state=new URL(new URL(flow.url).searchParams.get('openid.return_to')).searchParams.get('state');
 await db('edge_login_flows',{method:'POST',body:JSON.stringify({id:state,flow_token:flow.token,challenge,next_route:next,ip_hash:ip,expires_at:new Date(Date.now()+600000).toISOString()})});
 return new Response(null,{status:302,headers:{Location:flow.url,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
}
async function callback(request,url){
 const state=url.searchParams.get('state')||'';
 if(!/^[a-f0-9]{48}$/.test(state))return redirect('account',{steam_error:'expired'});
 const flow=(await db('edge_login_flows?id=eq.'+state+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())))[0];
 if(!flow)return redirect('account',{steam_error:'expired'});
 const headers=new Headers(request.headers);headers.set('cookie',cookieName('flow')+'='+encodeURIComponent(flow.flow_token));
 const response=await community(new Request(request.url,{headers}));
 const raw=response.headers.getSetCookie().find(v=>v.startsWith(cookieName('steam')+'='));
 if(!raw||response.status!==302)return redirect('account',{steam_error:'verification'});
 const steam=decodeURIComponent(raw.slice(raw.indexOf('=')+1).split(';')[0]),user=verify(steam,'steam');
 if(!user)return redirect('account',{steam_error:'verification'});
 await db('edge_login_flows?id=eq.'+state,{method:'DELETE'});
 // Verified Steam users get a build account without sending an email.
 const email='steam-'+user.steamId+'@users.deadlockar.invalid';
 const link=await auth('admin/generate_link',{type:'magiclink',email});
 const session=await auth('verify',{type:link.verification_type||'magiclink',token_hash:link.hashed_token||link.properties?.hashed_token});
 if(!session.access_token||session.user?.email!==email)throw Error('Account identity mismatch');
 const code=randomBytes(32).toString('base64url');
 await db('edge_login_codes',{method:'POST',body:JSON.stringify({id:hash(code),challenge:flow.challenge,payload:{steamToken:steam,session},expires_at:new Date(Date.now()+120000).toISOString()})});
 return redirect(flow.next_route,{steam_code:code});
}
async function exchange(request){
 if(request.method!=='POST'||request.headers.get('origin')!==ORIGIN)return json({error:'Origin rejected'},403);
 const body=await request.json();
 if(!/^[A-Za-z0-9_-]{43}$/.test(body.code||'')||!/^[A-Za-z0-9_-]{43,128}$/.test(body.verifier||''))return json({error:'Invalid exchange'},400);
 const result=await db('rpc/edge_consume_login_code',{method:'POST',body:JSON.stringify({p_hash:hash(body.code),p_challenge:challengeHash(body.verifier)})});
 return result?json(result):json({error:'انتهى رابط الدخول؛ حاول مرة ثانية'},401);
}
export default async function gateway(request){
 const url=new URL(request.url),origin=request.headers.get('origin');
 const cors={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization, content-type, apikey, x-steam-token','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
 if(origin&&origin!==ORIGIN)return json({error:'Origin rejected'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 let response;
 try{
  const fn=url.searchParams.get('fn')||'arab-community',op=url.searchParams.get('op')||'list';
  if(fn==='arab-community'&&op==='login')response=await start(request,url);
  else if(fn==='arab-community'&&op==='callback')response=await callback(request,url);
  else if(fn==='arab-community'&&op==='exchange')response=await exchange(request);
  else{
   const handler=routes[fn];if(!handler)return json({error:'Not found'},404);
   const headers=new Headers(request.headers);headers.delete('cookie');
   const token=headers.get('x-steam-token');
   if(token&&verify(token,'steam'))headers.set('cookie',cookieName('steam')+'='+encodeURIComponent(token));
   response=await handler(new Request(request,{headers}));
  }
 }catch{response=json({error:'تعذّر إكمال الطلب. جرّب مرة ثانية.'},503)}
 const h=new Headers(response.headers);for(const[k,v]of Object.entries(cors))h.set(k,v);h.delete('set-cookie');
 return new Response(response.body,{status:response.status,headers:h});
}

