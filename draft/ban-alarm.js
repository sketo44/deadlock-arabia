let overlay,resetTimer;
export function triggerBanAlarm(){
 if(!overlay){
  overlay=document.createElement('div');overlay.className='ban-alarm';overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<svg class="ban-lightning" viewBox="0 0 1600 900" preserveAspectRatio="none"><path d="M1120 -25 1015 155 1080 145 952 365 1000 345 890 560"/><path class="secondary-bolt" d="M360 -15 445 125 395 118 480 290 435 274 540 455"/></svg>';
  document.body.append(overlay);
 }
 clearTimeout(resetTimer);for(const animation of overlay.getAnimations({subtree:true}))animation.cancel();
 document.body.classList.add('ban-impact');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 overlay.animate(reduced?[{opacity:0},{opacity:.45,offset:.3},{opacity:0}]:[{opacity:0},{opacity:1,offset:.12},{opacity:.72,offset:.42},{opacity:0}],{duration:reduced?1100:1600,easing:'ease-out'});
 if(!reduced){const bolts=overlay.querySelectorAll('path');bolts.forEach((bolt,i)=>{bolt.animate([{strokeDashoffset:1200,opacity:0},{strokeDashoffset:0,opacity:.85,offset:.32},{strokeDashoffset:0,opacity:0}],{duration:850,delay:i*90,easing:'ease-out'});});}
 resetTimer=setTimeout(()=>{document.body.classList.remove('ban-impact');for(const animation of overlay.getAnimations({subtree:true}))animation.cancel();},1700);
}

