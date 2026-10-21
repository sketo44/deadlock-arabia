import {homeDiscoveryMarkup,homeDailyNoteMarkup,mountHomeDiscovery} from './home-discovery.js?v=4';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<span aria-hidden="true"></span>';
const recent=[['nurse-harrow','نيرس هارو','Nurse Harrow'],[86,'فايلت','Violet'],[78,'ديدمان داني','Deadman Danny'],[85,'سولومون','Solomon'],[88,'بابا','Baba'],[84,'رات كينغ','Rat King']];
const gameName=(id,name)=>`<h3><img class="home-name-logo" src="assets/hero-wordmarks/${id==='nurse-harrow'?87:id}.svg" alt="${esc(name)}" width="320" height="100" loading="lazy"></h3>`;
export function communityHome(data){
 const count=data.heroes.length+1;
 return `<div class="home-redesign">
 <section class="home-opening" aria-labelledby="home-title">
  <img class="home-opening-art" src="assets/home/wraith.webp" alt="رايث وسط طاقتها البنفسجية" width="1700" height="960" fetchpriority="high">
  <div class="home-opening-copy"><p class="home-signature">مجتمع ديدلوك العربي</p><h1 id="home-title">اعرف شخصيتك.<br>وادخل القيم جاهز.</h1><p>قصص الشخصيات، شرح القدرات، وبيلدات على أسلوبك.<br class="home-desktop-break"> دليلك في المدينة، من أول لين إلى آخر مواجهة.</p><div class="home-actions"><a class="home-button" href="#heroes">استكشف الشخصيات ${arrow}</a><a class="home-button home-button-secondary" href="#planner">جهّز بيلدك</a></div><a class="home-newcomer" href="#guide/start">أول مرة تلعب ديدلوك؟ ابدأ من هنا ${arrow}</a></div>
  <a class="home-release" href="#hero/nurse-harrow"><img src="assets/lore/nurse-harrow-portrait.webp" alt="" width="58" height="64"><span><small>أحدث شخصيات المدينة</small><strong>نيرس هارو وصلت</strong><span>اكتشف قصتها وقدراتها</span></span>${arrow}</a>
 </section>
 <nav class="home-doorways" aria-label="مداخل الموقع">
 ${[['#heroes','الشخصيات',`${count} شخصية وقصصها وقدراتها`],['#items','الأيتمات','افهم تأثير كل قطعة'],['#community','مجتمع اللاعبين','البيلدات وترتيب اللاعبين'],['#tournaments','البطولات','الفرق وغرف المنافسة']].map(([href,title,sub])=>`<a href="${href}"><span><strong>${title}</strong><small>${sub}</small></span>${arrow}</a>`).join('')}
 </nav>
 <section class="home-arrivals" aria-labelledby="home-arrivals-title"><div class="home-section-heading"><h2 id="home-arrivals-title">اكتشف شخصيات المدينة</h2></div><div class="home-character-window"><div class="home-character-grid">${recent.map(([id,ar,en],i)=>`<a class="home-character" href="#hero/${id}"><img src="${id===85?'assets/home/85-framed.webp':'assets/home/'+id+'.webp'}" alt="" width="420" height="510" loading="lazy"><div>${gameName(id,en)}</div></a>`).join('')}</div></div></section>
 <div class="home-lower-layout">${homeDailyNoteMarkup()}<div class="home-lower-content">${homeDiscoveryMarkup()}
 <section class="home-learn" aria-labelledby="home-learn-title"><div class="home-learn-intro"><p>المعرفة تفرق داخل القيم</p><h2 id="home-learn-title">افهم المدينة.<br>والعبها بطريقتك.</h2><p>من الفارم والحركة إلى اختيار الأيتم المناسب. ادخل على اللي تحتاجه، وخذ الشرح بالعربي.</p><a class="home-text-link" href="#guide/start">افتح دليل البداية ${arrow}</a></div><div class="home-learning-links">${[['guide/map','الماب واللينات','اعرف الطرق ومواقع الأهداف.','assets/guide/Map_colored.png'],['guide/farm','الفارم والسولز','كيف تجمع، ومتى تركز على الفارم.','assets/guide/Fairfax_crates.png'],['guide/movement','الحركة والتنقّل','الحبال والمراوح وطرق الوصول.','assets/guide/Riding_zipline.png']].map(([route,title,sub,img])=>`<a href="#${route}"><img src="${img}" alt="" width="70" height="70" loading="lazy"><span><h3>${title}</h3><p>${sub}</p></span>${arrow}</a>`).join('')}<a href="assistant.html"><span class="home-help-mark" aria-hidden="true">؟</span><span><h3>عندك سؤال عن اللعبة؟</h3><p>اسأل المساعد بالعربي · تجريبي</p></span>${arrow}</a></div></section>
 <section class="home-community" aria-labelledby="home-community-title"><div><p>مكانك بين اللاعبين</p><h2 id="home-community-title">القيم أحلى مع مجتمعك.</h2><p>شارك بيلدك، تعرّف على اللاعبين، أو جهّز فريقك للمنافسة.</p><div class="home-actions"><a class="home-button" href="#community">ادخل المجتمع ${arrow}</a><a class="home-button home-button-secondary" href="#tournaments">ساحة البطولات</a></div></div><img src="assets/arena-city-full.jpg" alt="شوارع مدينة ديدلوك" loading="lazy" width="740" height="500"></section>
 </div></div>
 </div>`;
}

let stopRotation=()=>{};
export async function mountHome(){
 stopRotation();
 mountHomeDiscovery();
 const track=document.querySelector('.home-character-grid');
 if(!track)return;
 const response=await fetch('data/home-roster.json?v=1');
 if(!response.ok||!track.isConnected)return;
 const roster=await response.json();
 if(!track.isConnected)return;
 track.innerHTML=roster.map(h=>`<a class="home-character" href="#hero/${h.id}"><img src="${esc(h.image)}" alt="" width="420" height="510" loading="lazy"><div>${gameName(h.id,h.name)}</div></a>`).join('');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let paused=reduced.matches,busy=false,animation;
 
 const advance=async()=>{
  if(!track.isConnected){stopRotation();return}
  if(busy||paused||document.hidden||track.matches(':hover')||track.contains(document.activeElement))return;
  busy=true;
  const first=track.firstElementChild;
  const step=first.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
  const incoming=track.children[Math.min(roster.length-1,Math.ceil(track.clientWidth/step))]?.querySelector('img');
  if(incoming)incoming.loading='eager';
  try{
   if(!reduced.matches){animation=track.animate([{transform:'translateX(0)'},{transform:`translateX(-${step}px)`}],{duration:650,easing:'cubic-bezier(.22,.68,.2,1)',fill:'forwards'});await animation.finished}
   if(track.isConnected)track.append(first);
  }catch{}finally{animation?.cancel();busy=false}
 };
 const timer=setInterval(advance,5000);
 const cleanup=()=>{clearInterval(timer);animation?.cancel();window.removeEventListener('hashchange',leave)};
 const leave=()=>{if(!track.isConnected)cleanup()};
 window.addEventListener('hashchange',leave);
 stopRotation=cleanup;
}

