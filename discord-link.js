import {steamLogin} from './backend-client.js?v=discord-164';
export async function mountDiscordAccount(host){
 const token=new URL(location.href).searchParams.get('discord_link');if(!/^[a-f0-9]{48}$/.test(token||'')||!host)return;
 const card=document.createElement('section');card.className='auth card';card.setAttribute('aria-labelledby','discord-link-title');card.innerHTML='<h2 id="discord-link-title">ربط دسكورد مع Steam</h2><p data-discord-identity>نتحقق من رابط الربط…</p><p>الربط يعرّفك في درافت القيم ويسجّلك بمقعدك الصحيح. يتم مرة واحدة.</p><div data-discord-actions></div><p role="status" aria-live="polite" data-discord-status></p>';host.append(card);
 const status=card.querySelector('[data-discord-status]'),actions=card.querySelector('[data-discord-actions]');
 async function call(op,body){const response=await fetch('/.netlify/functions/discord-bot?op='+op+(body?'':'&token='+token),{...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok)throw Error(data.error||'تعذّر الربط');return data}
 try{const preview=await call('link-preview');if(!card.isConnected)return;card.querySelector('[data-discord-identity]').textContent='حساب دسكورد: '+preview.displayName;
 let signedIn=false;try{signedIn=!!JSON.parse(localStorage.getItem('dla-steam-session'))}catch{}
 const button=document.createElement('button');button.type='button';button.textContent=signedIn?'تأكيد الربط بحساب Steam المسجّل':'الدخول بحساب Steam لإكمال الربط';button.style.minHeight='44px';actions.append(button);
 button.addEventListener('click',async()=>{button.disabled=true;status.textContent='';try{if(!signedIn){await steamLogin('account');return}await call('link',{token});status.textContent='تم الربط. ارجع لرسالة القيم في دسكورد واضغط انضمام.';button.remove();const url=new URL(location.href);url.searchParams.delete('discord_link');history.replaceState(null,'',url.href);sessionStorage.removeItem('dla-discord-link')}catch(e){status.textContent=e.message;button.disabled=false}});
 }catch(e){if(card.isConnected)status.textContent=e.message}
}
