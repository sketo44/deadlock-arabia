// Route existing community APIs to the free Supabase gateway.
const config=window.DEADLOCK_CONFIG||{},endpoint=config.communityApiUrl;
const originalFetch=window.fetch.bind(window);
const token=()=>{try{return JSON.parse(localStorage.getItem('dla-steam-session'))||''}catch{return ''}};
export async function steamLogin(next='community'){
 if(!endpoint)throw Error('الربط غير جاهز');
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 const base64=value=>btoa(String.fromCharCode(...value)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
 const verifier=base64(bytes),challenge=base64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
 sessionStorage.setItem('dla-steam-verifier',verifier);
 const url=new URL(endpoint);url.search=new URLSearchParams({fn:'arab-community',op:'login',next,challenge});
 location.assign(url.href);
}
if(endpoint){
 try{const previous=JSON.parse(localStorage.getItem('dla-session')||'null');if(previous?.access_token){const payload=JSON.parse(atob(previous.access_token.split('.')[1].replaceAll('-','+').replaceAll('_','/')));if(payload.iss&&!payload.iss.startsWith(config.supabaseUrl+'/')){localStorage.removeItem('dla-session');localStorage.removeItem('dla-steam-session');}}}catch{localStorage.removeItem('dla-session');}

 window.deadlockSteamLogin=steamLogin;
 window.fetch=async(input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url,location.href),match=url.pathname.match(/^\/\.netlify\/functions\/([a-z-]+)$/);
  if(url.origin!==location.origin||!match)return originalFetch(input,options);
  const target=new URL(endpoint);target.search=url.search;target.searchParams.set('fn',match[1]);
  const headers=new Headers(options.headers||(input instanceof Request?input.headers:undefined)),steam=token();
  if(steam)headers.set('x-steam-token',steam);
  const response=await originalFetch(target.href,{...options,headers,credentials:'omit'});
  if(match[1]==='arab-community'&&url.searchParams.get('op')==='logout'&&response.ok){localStorage.removeItem('dla-steam-session');localStorage.removeItem('dla-session');}
  return response;
 };
 document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a)return;const url=new URL(a.href,location.href);if(url.origin===location.origin&&url.pathname==='/.netlify/functions/arab-community'&&url.searchParams.get('op')==='login'){event.preventDefault();steamLogin(url.searchParams.get('next')||'community').catch(()=>alert('تعذّر بدء الدخول؛ جرّب مرة ثانية.'));}},true);
 const url=new URL(location.href),code=url.searchParams.get('steam_code'),error=url.searchParams.get('steam_error');
 if(code||error){
  url.searchParams.delete('steam_code');url.searchParams.delete('steam_error');history.replaceState(null,'',url.href);
  try{
   if(error)throw Error('تعذّر التحقق من Steam؛ حاول تسجيل الدخول مرة ثانية.');
   const verifier=sessionStorage.getItem('dla-steam-verifier');sessionStorage.removeItem('dla-steam-verifier');
   if(!verifier)throw Error('افتح رابط الدخول من نفس المتصفح.');
   const target=new URL(endpoint);target.search='fn=arab-community&op=exchange';
   const response=await originalFetch(target.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,verifier}),signal:AbortSignal.timeout(15000)});
   const result=await response.json();if(!response.ok)throw Error(result.error||'تعذّر الدخول');
   localStorage.setItem('dla-steam-session',JSON.stringify(result.steamToken));
   localStorage.setItem('dla-session',JSON.stringify({...result.session,expires_at:Date.now()/1000+result.session.expires_in}));
  }catch(e){sessionStorage.setItem('dla-auth-error',e.message);location.hash='account';}
 }
}
