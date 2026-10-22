
import {mountHeroSections} from './hero-sections.js?v=hero-layout-111';
export function mountSeven(host,r,escape,roster){
 const bakedBackground=[1,2,3,4,6,7,8,10,11,12,13,14,15,16,17,18,19,20,25,27,31,35,50,52,58,60,63,64,65,66,67,69,72,76,77,78,79,80,81,84,85,86,88].includes(Number(r.id));
 const blankImage='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E';
 const current=roster.findIndex(h=>h.id===r.id),previous=roster[(current-1+roster.length)%roster.length],next=roster[(current+1)%roster.length];
 document.title=r.nameAr+' · '+r.name+' | Deadlock AR';
 document.body.dataset.heroId=r.id;document.body.dataset.heroEffect=r.effect;document.body.style.setProperty('--hero-tone',r.identityColor);
 const picker=`<nav class="hero-card-picker" aria-label="اختيار الشخصية">${roster.map(h=>`<a class="hero-mini-card ${h.id===r.id?'selected':''}" href="#hero/${h.id}" ${h.id===r.id?'aria-current="page"':''} title="${escape(h.nameAr)}"><img src="${escape(h.portrait)}" alt="" width="56" height="64" loading="lazy"><span dir="ltr">${escape(h.name)}</span></a>`).join('')}</nav>`;
 const arrows=`<div class="hero-switch"><a href="#hero/${previous.id}" aria-label="الشخصية السابقة: ${escape(previous.nameAr)}" title="${escape(previous.nameAr)}"><svg viewBox="0 0 32 20" aria-hidden="true"><path d="M29 10H4m8-7-8 7 8 7"/></svg><small>السابق</small></a><span>${current+1} / ${roster.length}</span><a href="#hero/${next.id}" aria-label="الشخصية التالية: ${escape(next.nameAr)}" title="${escape(next.nameAr)}"><small>التالي</small><svg viewBox="0 0 32 20" aria-hidden="true"><path d="M3 10h25M20 3l8 7-8 7"/></svg></a></div>`;

 const bolts=`<svg class="seven-lightning" viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true"><g class="bolt bolt-one"><path d="M170 -20 230 130 184 145 295 310 252 325 350 475 295 450 395 680"/><path d="m295 310 95 10 40 80 80 15"/></g><g class="bolt bolt-two"><path d="m1050 -20-100 160 55 10-110 160 40 15-130 175 50-10-120 230"/><path d="m895 310-80 10-75 105-65 15"/></g></svg>`;
 host.classList.add('seven-lore','seven-experience');
 host.innerHTML=`<section class="seven-stage" aria-labelledby="seven-title"><img class="seven-scene" src="${bakedBackground?blankImage:'assets/lore/seven-game-background.jpg'}" alt="" width="1920" height="1080" fetchpriority="high">${r.effect==='lightning'?bolts:'<div class="hero-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>'}<div class="seven-stage-copy"><span class="seven-class">${escape(r.nameAr)}</span><h1 id="seven-title" dir="ltr">${escape(r.name.toUpperCase())}</h1><p class="seven-headline">${escape(r.headlineAr)}</p><p class="seven-stage-intro">${escape(r.gameplayAr)}</p><div class="seven-stage-actions"><button type="button" data-seven-jump="seven-abilities">استكشف قدراته</button><button type="button" class="outline" data-seven-jump="seven-story-title">اقرأ حكايته</button></div></div><figure class="seven-poster"><img src="${bakedBackground?blankImage:escape(r.poster)}" alt="لوحة ${escape(r.nameAr)} مع نبذة من قصته" width="1086" height="1448" fetchpriority="high"></figure>${arrows}<span class="seven-stage-foot" aria-hidden="true">${escape(r.nameAr)}</span></section>${picker}<div class="seven-specs-slot"></div><article class="seven-story" aria-labelledby="seven-story-title"><div class="seven-story-heading"><span>حكاية ${escape(r.nameAr)}</span><h2 id="seven-story-title">${escape(r.headlineAr)}</h2><p>القصة الكاملة من خلفية الشخصية.</p><span class="seven-story-mark" aria-hidden="true">${String(r.name).slice(0,1)}</span></div><div class="seven-story-reading"><div class="seven-story-body">${r.storyAr.map(p=>`<p>${escape(p)}</p>`).join('')}</div></div></article>`;
 const wordmark=document.createElement('img');wordmark.className='hero-name-wordmark';wordmark.src=`assets/hero-wordmarks/${Number(r.id)}.svg`;wordmark.alt=r.name;wordmark.addEventListener('error',()=>wordmark.replaceWith(document.createTextNode(r.name.toUpperCase())),{once:true});host.querySelector('#seven-title').replaceChildren(wordmark);
 if([1,2,3,4,6,7,8,10,11,12,13,14,15,16,17,18,19,20,25,27,31,35,50,52,58,60,63,64,65,66,67,69,72,76,77,78,79,80,81,84,85,86,88].includes(Number(r.id))){
   if(!document.querySelector('.wraith-page-backdrop')){const backdrop=document.createElement('div');backdrop.className='wraith-page-backdrop';backdrop.setAttribute('aria-hidden','true');document.body.prepend(backdrop);}
   host.querySelector('.seven-class').textContent=Number(r.id)===7?'ريث':Number(r.id)===85?'سليمان':r.nameAr;
   host.querySelector('.seven-poster')?.remove();
   host.querySelector('.seven-headline')?.remove();
   const lore=document.createElement('div');lore.className='wraith-opening-lore';
   lore.innerHTML=r.storyAr.map(p=>`<p>${escape(p)}</p>`).join('');
   host.querySelector('.seven-stage-intro').replaceWith(lore);
 }
 const profile=document.querySelector('.seven-profile-pending');const info=profile?.querySelector(':scope > div');if(info){info.classList.add('seven-profile-info');const buildButton=info.querySelector('[data-new]');if(buildButton){buildButton.classList.add('hero-build-action');buildButton.innerHTML=`<span class="build-action-emblem" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="m16 3 12 7v12l-12 7-12-7V10Z M4 10l12 7 12-7M16 17v12M10 6.5l12 7v11"/></svg></span><span class="build-action-label">ابنِ بيلد <b dir="ltr">${escape(r.name)}</b></span><svg class="build-action-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>`;}host.querySelector('.seven-specs-slot').append(info);profile.remove()}
 const abilities=document.querySelector('main>.abilities');if(abilities){abilities.id='seven-abilities';abilities.previousElementSibling?.classList.add('seven-abilities-title');abilities.classList.add('seven-ability-grid');mountAbilityIcons(abilities);const title=abilities.previousElementSibling;if(title?.classList.contains('seven-abilities-title'))title.remove();host.querySelector('.seven-specs-slot').append(abilities)}
 mountHeroSections(host,r,escape);
 if([1,2,3,4,6,7,8,10,11,12,13,14,15,16,17,18,19,20,25,27,31,35,50,52,58,60,63,64,65,66,67,69,72,76,77,78,79,80,81,84,85,86,88].includes(Number(r.id))){
   // Each dossier tab now owns the entire opening region, rather than sitting below a permanent hero.
   const stage=host.querySelector('.seven-stage');
   const switcher=stage.querySelector('.hero-switch');
   host.append(switcher);stage.remove();
 }
 // Keep discovery of other heroes below the selected hero's information.
 host.append(host.querySelector('.hero-card-picker'));
 const heroSwitch=host.querySelector('.hero-switch');
 heroSwitch.remove();
 const layout=document.createElement('div');layout.className='hero-community-layout';const primary=document.createElement('div');primary.className='hero-community-primary';while(host.firstChild)primary.append(host.firstChild);layout.append(primary);host.append(layout);
 const strip=host.querySelector('.hero-card-picker'),selected=strip.querySelector('.selected');layout.append(strip);mountHeroDrag(strip);requestAnimationFrame(()=>{if(host.isConnected)strip.scrollLeft=selected.offsetLeft-strip.offsetLeft-(strip.clientWidth-selected.clientWidth)/2});
}

