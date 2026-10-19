import {isSelectableHero} from '../hero-availability.js';
// Refresh game data only. Arabic prose is authored locally; no translation service is called.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {reviewedItem,labels} from '../localization.js';
import {heroCopy} from '../hero-copy.js';
const root=fileURLToPath(new URL('..',import.meta.url));
const old=JSON.parse(fs.readFileSync(path.join(root,'data/snapshot.json')));
const clean=s=>String(s||'').replace(/<svg[\s\S]*?<\/svg>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const urls=['/v1/assets/heroes','/v1/assets/items','/v2/patches'];
const results=await Promise.all(urls.map(async p=>{const r=await fetch('https://api.deadlock-api.com'+p+(p.startsWith('/v1/assets/')?'?language=english':''),{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('API returned '+r.status);const data=await r.json();if(!Array.isArray(data))throw Error('Unexpected API response');return data}));
const [rawHeroes,rawItems,feed]=results;
const available=rawHeroes.filter(isSelectableHero);
if(!available.length||!rawItems.length)throw Error('Empty API data; existing snapshot preserved');
const names=new Set(available.flatMap(h=>[1,2,3,4].map(n=>h.items['signature'+n]))),review=[];
let items=rawItems.filter(i=>(i.type==='upgrade'&&i.shopable&&i.cost>0&&i.item_tier<=4)||names.has(i.class_name)).map(i=>{
 const previous=old.items.find(o=>o.class_name===i.class_name);
 const item={id:i.id,class_name:i.class_name,name:i.name,type:i.type,cost:i.cost||0,category:i.item_slot_type,tier:i.item_tier,image:i.shop_image_webp||i.image_webp||i.image,
 description:clean(i.description?.desc||i.description?.active||i.description?.passive),details:Object.fromEntries(Object.entries(i.description||{}).map(([k,v])=>[k,{en:clean(v)}])),
 properties:Object.fromEntries(Object.entries(i.properties||{}).filter(([k,v])=>v.label).map(([k,v])=>[k,{label:v.label,value:v.value,unit:v.postfix||''}])),upgrades:i.upgrades||[],upgradeProperties:Object.fromEntries((i.upgrades||[]).flatMap(u=>(u.property_upgrades||[]).map(p=>{const v=i.properties?.[p.name]||{};return [p.name,{label:v.label||'',value:v.value,unit:v.postfix||'',displayUnit:v.display_units||''}]}))),components:i.components||[],activation:i.activation,editorialSource:previous?.editorialSource??null};
 const copy=reviewedItem(item);
 if(copy){item.arName=copy[0];item.ar=copy[1];item.editorialStatus='reviewed'}
 else{item.arName=i.name;item.ar='بيانات هذا الأيتم أو القدرة تغيّرت، وشرحها العربي يحتاج مراجعة. راجع القيم المعروضة قبل اعتماد البيلد.';item.editorialStatus='needs-review';review.push({class_name:i.class_name,name:i.name,source:item.description})}
 if(previous?.remoteImage===item.image&&previous.image?.startsWith('assets/')&&fs.existsSync(path.join(root,previous.image))){item.remoteImage=item.image;item.image=previous.image}
 return item;
});
const heroes=available.map(h=>{const previous=old.heroes.find(o=>o.id===h.id),description=clean(h.description?.playstyle),unchanged=previous?.editorialSource===description;return {id:h.id,name:h.name,class_name:h.class_name,description,role:h.hero_type,complexity:h.complexity,image:h.images.icon_hero_card_webp,background:h.images.background_image_webp,abilities:[1,2,3,4].map(n=>h.items['signature'+n]),stats:h.starting_stats,levels:h.level_info,ar:unchanged&&heroCopy[h.name]?heroCopy[h.name]:'راجع القدرات تحت عشان تعرف أسلوب الشخصية. ملخصها العربي ينتظر المراجعة.',editorialSource:previous?.editorialSource??null,editorialStatus:unchanged?'reviewed':'needs-review'}});
for(const h of heroes){const previous=old.heroes.find(o=>o.id===h.id);if(previous?.remoteImage===h.image&&previous.image.startsWith('assets/')&&fs.existsSync(path.join(root,previous.image))){h.remoteImage=h.image;h.image=previous.image}}
const patches=feed.slice(0,25).map(p=>({title:p.title,date:p.pub_date,url:p.link,source:p.source,text:clean(p.content).slice(0,20000)}));
const downloads=[...items,...heroes].filter(i=>i.image?.startsWith('https://'));fs.mkdirSync(path.join(root,'assets'),{recursive:true});
await Promise.all(Array.from({length:5},async()=>{while(downloads.length){const item=downloads.shift();try{const r=await fetch(item.image,{signal:AbortSignal.timeout(20000)});if(!r.ok)continue;const file='assets/'+item.id+'.webp';fs.writeFileSync(path.join(root,file),Buffer.from(await r.arrayBuffer()));item.remoteImage=item.image;item.image=file}catch{console.warn('Image unavailable:',item.name)}}}));
const data={timestamp:new Date().toISOString(),editorialVersion:old.editorialVersion,source:'https://api.deadlock-api.com',heroes,items,labels,patches};
fs.mkdirSync(path.join(root,'work'),{recursive:true});fs.writeFileSync(path.join(root,'work/arabic-review-queue.json'),JSON.stringify(review,null,2));
const target=path.join(root,'data/snapshot.json');fs.writeFileSync(target+'.tmp',JSON.stringify(data));fs.renameSync(target+'.tmp',target);
console.log(`Updated ${heroes.length} heroes and ${items.length} definitions. ${review.length} Arabic descriptions need review. No automatic translation used.`);
