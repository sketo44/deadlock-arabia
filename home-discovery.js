import {playstyles} from './home-playstyles.js?v=1';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export {dailyTips} from './daily-tips.js?v=1';
import {dailyTips} from './daily-tips.js?v=1';
export function saudiDayKey(date=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const get=type=>parts.find(p=>p.type===type).value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}
export function dailyTip(date=new Date()){
 const day=saudiDayKey(date),index=Math.floor(Date.parse(day+'T00:00:00Z')/86400000)%dailyTips.length;
 const [category,text,route]=dailyTips[index];return {day,category,text,route};
}
export const quizQuestions=[
 {key:'style',title:'وش تحب يكون دورك في القيم؟',options:[['frontline','أدخل من قريب وأفتح المواجهة'],['gunner','أركّز على الضرر والتصويب'],['support','أساند الفريق وأحمي الحلفاء'],['control','أتحكم بالمكان وأعطّل الخصم']]},
 {key:'range',title:'من أي مسافة ترتاح تلعب؟',options:[['close','قريب، وسط المواجهة'],['mid','مسافة متوسطة وأغيّر موقعي'],['long','من بعيد وبزاوية آمنة']]},
 {key:'learning',title:'وش تفضّل وأنت تتعلّم الشخصية؟',options:[['easy','قدرات واضحة وبداية أسهل'],['technical','تفاصيل وكومبوهات أتدرّب عليها'],['any','ما عندي تفضيل، أهم شيء الأسلوب']]}
];
export function recommendHeroes(answers){
 if(quizQuestions.some(q=>!q.options.some(([value])=>value===answers[q.key])))return [];
 return playstyles.map((hero,index)=>{
  const styleMatch=hero.styles.includes(answers.style),rangeMatch=hero.ranges.includes(answers.range);
  const learningMatch=answers.learning==='any'||(answers.learning==='easy'?hero.complexity<=1:hero.complexity>=3);
  return {...hero,score:(styleMatch?8:0)+(rangeMatch?4:0)+(learningMatch?2:0),index};
 }).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,3);
}
export function homeDailyNoteMarkup(){
 const tip=dailyTip();
 return `<aside class="daily-game-tip daily-tip-note" aria-labelledby="daily-tip-title"><h2 id="daily-tip-title">نصيحة اليوم</h2><div data-daily-tip><p>${esc(tip.text)}</p><a href="#${tip.route}">اعرف أكثر</a></div></aside>`;
}
export function homeDiscoveryMarkup(){
 return `<section class="home-discovery" aria-label="اختيار الشخصية"><section class="playstyle-quiz" aria-labelledby="playstyle-title"><h2 id="playstyle-title">مين يناسب لعبك؟</h2><p class="quiz-intro">3 أسئلة تقرّبك من شخصيتك.</p><div data-playstyle-quiz></div></section></section>`;
}
export function mountHomeDiscovery(){
 const host=document.querySelector('[data-playstyle-quiz]'),tipHost=document.querySelector('[data-daily-tip]');
 if(!host||!tipHost)return;
 let step=0,answers={},tipDay=saudiDayKey();
 function render(focus=false){
  if(step===quizQuestions.length){
   const results=recommendHeroes(answers);
   host.innerHTML=`<div class="quiz-results"><p class="quiz-progress" role="status">هذي الشخصيات أقرب لاختياراتك</p><div class="quiz-recommendations">${results.map(h=>`<a class="quiz-hero-result" href="#hero/${h.id}"><img src="assets/home/roster-${h.id}.webp" alt="" width="160" height="180" loading="lazy"><div><h3 dir="ltr">${esc(h.name)}</h3><p>${esc(h.reason)}</p><span>افتح ملف الشخصية</span></div></a>`).join('')}</div><p class="quiz-result-note">جرّبها وشوف الأنسب لك.</p><button type="button" data-quiz-restart>جرّب اختيارات ثانية</button></div>`;
   host.querySelector('[data-quiz-restart]').addEventListener('click',()=>{step=0;answers={};render(true)});
   if(focus){const status=host.querySelector('[role=status]');status.tabIndex=-1;status.focus({preventScroll:true})}return;
  }
  const q=quizQuestions[step];
  host.innerHTML=`<p class="quiz-progress">السؤال ${step+1} من ${quizQuestions.length}</p><fieldset class="quiz-question"><legend tabindex="-1">${q.title}</legend><div class="quiz-options">${q.options.map(([value,label])=>`<label><input type="radio" name="playstyle-${q.key}" value="${value}" ${answers[q.key]===value?'checked':''}><span>${label}</span></label>`).join('')}</div></fieldset><div class="quiz-navigation">${step?'<button type="button" data-quiz-back>السابق</button>':''}<button type="button" data-quiz-next ${answers[q.key]?'':'disabled'}>${step===2?'شوف الشخصيات':'التالي'}</button></div>`;
  host.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{answers[q.key]=input.value;host.querySelector('[data-quiz-next]').disabled=false}));
  host.querySelector('[data-quiz-next]').addEventListener('click',()=>{if(!answers[q.key])return;step++;render(true)});
  host.querySelector('[data-quiz-back]')?.addEventListener('click',()=>{step--;render(true)});
  if(focus)host.querySelector('legend').focus({preventScroll:true});
 }
 render();
 const timer=setInterval(()=>{
  if(!tipHost.isConnected){clearInterval(timer);return}
  const tip=dailyTip();if(tip.day===tipDay)return;tipDay=tip.day;
  tipHost.innerHTML=`<p>${esc(tip.text)}</p><a href="#${tip.route}">اعرف أكثر</a>`;
 },60000);
 const leave=()=>{if(!host.isConnected){clearInterval(timer);removeEventListener('hashchange',leave);removeEventListener('popstate',leave)}};
 addEventListener('hashchange',leave);addEventListener('popstate',leave);
}
