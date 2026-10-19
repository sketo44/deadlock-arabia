const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos);/g,m=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[m]));
export function parseSteamProfile(xml,steamId){
 const field=name=>{const x=xml.match(new RegExp('<'+name+'>([\\s\\S]*?)</'+name+'>'))?.[1]||'';return x.startsWith('<![CDATA[')&&x.endsWith(']]>')?x.slice(9,-3):decode(x)};
 if(field('steamID64')!==steamId)throw Error('Steam profile mismatch');
 const name=field('steamID').trim(),avatar=field('avatarFull');let safe='';try{const u=new URL(avatar);if(u.protocol==='https:'&&(u.hostname==='avatars.steamstatic.com'||u.hostname.endsWith('.steamstatic.com'))&&!u.username&&!u.password)safe=u.href}catch{}
 if(!name)throw Error('Steam name missing');return {display_name:name.slice(0,80),avatar_url:safe};
}
export async function publicSteamProfile(steamId){if(!/^7656119\d{10}$/.test(steamId))throw Error('Invalid Steam identity');const r=await fetch('https://steamcommunity.com/profiles/'+steamId+'/?xml=1',{signal:AbortSignal.timeout(7000)});if(!r.ok)throw Error('Steam profile unavailable');return parseSteamProfile(await r.text(),steamId)}
