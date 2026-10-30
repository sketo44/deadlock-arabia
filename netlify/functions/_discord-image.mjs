import {Resvg,initWasm} from './_vendor/resvg-wasm.mjs';
import {draftHeroes} from '../../draft-heroes.js';
const SITE='https://www.deadlockar.com/';
let rendererReady;
const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
async function bytes(path){const r=await fetch(SITE+path,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Image asset unavailable');return new Uint8Array(await r.arrayBuffer())}
async function renderer(){rendererReady??=(async()=>{const[wasm,arabic,latin]=await Promise.all(['resvg-2.6.2.wasm','NotoSansArabic-Regular.ttf','NotoSans-Regular.ttf'].map(f=>bytes('assets/discord/'+f)));await initWasm(wasm);return[arabic,latin]})();try{return await rendererReady}catch(e){rendererReady=null;throw e}}
export async function discordResultPng(state){
 if(!['completed','complete'].includes(state.status))throw Error('Draft incomplete');const fonts=await renderer();
 const ids=[...new Set(state.teams.flatMap(t=>[...t.picks,...t.bans]))],pictures=new Map(await Promise.all(ids.flatMap(id=>[false,true].map(async head=>[String(id)+(head?'-head':''),Buffer.from(await bytes('assets/discord-studio/'+id+(head?'-head':'')+'.png')).toString('base64')]))));
 const marks=await Promise.all(['hidden-king','archmother'].map(async n=>Buffer.from(await bytes('assets/discord-studio/'+n+'.png')).toString('base64')));
 let out='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1800" height="1000"><defs><linearGradient id="bg"><stop stop-color="#332412"/><stop offset=".5" stop-color="#080c14"/><stop offset="1" stop-color="#10233e"/></linearGradient></defs><rect width="1800" height="1000" fill="url(#bg)"/>';
 const text=(value,x,y,size,color)=>{out+=`<text x="${x}" y="${y}" text-anchor="middle" font-family="Noto Sans Arabic,Noto Sans" font-size="${size}" fill="${color}">${xml(value)}</text>`};
 const image=(data,x,y,w,h)=>{out+=`<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${data}"/>`};
 text('DEADLOCK AR',900,38,24,'#e8d1a2');text(state.code||state.title||'نتيجة الدرافت',900,69,18,'#bec8d7');
 state.teams.forEach((team,t)=>{const x=t?1000:95,cx=x+350,color=t?'#83b6fa':'#efaa58';image(marks[t],cx-175,90,350,52);
 if(!['الملك الخفي','الأم العظمى','الأم الكبرى'].includes(team.name))text(team.name,cx,166,20,color);
 team.bans.forEach((id,i)=>{const bx=cx-team.bans.length*33+i*66;out+=`<rect x="${bx}" y="180" width="56" height="56" fill="#421b29" stroke="#c8495b"/>`;image(pictures.get(String(id)+'-head'),bx+3,183,50,50);out+=`<path d="M${bx+12} 192L${bx+44} 224M${bx+44} 192L${bx+12} 224" stroke="#ff3448" stroke-width="4"/>`});
 team.picks.forEach((id,i)=>{const px=x+(i%3)*235,py=260+Math.floor(i/3)*330;image(pictures.get(String(id)),px,py,215,310);out+=`<rect x="${px}" y="${py}" width="215" height="310" fill="none" stroke="#66778a" stroke-opacity=".5"/>`;const index=state.actions.findIndex(a=>a.team===t&&a.kind==='pick'&&String(a.hero)===String(id));out+=`<rect x="${px+8}" y="${py+8}" width="45" height="26" rx="3" fill="#07101ddd"/>`;text('#'+String(index+1).padStart(2,'0'),px+30,py+27,15,color)})});
 text('VS',900,590,34,'#f6ebdb');text('نتيجة اختيار وحظر الشخصيات',900,965,22,'#b6c3d5');out+='</svg>';
 const imageResult=new Resvg(out,{font:{fontBuffers:fonts,loadSystemFonts:false}});try{const rendered=imageResult.render();try{return rendered.asPng()}finally{rendered.free()}}finally{imageResult.free()}
}
