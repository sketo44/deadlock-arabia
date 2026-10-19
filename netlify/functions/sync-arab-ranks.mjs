import {db,configured,json} from './_shared/store.mjs';
import {verify,readCookie,sameOrigin} from './_shared/steam.mjs';
import {isAdmin,saveHeroes} from './_shared/community.mjs';
import {accountStats} from './arab-community.mjs';
export default async request=>{
 if(!configured())return json({configured:false});
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(!sameOrigin(request)||!isAdmin(verify(readCookie(request,'steam'),'steam')))return json({error:'Forbidden'},403);
 let updated=0;
 try{const rows=await db('arab_members?opted_in=eq.true&select=steam_id,account_id&order=stats_updated_at.asc&limit=5');for(const row of rows){try{const {hero_stats,...stats}=await accountStats(row.account_id);await db('arab_members?steam_id=eq.'+row.steam_id,{method:'PATCH',body:JSON.stringify(stats)});await saveHeroes(hero_stats);updated++}catch{}}await db('steam_nonces?created_at=lt.'+encodeURIComponent(new Date(Date.now()-86400000).toISOString()),{method:'DELETE'});return json({updated})}catch{return json({error:'Rank refresh failed'},503)}
};
// No schedule or paid background worker. Members can refresh their own profile.
