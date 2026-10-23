import test from 'node:test';
import assert from 'node:assert/strict';
import gateway from '../supabase/edge-gateway.mjs';
import {loginStart,sign} from '../netlify/functions/_shared/steam.mjs';
const endpoint='https://demo.supabase.co/functions/v1/deadlock-community';
const origin='https://sketo44.github.io';
Object.assign(process.env,{SUPABASE_URL:'https://demo.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-only',PUBLIC_SITE_URL:origin,STEAM_SESSION_SECRET:'test-only-secret-with-at-least-32-characters'});
test('Gateway accepts the site preflight and rejects foreign origins',async()=>{
 const allowed=await gateway(new Request(endpoint,{method:'OPTIONS',headers:{Origin:origin}}));
 assert.equal(allowed.status,204);assert.equal(allowed.headers.get('Access-Control-Allow-Origin'),origin);
 const rejected=await gateway(new Request(endpoint,{method:'POST',headers:{Origin:'https://other.example'}}));
 assert.equal(rejected.status,403);
});
test('Forged Steam headers and browser-supplied cookies cannot create rooms',async()=>{
 for(const headers of [{'x-steam-token':'forged'},{Cookie:'__Host-dla_steam='+sign({kind:'steam',steamId:'76561198000000001',accountId:'1',exp:Date.now()+60000})}]){
  const response=await gateway(new Request(endpoint+'?fn=game-rooms&op=create',{method:'POST',headers:{Origin:origin,...headers,'Content-Type':'application/json'},body:'{}'}));
  assert.equal(response.status,401);
 }
});
test('Login requires PKCE and exchange rejects malformed or missing browser proofs',async()=>{
 assert.equal((await gateway(new Request(endpoint+'?fn=arab-community&op=login'))).status,400);
 assert.equal((await gateway(new Request(endpoint+'?fn=arab-community&op=exchange',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({code:'invalid',verifier:'invalid'})}))).status,400);
 assert.equal((await gateway(new Request(endpoint+'?fn=arab-community&op=exchange',{method:'POST',body:'{}'}))).status,403);
});
test('Steam uses the Edge callback origin as its OpenID realm',()=>{
 process.env.STEAM_CALLBACK_URL=endpoint+'?fn=arab-community&op=callback';
 try{const started=loginStart('tournaments'),provider=new URL(started.url),callback=new URL(provider.searchParams.get('openid.return_to'));
  assert.equal(provider.searchParams.get('openid.realm'),'https://demo.supabase.co/');
  assert.equal(callback.searchParams.get('fn'),'arab-community');assert.equal(callback.searchParams.get('op'),'callback');assert.match(callback.searchParams.get('state'),/^[a-f0-9]{48}$/);
 }finally{delete process.env.STEAM_CALLBACK_URL;}
});
