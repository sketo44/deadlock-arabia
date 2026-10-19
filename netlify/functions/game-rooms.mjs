import {publicSteamProfile} from './_shared/steam-profile.mjs';
import {db,json} from './_shared/store.mjs';
import {ready,verify,readCookie,sameOrigin} from './_shared/steam.mjs';
const roomId=s=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
export default async function handler(request){
 const op=new URL(request.url).searchParams.get('op')||'list';
 if(!ready())return json({configured:false,rooms:[],signedIn:false},request.method==='GET'?200:503);
 try{
  const user=verify(readCookie(request,'steam'),'steam');
  if(request.method==='GET'&&op==='list'){
   await db('rpc/room_action',{method:'POST',body:JSON.stringify({p_op:'expire'})});
   const rooms=await db('game_rooms?select=id,name,map_id,leader_id,status,created_at,filled_at,expires_at,closed_at&status=neq.closed&order=created_at.desc&limit=100');
   const players=rooms.length?await db('game_room_players?room_id=in.('+rooms.map(r=>r.id).join(',')+')&select=room_id,steam_id,display_name,joined_at&order=joined_at.asc&limit=1200'):[];
   return json({configured:true,signedIn:!!user,serverTime:new Date().toISOString(),rooms:rooms.map(({leader_id,...r})=>({...r,isLeader:leader_id===user?.steamId,players:players.filter(p=>p.room_id===r.id).map(p=>({name:p.display_name,isSelf:p.steam_id===user?.steamId,isLeader:p.steam_id===leader_id})),joined:players.some(p=>p.room_id===r.id&&p.steam_id===user?.steamId)}))});
  }
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(!sameOrigin(request))return json({error:'Origin rejected'},403);
  if(!user)return json({error:'وثّق Steam أولًا'},401);
  if(!['create','join','leave','close'].includes(op))return json({error:'Not found'},404);
  if(Number(request.headers.get('content-length')||0)>2048)return json({error:'الطلب أكبر من المسموح'},413);
  let body;try{const text=await request.text();if(text.length>2048)return json({error:'الطلب أكبر من المسموح'},413);body=JSON.parse(text)}catch{return json({error:'طلب غير صحيح'},400)}
  if(op==='create'&&(typeof body.name!=='string'||!body.name.trim()||body.name.length>60||body.mapId!=='cursed-apple'))return json({error:'اكتب اسم الغرفة واختر الماب'},400);
  if(op!=='create'&&!roomId(body.roomId))return json({error:'غرفة غير صحيحة'},400);
  const member=op==='create'||op==='join'?(await db('arab_members?steam_id=eq.'+user.steamId+'&select=display_name&limit=1'))[0]:null;
  let roomName=member?.display_name||'لاعب Steam';if((op==='create'||op==='join')&&(!member?.display_name||/^لاعب /.test(roomName))){try{roomName=(await publicSteamProfile(user.steamId)).display_name}catch{}}
  const result=await db('rpc/room_action',{method:'POST',body:JSON.stringify({p_op:op,p_steam_id:user.steamId,p_room_id:body.roomId||null,p_name:op==='create'?body.name:null,p_map:op==='create'?body.mapId:null,p_display_name:roomName})});
  return result?.ok?json(result):json({error:result?.error||'تعذّر إكمال الطلب'},409);
 }catch{return json({error:'تعذّر تحميل الغرف. جرّب مرة ثانية.'},503)}
}
