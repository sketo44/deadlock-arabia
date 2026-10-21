const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const entries=[['heroes','الشخصيات','قصص، قدرات، وعرض 3D','assets/2.webp','hero'],['items','الأيتمات','افهم مشترياتك قبل القيم','assets/ui/weapon.png','item'],['guide/map','الماب واللينات','اعرف طرق المدينة','assets/guide/Map_colored.png','map'],['guide/farm','الفارم','السولز والصناديق والبفات','assets/guide/Fairfax_crates.png','farm'],['guide/jungle','الجنقل','الكامبات ومستوياتها','assets/guide/Neutral_barrel_normal.png','jungle'],['guide/objectives','الأهداف والريفت','وش تاخذ ومتى تروحه','assets/guide/Unstable_Rift.png','rift']];
export function homeGuideTiles(){return `<section class="city-directory" aria-labelledby="city-directory-title"><div class="city-directory-heading"><h2 id="city-directory-title">وش تبي تتعلّم؟</h2><a href="#guide/start">جديد على ديدلوك؟ ابدأ هنا</a></div><div class="city-entry-grid">${entries.map(([route,title,sub,img,type])=>`<a class="city-entry entry-${type}" href="#${route}"><span class="city-entry-image"><img src="${img}" alt="" width="100" height="100"></span><span><strong>${title}</strong><small>${sub}</small></span></a>`).join('')}</div><a class="city-directory-more" href="#guide/movement">أبواب التنقّل والحبال والمراوح</a></section>`}
let guide;
export function guidePage(){return '<section class="city-guide" id="city-guide"><p role="status">نفتح لك دليل اللاعب…</p></section>'}
const comparison=table=>!table?'':`<div class="guide-table-scroll" tabindex="0" role="region" aria-label="جدول مقارنة"><table><thead><tr>${table.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map((cell,i)=>i?`<td>${esc(cell)}</td>`:`<th scope="row" dir="ltr">${esc(cell)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
export async function mountGuide(id){
 const host=document.querySelector('#city-guide');if(!host)return;
 try{
  guide??=await fetch('data/game-guide.json?v=player-guide-3').then(r=>{if(!r.ok)throw Error();return r.json()});
  if(!host.isConnected)return;
  const topic=guide.topics.find(t=>t.id===id);
  const title=topic?.title||'دليل اللاعب';
  host.innerHTML=`<div class="guide-heading"><div class="guide-breadcrumb"><a href="#home">الرئيسية</a>${id?'<span aria-hidden="true">/</span><a href="#guide">دليل اللاعب</a>':''}</div><h1>${esc(title)}</h1><p>${esc(topic?.intro||'افهم اللي يصير داخل القيم، وخذ المعلومة اللي تحتاجها وقتها.')}</p></div>
  <nav class="guide-topics" aria-label="أبواب دليل اللاعب"><a href="#guide" ${!id?'aria-current="page"':''}>كل الأبواب</a>${guide.topics.map(t=>`<a href="#guide/${t.id}" ${topic?.id===t.id?'aria-current="page"':''}>${esc(t.title)}</a>`).join('')}</nav>
  ${topic?`<div class="guide-reading-layout"><aside class="guide-visual"><img src="${esc(topic.image)}" alt="" width="260" height="220"><h2>وش بتعرف هنا؟</h2><ol>${topic.cards.map((c,i)=>`<li><button type="button" data-guide-scroll="guide-answer-${i}">${esc(c.title)}</button></li>`).join('')}</ol>${topic.id==='map'?'<a class="guide-map-link" href="assets/guide/Map_colored.png" target="_blank" rel="noopener">افتح الماب بالحجم الكامل</a>':''}${topic.id==='farm'?'<a class="guide-map-link" href="#guide/jungle">تفاصيل الكامبات والجنقل</a>':''}</aside><div class="guide-answers">${topic.cards.map((c,i)=>`<article class="guide-answer" id="guide-answer-${i}">${c.image?`<img src="${esc(c.image)}" alt="" width="80" height="80" loading="lazy">`:''}<div><h2 tabindex="-1">${esc(c.title)}</h2><p>${esc(c.body)}</p>${c.figure?`<figure class="guide-lesson-figure"><a href="${esc(c.figure.src)}" target="_blank" rel="noopener" aria-label="افتح الصورة بالحجم الكامل: ${esc(c.figure.alt)}"><img src="${esc(c.figure.src)}" alt="${esc(c.figure.alt)}" width="${c.figure.width}" height="${c.figure.height}" loading="lazy" decoding="async"></a><figcaption>${esc(c.figure.caption)}</figcaption></figure>`:''}${comparison(c.table)}${c.example?`<p class="guide-example"><strong>داخل القيم</strong>${esc(c.example)}</p>`:''}</div></article>`).join('')}</div></div>`:`<a class="guide-start-callout" href="#guide/start"><span><small>أول قيم لك؟</small><h2>ابدأ بخطوات واضحة.</h2><p>تدرّب، افهم اللين، واعرف وش تسوي قبل الفايت وبعده.</p></span><img src="assets/guide/Map_colored.png" alt="" width="160" height="160"></a><div class="guide-hub-grid">${guide.categories.map(t=>`<a href="#guide/${t.id}"><img src="${esc(t.image)}" alt="" width="100" height="100" loading="lazy"><h2>${esc(t.title)}</h2><p>${esc(t.intro)}</p><span>افتح الشرح</span></a>`).join('')}</div><div class="guide-extra-links"><a href="#guide/map">الماب واللينات</a><a href="#guide/jungle">أنواع الكامبات والجنقل</a><a href="#heroes">ملفات الشخصيات</a><a href="#items">الأيتمات</a></div>`}
  `;
  const viewer=document.createElement('dialog');
  viewer.className='guide-image-viewer';
  viewer.setAttribute('aria-label','عرض صورة الشرح');
  viewer.innerHTML='<button type="button" class="guide-image-close" aria-label="إغلاق الصورة">×</button><img alt="">';
  host.append(viewer);
  const closeViewer=()=>viewer.close();
  viewer.querySelector('button').addEventListener('click',closeViewer);
  viewer.addEventListener('click',event=>{if(event.target===viewer)closeViewer()});
  host.querySelectorAll('.guide-lesson-figure>a,.guide-map-link[href^="assets/"]').forEach(link=>{
   link.removeAttribute('target');
   link.addEventListener('click',event=>{
    event.preventDefault();
    const img=viewer.querySelector('img');img.src=link.href;img.alt=link.querySelector('img')?.alt||'خريطة اللعبة';
    viewer.showModal();
   });
  });
  host.querySelectorAll('[data-guide-scroll]').forEach(button=>button.addEventListener('click',()=>{
   const target=host.querySelector('#'+button.dataset.guideScroll);if(!target)return;
   target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
   target.querySelector('h2').focus({preventScroll:true});
  }));
 }catch{if(host.isConnected)host.innerHTML='<p role="alert">ما قدرنا نفتح الدليل. حدّث الصفحة وجرب مرة ثانية.</p>'}
}
