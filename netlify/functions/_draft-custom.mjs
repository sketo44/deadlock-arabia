import {randomBytes} from 'node:crypto';
import {db} from './_shared/store.mjs';
export async function ensureCustomLobby(code,row,user){
 const state=row.state;if(state.status!=='completed')throw Error('الكوستم متاح بعد اكتمال الدرافت');
 if(!user||!(state.owner===user.steamId||state.ownerId===user.steamId||state.teams.some(t=>t.slots[0]?.id===user.steamId)))throw Error('إنشاء الكوستم للمنشئ أو كابتن أحد الفريقين');
 if(state.customLobby)return row;
 const token=randomBytes(12).toString('hex'),startedAt=Date.now(),next=structuredClone(state);next.customLobby={status:'creating',startedAt,token};
 if(!await db('rpc/update_draft',{method:'POST',body:JSON.stringify({p_code:code,p_version:row.version,p_state:next})}))return(await db('draft_lobbies?code=eq.'+code+'&select=code,state,version'))[0];
 let lobby;
 try{const response=await fetch('https://api.deadlock-api.com/v1/matches/custom/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({server_region:'europe',game_mode:'normal',cheats_enabled:false,duplicate_heroes_enabled:false,is_publicly_visible:false,min_roster_size:12}),signal:AbortSignal.timeout(45000)});
 if(!response.ok){lobby={status:'unavailable',startedAt};}else{const data=await response.json();if(typeof data.party_code!=='string'||!/^[-A-Za-z0-9]{3,32}$/.test(data.party_code))throw Error('Invalid lobby');lobby={status:'ready',code:data.party_code,createdAt:Date.now()};}
 }catch{lobby={status:'uncertain',startedAt};}
 const latest=(await db('draft_lobbies?code=eq.'+code+'&select=code,state,version'))[0];if(latest?.state.customLobby?.token!==token)return latest;
 latest.state.customLobby=lobby;if(!await db('rpc/update_draft',{method:'POST',body:JSON.stringify({p_code:code,p_version:latest.version,p_state:latest.state})}))throw Error('حدّث الصفحة لعرض كود الكوستم');latest.version++;return latest;
}
