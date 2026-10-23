import {test} from 'node:test';
import assert from 'node:assert/strict';
import {heroBoard} from '../netlify/functions/_shared/community.mjs';
import {accountStats} from '../netlify/functions/arab-community.mjs';
test('Every hero qualifies at 11 historical games, not 10, for both ranking metrics',async()=>{
 const original=global.fetch,keys=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'],old=keys.map(k=>process.env[k]);Object.assign(process.env,{SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test'});
 try{for(const hero of [1,7,31,60]){const urls=[];global.fetch=async url=>{urls.push(url);return Response.json(url.includes('arab_members')?[{account_id:'1',display_name:'Ten'},{account_id:'2',display_name:'Eleven',created_at:new Date().toISOString()}]:[{account_id:'1',hero_id:hero,matches:10,wins:10},{account_id:'2',hero_id:hero,matches:11,wins:7}])};for(const metric of ['win_rate','matches']){const rows=await heroBoard(hero,{metric});assert.deepEqual(rows.map(x=>x.account_id),['2']);assert.equal(rows[0].matches,11)}assert.ok(urls.some(u=>u.includes('matches=gte.11')));assert.ok(urls.every(u=>!u.includes('created_at=')&&!u.includes('joined_at=')))}}
 finally{global.fetch=original;keys.forEach((k,i)=>old[i]===undefined?delete process.env[k]:process.env[k]=old[i])}
});
test('Statistics import the game history without a website registration date cutoff',async()=>{const original=global.fetch,urls=[];try{global.fetch=async url=>{urls.push(url);return Response.json(url.includes('/rank')?{badge:1}:[{account_id:42,hero_id:1,matches_played:150,wins:90},{account_id:42,hero_id:7,matches_played:11,wins:8}])};const result=await accountStats('42');assert.equal(result.matches,161);assert.deepEqual(result.hero_stats.map(x=>x.matches),[150,11]);assert.ok(urls.every(u=>!/[?&](min|start|after|since|date)/.test(u)))}finally{global.fetch=original}});
