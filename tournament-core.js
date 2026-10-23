export const registrationRules = [
 'التسجيل يعني الموافقة على قوانين البطولة المنشورة، ومخالفتها قد تؤدي إلى العقوبة أو الاستبعاد بقرار المشرف.',
 'الفريق يتكوّن من 6 لاعبين أساسيين، ويمكن تسجيل لاعب احتياط واحد اختياري.',
 'يُكتب يوزر دسكورد لكل لاعب، ويكون اللاعب الأول كابتن الفريق ومسؤول التواصل.',
 'يجب أن ينضم جميع اللاعبين إلى سيرفر دسكورد البطولة عندما يشترط المنظم ذلك.',
 'الأسماء والصور غير اللائقة لا تُقبل. التسجيل والشعار ينتظران مراجعة المشرف قبل الظهور للعموم.',
 'شعار الفريق اختياري؛ عند عدم رفعه يظهر رقم الفريق. ويمكن ترك الاسم فارغًا ليُستخدم «الفريق» ورقمه.',
 'التسجيل متاح للحسابات المسجّلة عبر Steam بالموقع، ومقيد بموعد الفتح والإغلاق وعدد الفرق المحدد؛ لا يشترط الانضمام لليدربورد.'
];
export function bracketSize(count){let size=2;while(size<count)size*=2;return size}
export function arrangeBracket(teams,slots,capacity){
 const size=bracketSize(teams.length),ids=teams.map(t=>t.id);
 if(teams.length<2||teams.length>capacity||!Array.isArray(slots)||slots.length!==size||slots.filter(Boolean).length!==teams.length||new Set(slots.filter(Boolean)).size!==teams.length||slots.some(x=>x&&!ids.includes(x)))throw Error('وزّع كل فريق مرة واحدة، واترك الخانات المتبقية للتأهل التلقائي.');
 const map=new Map(teams.map(t=>[t.id,{id:t.id,name:t.team_name,number:t.team_number}]));
 const first=Array.from({length:size/2},(_,i)=>{const a=map.get(slots[i*2])||null,b=map.get(slots[i*2+1])||null;if(!a&&!b)throw Error('لا تترك مواجهة كاملة فارغة.');return {id:`r0-m${i}`,teams:[a,b],bye:!a||!b,winner:!a?b.id:!b?a.id:null,scores:null}});
 const rounds=[first];for(let r=1,n=size/4;n>=1;r++,n/=2)rounds.push(Array.from({length:n},(_,i)=>({id:`r${r}-m${i}`,teams:[null,null],winner:null,bye:false,scores:null})));
 return advanceBracket({version:1,capacity,rounds});
}
export function previewRounds(count){const size=bracketSize(count),rounds=[];for(let n=size/2;n>=1;n/=2)rounds.push(n);return rounds}
export function createBracket(teams, capacity, random=Math.random){
 if(teams.length<2||teams.length>capacity)throw Error('يلزم فريقان معتمدان على الأقل، ولا يتجاوز العدد سعة البطولة.');
 const shuffled=teams.map(t=>({id:t.id,name:t.team_name,number:t.team_number}));
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
 const size=bracketSize(shuffled.length),byes=size-shuffled.length,rounds=[];let cursor=0;
 const first=[];for(let i=0;i<size/2;i++){const a=shuffled[cursor++],b=i<byes?null:shuffled[cursor++];first.push({id:`r0-m${i}`,teams:[a||null,b||null],winner:b?null:a?.id||null,bye:!b,scores:null})}rounds.push(first);
 for(let r=1,n=size/4;n>=1;r++,n/=2)rounds.push(Array.from({length:n},(_,i)=>({id:`r${r}-m${i}`,teams:[null,null],winner:null,bye:false,scores:null})));
 return advanceBracket({version:1,capacity,rounds});
}
export function advanceBracket(bracket){
 for(let r=1;r<bracket.rounds.length;r++)for(let i=0;i<bracket.rounds[r].length;i++){
  const match=bracket.rounds[r][i];for(let side=0;side<2;side++){const previous=bracket.rounds[r-1][i*2+side];match.teams[side]=previous.winner?previous.teams.find(t=>t?.id===previous.winner)||null:null}
 }
 const final=bracket.rounds.at(-1)?.[0];bracket.champion=final?.winner?final.teams.find(t=>t?.id===final.winner)||null:null;return bracket;
}
export function recordResult(bracket,matchId,a,b,bestOf=1,finalBestOf=3){
 const next=structuredClone(bracket),round=next.rounds.findIndex(xs=>xs.some(x=>x.id===matchId));
 const match=next.rounds[round]?.find(x=>x.id===matchId);
 if(!match||match.winner||!match.teams.every(Boolean))throw Error('المواجهة ليست جاهزة أو تم اعتماد نتيجتها.');
 const target=(round===next.rounds.length-1?finalBestOf:bestOf)+1>>1;
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a===b||Math.max(a,b)!==target||Math.min(a,b)>=target)throw Error('النتيجة لا توافق عدد أقيام السلسلة.');
 match.scores=[a,b];match.winner=match.teams[a>b?0:1].id;return advanceBracket(next);
}
export function registrationState(t,now=Date.now()){
 if(t.bracket?.rounds?.length||t.status!=='registration')return 'closed';
 if(t.registration_opens_at&&now<Date.parse(t.registration_opens_at))return 'scheduled';
 if(t.registration_closes_at&&now>=Date.parse(t.registration_closes_at))return 'closed';
 if(now>=Date.parse(t.starts_at))return 'closed';return 'open';
}
