const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function mountArRanking(host,hero){
 host.innerHTML='<h2>تصنيف اللاعبين DEAD LOCK AR</h2><p class="ar-ranking-note">توب 100 · '+esc(hero.nameAr)+' · المسجلون في المجتمع فقط · الترتيب بنسبة الفوز، من 11 قيم وفوق · تشمل أقيامك السابقة قبل التسجيل بالموقع.</p><div class="ar-ranking-results" aria-live="polite">جارٍ جلب اللاعبين…</div>';
 const results=host.querySelector('.ar-ranking-results');
 try{
  const demo=['127.0.0.1','localhost','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('ranking-demo')==='1';
  let data;
  if(demo){
   data={configured:true,members:[
    {display_name:'صقر',avatar_url:'assets/11.webp',seconds_played:864000,win_rate:68.4},
    {display_name:'NOVA',avatar_url:'assets/7.webp',seconds_played:676800,win_rate:65.2},
    {display_name:'راكان',avatar_url:'assets/2.webp',seconds_played:554400,win_rate:62.8},
    {display_name:'ظل',avatar_url:'assets/13.webp',seconds_played:435600,win_rate:59.6},
    {display_name:'Fahad',avatar_url:'assets/3.webp',seconds_played:334800,win_rate:56.1}
   ]};
   const badge=document.createElement('p');badge.className='ar-ranking-demo-label';badge.textContent='معاينة فقط — هؤلاء اللاعبون الخمسة وهميون، والصور رمزية من شخصيات اللعبة.';host.querySelector('h2').after(badge);
  } else {
   const res=await fetch('/.netlify/functions/arab-community?op=heroes&hero='+encodeURIComponent(hero.id)+'&metric=win_rate&limit=100',{signal:AbortSignal.timeout(15000)});
   if(!res.ok)throw Error();data=await res.json();
  }
  if(!host.isConnected)return;
  if(!data.configured){results.textContent='ربط المجتمع غير متاح في هذه المعاينة.';return;}
  const rows=(data.members||[]).slice(0,100);
  if(!rows.length){results.textContent='لا يوجد لاعبون مؤهلون لهذه الشخصية حتى الآن.';return;}
  results.innerHTML='<div class="ar-ranking-row ar-ranking-head"><span>#</span><span>اللاعب</span><span>الساعات</span><span>نسبة الفوز</span></div><ol>'+rows.map((r,i)=>{
   const seconds=r.seconds_played;
   const hours=seconds===undefined||seconds===null?'غير متاحة':(Math.max(0,Number(seconds)||0)/3600).toLocaleString('en-US',{maximumFractionDigits:1});
   const avatar=typeof r.avatar_url==='string'&&(/^https:\/\//i.test(r.avatar_url)||(demo&&/^assets\/[0-9]+\.webp$/.test(r.avatar_url)))?`<img src="${esc(r.avatar_url)}" alt="" width="42" height="42" loading="lazy">`:'<span class="ar-ranking-avatar" aria-hidden="true"></span>';
   return `<li class="ar-ranking-row"><span>${i+1}</span><span class="ar-ranking-player">${avatar}<strong dir="auto">${esc(r.display_name)}</strong></span><span>${hours}</span><span>${Number(r.win_rate||0).toFixed(1)}%</span></li>`;
  }).join('')+'</ol><p class="ar-ranking-note">الساعات ونسبة الفوز لهذه الشخصية من المباريات المتوفرة عند المصدر؛ ليست إجمالي حساب Steam ولا الرانك الرسمي.</p>';
 }catch{if(host.isConnected){results.innerHTML='<p>تعذّر جلب التصنيف.</p><button type="button">إعادة المحاولة</button>';results.querySelector('button').onclick=()=>mountArRanking(host,hero);}}
}
