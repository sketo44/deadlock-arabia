const header=document.querySelector('.mast'),toggle=header.querySelector('.draft-menu-toggle'),nav=header.querySelector('.draft-site-nav');
const small=matchMedia('(max-width:900px)');
function close(){toggle.setAttribute('aria-expanded','false');nav.dataset.open='false';nav.hidden=small.matches;nav.inert=small.matches}
function sync(){close()}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.dataset.open=String(open);nav.hidden=!open;nav.inert=!open});
header.addEventListener('keydown',e=>{if(e.key==='Escape'){close();toggle.focus()}});
nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});
document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))close()});
window.addEventListener('hashchange',close);small.addEventListener('change',sync);sync();
