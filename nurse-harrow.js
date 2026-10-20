export const nurseHarrow={id:'nurse-harrow',name:'Nurse Harrow',nameAr:'نيرس هارو',image:'assets/lore/nurse-harrow-portrait.webp',portrait:'assets/lore/nurse-harrow-portrait.webp',ar:'نيرس هارو · شخصية قادمة · ممرضة صارمة تحيط بها أسرار لم تُكشف بعد.'};
export function mountNurseHarrow(host,roster,escape){
 document.title='نيرس هارو · Nurse Harrow | Deadlock AR';
 document.body.dataset.heroId='nurse-harrow';
 if(!document.querySelector('.wraith-page-backdrop')){const bg=document.createElement('div');bg.className='wraith-page-backdrop';bg.setAttribute('aria-hidden','true');document.body.prepend(bg)}
 host.classList.add('seven-lore','seven-experience','hero-community-primary');
 const labels=['نظرة عامة','القصة','القدرات والإحصائيات','عرض الشخصية 3D','تصنيف اللاعبين DEAD LOCK AR'];
 const panels=[
 '<h2>نيرس هارو · شخصية قادمة</h2><p>ممرضة ذات حضور صارم، تحمل سلاح حقن بسائل برتقالي وتظهر بزي طبي قديم وقبعة بيضاء وقفازات خضراء.</p><p>هذه صفحة تمهيدية بالمعلومات المتاحة، وسنحدّث بياناتها بعد صدورها. موعد الإصدار والقدرات النهائية غير مؤكدة هنا؛ لا نفترض أنها ستصدر اليوم.</p><small>آخر مراجعة: 20 أكتوبر 2026</small>',
 '<h2>نيرس هارو: لا مجال للعصيان</h2><p>المعروف عن هارو حتى الآن قليل. تتحدث بلكنة بريطانية، وتظهر في عباراتها شخصية حازمة لا تتسامح مع العصيان.</p><p>زيها الطبي وعباءتها ذات الياقة المرتفعة وحقيبتها الغريبة وسلاح الحقن تمنحها مظهرًا مقلقًا، لكن أصلها ودافعها للمشاركة في الطقس وعلاقاتها بالشخصيات الأخرى لم تتضح بعد.</p><p>لن نملأ الفراغ بقصة مخترعة. تُستكمل هذه الصفحة عندما تُنشر خلفيتها وحواراتها.</p><small class="expanded-lore-source">تلخيص وتكييف عن <a href="https://deadlock.wiki/Nurse_Harrow/Lore" target="_blank" rel="noopener">Deadlock Wiki ومساهميه</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></small>',
 '<h2>القدرات والإحصائيات</h2><p>لم تُضف بيانات نهائية موثوقة بعد. ستظهر القدرات وأرقامها هنا بعد صدورها ومراجعتها.</p>',
 '<h2>عرض الشخصية 3D</h2><p>العرض ثلاثي الأبعاد غير مضاف لهذه الشخصية حاليًا.</p>',
 '<h2>تصنيف لاعبي نيرس هارو</h2><p>التصنيف غير متاح قبل إضافة الشخصية وبيانات مبارياتها. لا توجد نتائج أو أرقام تجريبية هنا.</p>'
 ];
 host.innerHTML=`<header class="wraith-permanent-heading"><span>نيرس هارو · قادمة</span><h1 class="wraith-panel-title" dir="ltr">Nurse Harrow</h1></header><nav class="hero-sections" aria-label="أقسام ملف الشخصية"><div class="hero-section-tabs" role="tablist">${labels.map((label,i)=>`<button type="button" role="tab" id="nurse-tab-${i}" aria-controls="nurse-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${label}</button>`).join('')}</div></nav><div class="hero-section-panels">${panels.map((text,i)=>`<section id="nurse-panel-${i}" role="tabpanel" aria-labelledby="nurse-tab-${i}" ${i?'hidden':''} class="hero-overview nurse-reading">${text}</section>`).join('')}</div>`;
 const buttons=[...host.querySelectorAll('[role=tab]')];function select(index,focus=false){buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;host.querySelector('#nurse-panel-'+i).hidden=i!==index});if(focus)buttons[index].focus()}
 buttons.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
 host.querySelector('[role=tablist]').addEventListener('keydown',e=>{let i=buttons.indexOf(document.activeElement);if(e.key==='ArrowLeft')i=(i+1)%buttons.length;else if(e.key==='ArrowRight')i=(i+buttons.length-1)%buttons.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=buttons.length-1;else return;e.preventDefault();select(i,true)});
 const strip=document.createElement('nav');strip.className='hero-card-picker';strip.setAttribute('aria-label','اختيار الشخصية');strip.innerHTML=roster.map(h=>`<a class="hero-mini-card ${h.id==='nurse-harrow'?'selected':''}" href="#hero/${h.id}"><img src="${escape(h.portrait)}" alt="" width="56" height="64" loading="lazy"><span dir="ltr">${escape(h.name)}</span></a>`).join('');host.append(strip);
}
