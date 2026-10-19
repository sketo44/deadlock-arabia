import {test} from 'node:test';
import assert from 'node:assert/strict';
import {heroBoard} from '../netlify/functions/_shared/community.mjs';
import handler from '../netlify/functions/arab-community.mjs';
test('Hero ranking distinguishes win rate from matches, filters membership and applies limit after sorting',async()=>{
 const keys=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','STEAM_SESSION_SECRET','PUBLIC_SITE_URL'],old=keys.map(k=>process.env[k]),originalFetch=global.fetch;
 Object.assign(process.env,{SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test',STEAM_SESSION_SECRET:'this-is-a-secret-for-tests-at-least-32-chars',PUBLIC_SITE_URL:'https://site.test'});
 const members=[{account_id:'1',display_name:'Frequent'},{account_id:'2',display_name:'Win rate'},{account_id:'3',display_name:'New player'}],stats=[{account_id:'1',hero_id:3,matches:500,wins:200},{account_id:'2',hero_id:3,matches:40,wins:30},{account_id:'3',hero_id:3,matches:5,wins:5},{account_id:'99',hero_id:3,matches:1000,wins:1000}];
 try{global.fetch=async url=>Response.json(url.includes('arab_members')?members:stats);
 assert.deepEqual((await heroBoard(3)).map(x=>x.account_id),['2','1']);
 assert.deepEqual((await heroBoard(3,{metric:'matches',limit:2})).map(x=>x.account_id),['1','2']);
 assert.deepEqual((await heroBoard(3,{metric:'matches',limit:10})).map(x=>x.account_id),['1','2','3']);
 const response=await handler(new Request('https://site.test/.netlify/functions/arab-community?op=heroes&hero=3&metric=matches&limit=10'));const data=await response.json();assert.equal(data.minimumMatches,1);assert.equal(data.scope,'registered-community');assert.equal(data.members[0].matches,500);
 for(const query of ['metric=bad','limit=0','limit=101','limit=10.5'])assert.equal((await handler(new Request('https://site.test/.netlify/functions/arab-community?op=heroes&hero=3&'+query))).status,400);
 }finally{global.fetch=originalFetch;keys.forEach((k,i)=>old[i]===undefined?delete process.env[k]:process.env[k]=old[i])}
});
