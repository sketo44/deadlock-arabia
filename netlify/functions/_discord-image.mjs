import {Resvg,initWasm} from './_vendor/resvg-wasm.mjs';
import {draftHeroes} from '../../draft-heroes.js';
const SITE='https://sketo44.github.io/deadlock-arabia/';
let rendererReady;
const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
async function bytes(path){const r=await fetch(SITE+path,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Image asset unavailable');return new Uint8Array(await r.arrayBuffer())}
async function renderer(){rendererReady??=(async()=>{const[wasm,arabic,latin]=await Promise.all(['resvg-2.6.2.wasm','NotoSansArabic-Regular.ttf','NotoSans-Regular.ttf'].map(f=>bytes('assets/discord/'+f)));await initWasm(wasm);return[arabic,latin]})();try{return await rendererReady}catch(e){rendererReady=null;throw e}}
export async function discordResultPng(state){
 if(state.status!=='completed')throw Error('Draft incomplete');const fonts=await renderer();
 const ids=[...new Set(state.teams.flatMap(t=>[...t.picks,...t.bans]))],pictures=new Map(await Promise.all(ids.map(async id=>[id,Buffer.from(await bytes('assets/discord-heroes/'+id+'.png')).toString('base64')])));
 let out='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1800" height="1000"><defs><linearGradient id="bg"><stop stop-color="#0d1826"/><stop offset="1" stop-color="#1b2c3e"/></linearGradient></defs><rect width="1800" height="1000" fill="url(#bg)"/><rect x="24" y="24" width="1752" height="952" rx="12" fill="none" stroke="#bba374" stroke-width="2"/>';
 const text=(s,x,y,size=30,color='#f3e5cb',width=1500)=>{const n=String(s).length,font=Math.min(size,width/Math.max(1,n*.65));out+=`<text x="${x}" y="${y}" text-anchor="middle" font-family="Noto Sans Arabic,Noto Sans" font-size="${font}" font-weight="600" fill="${color}">${xml(s)}</text>`};
 text('DEADLOCK AR',1550,96,35,'#e4c78e',380);text('نتيجة الدرافت',900,94,48);text(state.title,900,151,28,'#c7d1dc',1100);out+='<path d="M60 182H1740M60 841H1740" stroke="#bba37466"/>';
 const card=(id,x,y,w,h,ban,color)=>{const hero=draftHeroes.find(h=>h.id===id);out+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2c3e50" stroke="${ban?'#ca8176':color}" stroke-width="2"/><image x="${x+2}" y="${y+2}" width="${w-4}" height="${h-4}" preserveAspectRatio="xMidYMid slice" opacity="${ban?.6:1}" xlink:href="data:image/png;base64,${pictures.get(id)}"/><rect x="${x+1}" y="${y+h-42}" width="${w-2}" height="41" fill="#101c2d"/>`;text(hero?.name||'—',x+w/2,y+h-14,18,'#f4e7ce',w-10);if(ban)out+=`<path d="M${x+8} ${y+h-52}L${x+w-8} ${y+12}" stroke="#e39182" stroke-width="3" opacity=".6"/>`};
 state.teams.forEach((team,t)=>{const x=t===0?950:80,cx=x+385,color=t===0?'#dfbd75':'#96baf3';text(team.name,cx,253,40,color,760);text('الشخصيات المختارة · 6',cx,305,24,'#d2d9df');team.picks.forEach((id,i)=>card(id,x+i*130,332,116,202,false,color));text('الشخصيات المحظورة',cx,601,25,'#e2b3a5');const total=team.bans.length*105+(team.bans.length-1)*20;team.bans.forEach((id,i)=>card(id,cx-total/2+i*125,632,105,145,true,color))});text('ضد',900,436,32,'#cdbb96',90);
 text(state.customLobby?.status==='ready'?'كود الدخول للكوستم':'نتيجة اختيار وحظر الشخصيات',900,886,26,'#dbc69c');if(state.customLobby?.status==='ready')text(state.customLobby.code,900,950,48);out+='</svg>';
 const image=new Resvg(out,{font:{fontBuffers:fonts,loadSystemFonts:false}});try{const rendered=image.render();try{return rendered.asPng()}finally{rendered.free()}}finally{image.free()}
}
