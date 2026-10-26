import {randomInt} from 'node:crypto';
import {createDraft} from '../../draft-core.js';
export function newDiscordQueue({id,guildId,channelId,creatorId,title='كوستم المجتمع',mode='random'}){
 if(![id,guildId,channelId,creatorId].every(v=>/^\d{17,22}$/.test(v||'')))throw Error('معرّفات دسكورد غير صالحة');
 if(!['random','manual'].includes(mode)||typeof title!=='string'||!title.trim()||title.length>80)throw Error('راجع اسم القيم وطريقة التوزيع');
 return{id,guildId,channelId,creatorId,title:title.trim(),mode,status:'waiting',players:[],teams:null,draftCode:null};
}
export function changeDiscordQueue(queue,actor,op,body={},rng=randomInt){
 const q=structuredClone(queue),owner=actor.discordId===q.creatorId;
 if(q.status==='cancelled'||q.draftCode)throw Error('التسجيل مقفل لهذا القيم');
 if(op==='join'){
  if(q.status!=='waiting'||q.players.length>=12)throw Error('اكتمل العدد');
  if(!/^\d{17,22}$/.test(actor.discordId||'')||!/^7656119\d{10}$/.test(actor.steamId||''))throw Error('اربط حساب Steam أولًا');
  if(q.players.some(p=>p.discordId===actor.discordId||p.steamId===actor.steamId))throw Error('أنت مسجل بالفعل');
  q.players.push({discordId:actor.discordId,steamId:actor.steamId,name:String(actor.name||'لاعب').slice(0,64)});
  if(q.players.length===12){q.status='ready';if(q.mode==='random'){const players=[...q.players];for(let i=players.length-1;i>0;i--){const j=rng(i+1);[players[i],players[j]]=[players[j],players[i]]}q.teams=[players.slice(0,6).map(p=>p.discordId),players.slice(6).map(p=>p.discordId)]}}
 }else if(op==='leave'){
  if(q.status!=='waiting')throw Error('اكتمل العدد والتسجيل مقفل');
  q.players=q.players.filter(p=>p.discordId!==actor.discordId);
 }else if(op==='assign'){
  if(!owner||q.mode!=='manual'||q.status!=='ready')throw Error('توزيع الفرق لمنشئ القيم بعد اكتمال العدد');
  const teams=body.teams,ids=teams?.flat();
  if(!Array.isArray(teams)||teams.length!==2||teams.some(t=>!Array.isArray(t)||t.length!==6)||new Set(ids).size!==12||ids.some(id=>!q.players.some(p=>p.discordId===id)))throw Error('اختر فريقين مختلفين من ستة لاعبين؛ أول لاعب بكل فريق هو الكابتن');
  q.teams=teams;
 }else if(op==='cancel'){
  if(!owner&&!actor.manageGuild)throw Error('إلغاء القيم للمنشئ أو إدارة السيرفر');q.status='cancelled';
 }else throw Error('طلب غير معروف');return q;
}
export function queueDraft(queue){
 if(queue.status!=='ready'||!queue.teams||queue.players.length!==12)throw Error('الفرق غير جاهزة');
 const captain=queue.players.find(p=>p.discordId===queue.teams[0][0]);
 const state=createDraft(captain.steamId,queue.title,{bans:3,timer:'hybrid',stepSeconds:30,reserveSeconds:120});
 state.teams.forEach((team,i)=>{team.slots=queue.teams[i].map(id=>{const p=queue.players.find(p=>p.discordId===id);return{id:p.steamId,name:p.name}})});
 state.discordQueueId=queue.id;return state;
}
export function queueMessage(q,site='https://sketo44.github.io/deadlock-arabia/'){
 const done=!!q.draftCode,closed=q.status!=='waiting',names=q.players.map((p,i)=>`${i+1}. <@${p.discordId}>`).join('\n')||'بانتظار أول لاعب';
 const description=done?'اكتمل العدد! افتحوا الدرافت للحظر والاختيار.':q.status==='cancelled'?'تم إلغاء القيم.':q.status==='ready'?'اكتمل العدد · نجهّز الفريقين والدرافت.':'اضغط انضمام للمشاركة. يلزم ربط Steam مرة واحدة.';
 return{allowed_mentions:{parse:[]},embeds:[{title:q.title,description,color:done?0xc5ab72:0x238b64,fields:[{name:`اللاعبون (${q.players.length}/12)`,value:names}]}],components:[{type:1,components:done?[{type:2,style:5,label:'افتح الدرافت',url:site+'draft/#room/'+q.draftCode}]:[{type:2,style:3,label:'انضمام',custom_id:'dla:join:'+q.id,disabled:closed},{type:2,style:2,label:'انسحاب',custom_id:'dla:leave:'+q.id,disabled:closed},{type:2,style:4,label:'إلغاء القيم',custom_id:'dla:cancel:'+q.id,disabled:closed}]}]};
}
