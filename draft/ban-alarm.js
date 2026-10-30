let overlay,resetTimer;
export function triggerBanAlarm(){
 if(!overlay){overlay=document.createElement('div');overlay.className='ban-alarm';overlay.setAttribute('aria-hidden','true');const word=document.createElement('span');word.className='ban-word';word.textContent='حظر';overlay.append(word);document.body.append(overlay)}
 const stage=document.querySelector('.hero-stage');if(stage){const box=stage.getBoundingClientRect();Object.assign(overlay.style,{inset:'auto',left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px'});overlay.querySelector('.ban-word').style.fontSize=Math.min(box.width*.68,box.height*.92)+'px'}
 clearTimeout(resetTimer);for(const animation of overlay.getAnimations({subtree:true}))animation.cancel();document.body.classList.add('ban-impact');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduced?1100:1450;
 overlay.animate([{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.65},{opacity:0}],{duration,easing:'ease-out'});
 if(!reduced)overlay.querySelector('.ban-word').animate([{transform:'translateY(10px) scale(.94)'},{transform:'translateY(0) scale(1)',offset:.25},{transform:'translateY(0) scale(1)'}],{duration,easing:'ease-out'});
 resetTimer=setTimeout(()=>{document.body.classList.remove('ban-impact');for(const animation of overlay.getAnimations({subtree:true}))animation.cancel()},duration+50);
}
