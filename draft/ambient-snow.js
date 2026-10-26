const scene=document.querySelector('.patron-scene');
if(scene){
 const snow=document.createElement('div');snow.className='ambient-snow';snow.setAttribute('aria-hidden','true');
 for(let i=0;i<34;i++){
  const flake=document.createElement('i');flake.className='snowflake';
  const x=(i*61.8034)%100,size=1.2+(i%4)*.45,duration=17+(i*7%16),delay=-((i*13.31)%duration),drift=(i%2?1:-1)*(18+i%6*7);
  flake.style.cssText=`left:${x}%;--snow-size:${size}px;--snow-duration:${duration}s;--snow-delay:${delay}s;--snow-drift:${drift}px;--snow-opacity:${.18+(i%5)*.055}`;
  snow.append(flake);
 }
 scene.append(snow);
 document.addEventListener('visibilitychange',()=>snow.classList.toggle('paused',document.hidden));
}