export function mountAbilityIcons(host){
 const cards=[...host.querySelectorAll(':scope > .ability')];
 const rail=document.createElement('div');rail.className='seven-ability-icons';rail.setAttribute('role','group');rail.setAttribute('aria-label','قدرات الشخصية — اختَر صورة القدرة');
 const hint=document.createElement('p');hint.className='seven-ability-hint';hint.textContent='اضغط على صورة القدرة عشان تشوف شرحها وترقياتها.';
 const buttons=cards.map((card,index)=>{const name=card.querySelector('h3').textContent;card.id='seven-ability-panel-'+index;card.hidden=true;card.setAttribute('role','region');card.setAttribute('aria-label',name);card.querySelector('.ability-expand').open=true;const button=document.createElement('button');button.type='button';button.className='seven-ability-icon';button.setAttribute('aria-label','شرح '+name);button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',card.id);button.title=name;const img=card.querySelector('.ability-title>img').cloneNode(true);img.alt='';img.width=72;img.height=72;button.append(img);const key=document.createElement('kbd');key.textContent=index+1;key.setAttribute('aria-hidden','true');button.append(key);button.addEventListener('click',()=>{const open=card.hidden;cards.forEach((panel,i)=>{panel.hidden=!(open&&i===index);buttons[i].setAttribute('aria-expanded',String(open&&i===index))});hint.hidden=open});rail.append(button);return button});
 host.prepend(rail,hint);
 rail.addEventListener('keydown',event=>{const index=buttons.indexOf(document.activeElement);if(index<0)return;let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;if(next!==undefined){event.preventDefault();buttons[next].focus()}});
}

export function mountHeroDrag(strip){
 let drag=null,suppressClick=false;
 strip.addEventListener('dragstart',event=>event.preventDefault());
 strip.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0)return;suppressClick=false;drag={id:event.pointerId,x:event.clientX,scroll:strip.scrollLeft,moved:false}});
 strip.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const delta=event.clientX-drag.x;if(!drag.moved&&Math.abs(delta)<6)return;if(!drag.moved){drag.moved=true;strip.setPointerCapture(event.pointerId);strip.classList.add('dragging')}event.preventDefault();strip.scrollLeft=drag.scroll-delta});
 const finish=event=>{if(!drag||event.pointerId!==drag.id)return;suppressClick=drag.moved;if(strip.hasPointerCapture(event.pointerId))strip.releasePointerCapture(event.pointerId);strip.classList.remove('dragging');drag=null};
 strip.addEventListener('pointerup',finish);strip.addEventListener('pointercancel',finish);strip.addEventListener('lostpointercapture',()=>{strip.classList.remove('dragging');drag=null});strip.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)drag=null});
 strip.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false}},true);
}
