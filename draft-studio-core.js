import {draftHeroes as heroes} from './draft-heroes.js';
import {abilityRules} from './draft-ability-rules.js';
function sequence(c){if(c.mode==='ability')return Array.from({length:c.size*2},(_,i)=>({kind:'pick',team:i%2}));if(c.preset==='custom')return c.custom.map(x=>({...x}));if(c.preset==='competitive3'&&c.size===6)return [['ban',0],['ban',1],['ban',0],['ban',1],['pick',0],['pick',1],['pick',1],['pick',0],['pick',1],['pick',0],['ban',1],['ban',0],['pick',1],['pick',0],['pick',0],['pick',1],['pick',0],['pick',1]].map(([kind,team])=>({kind,team}));if(c.preset==='tournament'&&c.size===6)return [['ban',0],['ban',1],['pick',0],['pick',1],['pick',1],['pick',0],['ban',1],['ban',0],['pick',1],['pick',0],['pick',0],['pick',1],['ban',0],['ban',1],['pick',0],['pick',1],['pick',1],['pick',0]].map(([kind,team])=>({kind,team}));const out=[];if(c.preset!=='quick')out.push({kind:'ban',team:0},{kind:'ban',team:1},{kind:'ban',team:0},{kind:'ban',team:1});for(let i=0;i<c.size*2;i++)out.push({kind:'pick',team:i%2});return out}
export {sequence};
const fail=m=>{throw Error(m)}, ids=new Map(heroes.map(h=>[String(h.id),h.id]));
export function normalizeConfig(c={}){
 const out={mode:c.mode,screen:c.screen,size:c.size,names:c.names,logos:c.logos||['',''],preset:c.preset,seconds:c.seconds,reserve:c.reserve,private:c.private===true,spectators:c.spectators!==false,mirror:c.mirror===true,custom:c.custom||[]};
 if(!['live','mock','ability'].includes(out.mode)||!['cinematic','competitive'].includes(out.screen)||!Number.isInteger(out.size)||out.size<2||out.size>6)fail('راجع إعدادات المواجهة');
 if(!Array.isArray(out.names)||out.names.length!==2||out.names.some(n=>typeof n!=='string'||!n.trim()||n.length>50))fail('اكتب اسمًا مناسبًا للفريقين');out.names=out.names.map(n=>n.trim());
 if(!Array.isArray(out.logos)||out.logos.length!==2||out.logos.some(s=>typeof s!=='string'||s.length>60000||(s&&!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(s))))fail('شعار غير صحيح');
 if(!['competitive3','competitive2','tournament','quick','custom'].includes(out.preset)||![0,30,45,60,90].includes(out.seconds)||![0,60,90,120,180,240].includes(out.reserve))fail('راجع ترتيب الدرافت والتوقيت');
 if(!Array.isArray(out.custom)||out.custom.length>44||out.custom.some(x=>!['ban','pick'].includes(x.kind)||![0,1].includes(x.team)))fail('ترتيب غير صحيح');out.custom=out.custom.map(({team,kind})=>({team,kind}));
 if(out.mode==='ability'){out.mirror=false;out.preset='quick'}
 const order=sequence(out);if(order.length>44||[0,1].some(t=>order.filter(x=>x.kind==='pick'&&x.team===t).length!==out.size))fail('عدد الاختيارات لا يطابق حجم الفريق');return out;
}
export function createStudio(actor,c,code,key,now=Date.now()){
 const config=normalizeConfig(c),s={studio:1,code,key,owner:actor.id,config,teams:config.names.map((name,t)=>({name,logo:config.logos[t],seats:Array(config.size).fill(null),picks:[],bans:[],ready:false})),status:'lobby',order:sequence(config),step:0,actions:[],banks:[config.reserve*1000,config.reserve*1000],started:0,created:now,updated:now,activity:['تم إنشاء اللوبي.']};s.teams[0].seats[0]=actor;return s;
}
export function upgradeStudio(old,code,key){
 if(old.studio)return old;
 const settings=old.settings||{},s=createStudio({id:old.owner,name:'الكابتن'},{mode:settings.solo?'mock':'live',screen:'cinematic',size:6,names:old.teams.map(t=>t.name),logos:['',''],preset:settings.bans===2?'competitive2':'competitive3',seconds:settings.timer==='none'?0:([30,45,60,90].includes(settings.stepSeconds)?settings.stepSeconds:30),reserve:[0,60,90,120,180,240].includes(settings.reserveSeconds)?settings.reserveSeconds:120,spectators:true},code,key);
 s.title=old.title;s.discordQueueId=old.discordQueueId;s.teams=old.teams.map(t=>({...t,seats:t.slots,ready:false,logo:''}));s.order=old.order;s.step=old.step;s.actions=old.actions.map((a,i)=>({...a,step:i,time:a.at,abilities:[]}));s.status=old.status==='completed'?'complete':old.status==='paused'?'active':old.status;s.started=old.startedAt||Date.now();s.banks=old.bank;return s;
}
export function seatOf(s,id){for(let team=0;team<2;team++){const slot=s.teams[team].seats.findIndex(p=>p?.id===id);if(slot>=0)return{team,slot}}return null}
export function accessStudio(s,id,key,watch=false){const member=id===s.owner||!!seatOf(s,id);if(!member&&(!s.config.spectators||s.config.private&&key!==s.key))fail('يلزم رابط الدعوة أو مقعد في الفريق');return !watch&&(!s.config.private||member||key===s.key)}
export function availableStudio(s,id){const turn=s.order[s.step];return !s.actions.some(a=>String(a.hero)===String(id)&&(a.kind==='ban'||!s.config.mirror||turn.kind==='ban'||a.team===turn.team))}
function commit(s,id,abilities,automatic,now){const turn=s.order[s.step];if(s.config.seconds)s.banks[turn.team]=Math.max(0,s.banks[turn.team]-Math.max(0,now-s.started-s.config.seconds*1000));s.actions.push({...turn,hero:id,abilities,automatic,time:now,step:s.step});s.teams[turn.team][turn.kind==='ban'?'bans':'picks'].push(id);s.step++;s.started=now;s.updated=now;if(s.step===s.order.length){s.status='complete';s.completed=now}}
export function expireStudio(state,now=Date.now()){
 if(state.status!=='active'||!state.config.seconds||now-state.started<state.config.seconds*1000+state.banks[state.order[state.step].team])return state;
 const s=structuredClone(state),available=heroes.filter(h=>availableStudio(s,h.id));const used=s.actions.flatMap(a=>a.abilities||[]),pool=abilityRules.filter(a=>!used.includes(a.id)),abilities=s.config.mode==='ability'?[...pool.filter(a=>!a.ultimate).slice(0,3),...pool.filter(a=>a.ultimate).slice(0,1)].map(a=>a.id):[];
 if(!available.length)fail('لا توجد شخصية متاحة');commit(s,available[Math.floor(Math.random()*available.length)].id,abilities,true,now);return s;
}
export function applyStudio(state,actor,op,b={},now=Date.now()){
 const s=structuredClone(state),seat=seatOf(s,actor.id),owner=s.owner===actor.id;
 const requireLobby=()=>{if(s.status!=='lobby')fail('الإعدادات والمقاعد مقفلة بعد البداية')};
 if(op==='settings'){requireLobby();if(!owner)fail('لمنشئ الغرفة فقط');if(s.discordQueueId)fail('إعدادات غرفة دسكورد ثابتة');const c=normalizeConfig(b.config);s.config=c;s.order=sequence(c);s.teams.forEach((t,i)=>{t.name=c.names[i];t.logo=c.logos[i];t.seats=Array.from({length:c.size},(_,n)=>t.seats[n]||null);t.ready=false});s.banks=[c.reserve*1000,c.reserve*1000]}
 else if(op==='seat'||op==='leave'){requireLobby();if(s.discordQueueId)fail('مقاعد دسكورد ثابتة');if(op==='seat'){if(![0,1].includes(b.team)||!Number.isInteger(b.slot)||b.slot<0||b.slot>=s.config.size)fail('مقعد غير صحيح');const current=s.teams[b.team].seats[b.slot];if(current&&current.id!==actor.id)fail('المقعد محجوز')};s.teams.forEach(t=>{t.seats=t.seats.map(p=>p?.id===actor.id?null:p);t.ready=false});if(op==='seat')s.teams[b.team].seats[b.slot]={id:actor.id,name:actor.name}}
 else if(op==='ready'){requireLobby();if(s.config.mode==='mock'){if(!owner)fail('لمنشئ الغرفة فقط');s.status='active';s.started=now}else{if(seat?.slot!==0)fail('للكابتن فقط');s.teams[seat.team].ready=!s.teams[seat.team].ready;if(s.teams.every(t=>t.seats[0]&&t.ready)){s.status='active';s.started=now}}}
 else if(op==='select'){
 if(s.status!=='active')fail('الدرافت غير نشط');const turn=s.order[s.step];if(!(s.config.mode==='mock'&&owner)&&!(seat?.slot===0&&seat.team===turn.team))fail('ليس دور فريقك');if(b.expectedStep!==s.step)fail('تغيّر الدور؛ راجع الاختيار');const id=ids.get(String(b.hero));if(id===undefined||!availableStudio(s,id))fail('الشخصية غير متاحة');let selected=[];
 if(s.config.mode==='ability'){selected=b.abilities;const used=s.actions.flatMap(a=>a.abilities||[]);if(!Array.isArray(selected)||selected.length!==4||new Set(selected).size!==4||selected.some(id=>!abilityRules.some(a=>a.id===id)||used.includes(id))||selected.filter(id=>abilityRules.find(a=>a.id===id).ultimate).length!==1)fail('اختَر 3 قدرات عادية ونهائية واحدة')}
 commit(s,id,selected,false,now);
 }else fail('طلب غير معروف');s.updated=now;return s;
}
export function publicStudio(state,id,key,watch){const canEnter=accessStudio(state,id,key,watch),s=structuredClone(state);delete s.delivery;delete s.customLobby;if(!(id===s.owner||seatOf(s,id)))delete s.key;s.canEnter=canEnter;return s}
