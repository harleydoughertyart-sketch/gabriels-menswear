(() => {
function init() {
 document.querySelectorAll('[data-review-rail]').forEach(rail => {
  if(rail.dataset.ready) return; rail.dataset.ready='true';
  const track=rail.querySelector('.gm-review-rail__track'), items=[...track.children];
  const controls=rail.querySelector('.gm-review-rail__controls'), toggle=rail.querySelector('[data-review-toggle]'), status=rail.querySelector('[data-review-status]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=matchMedia('(min-width: 861px)');
  const fits=()=>desktop.matches&&track.scrollWidth<=track.clientWidth+2;
  let index=0, targetIndex=0, paused=reduced.matches, visible=false, hovering=false, focused=false, timer;
  controls.hidden=false;
  function update(){toggle.textContent=paused?'Play':'Pause';toggle.setAttribute('aria-label',paused?'Play review panning':'Pause review panning');status.textContent=(index+1)+' / '+items.length;}
  function schedule(){clearTimeout(timer); if(fits()||paused||!visible||hovering||focused||document.hidden||reduced.matches)return;timer=setTimeout(()=>{go((index+1)%items.length);schedule();},8000);}
  function layout(){controls.hidden=fits();if(fits()){index=targetIndex=0;track.scrollLeft=0;}update();schedule();}
  function go(next,instant=false){targetIndex=(next+items.length)%items.length;index=targetIndex;track.scrollTo({left:targetIndex*track.clientWidth,behavior:reduced.matches||instant?'instant':'smooth'});update();}
  rail.querySelector('[data-review-prev]').addEventListener('click',event=>{paused=true;go(targetIndex-1,event.detail===0);schedule()});
  rail.querySelector('[data-review-next]').addEventListener('click',event=>{paused=true;go(targetIndex+1,event.detail===0);schedule()});
  toggle.addEventListener('click',()=>{paused=!paused;update();schedule()});
  track.addEventListener('scroll',()=>{index=Math.round(track.scrollLeft/track.clientWidth);update()},{passive:true});
  track.addEventListener('scrollend',()=>{targetIndex=index},{passive:true});
  function interrupt(){paused=true;targetIndex=index=Math.round(track.scrollLeft/track.clientWidth);update();schedule();}
  track.addEventListener('pointerdown',interrupt,{passive:true});
  track.addEventListener('wheel',interrupt,{passive:true});
  // Only deliberate pointer movement pauses a review, not scrolling it under a parked cursor.
  track.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){hovering=true;schedule()}});track.addEventListener('pointerleave',()=>{hovering=false;schedule()});
  rail.addEventListener('focusin',()=>{focused=true;schedule()});rail.addEventListener('focusout',()=>{setTimeout(()=>{focused=rail.contains(document.activeElement);schedule()},0)});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{paused=reduced.matches;update();schedule()});
  desktop.addEventListener('change',layout);
  new ResizeObserver(layout).observe(track);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:.3}).observe(rail);
  update();
 });
 const marquee=document.querySelector('.gm-reviews-track[data-cloned]');
 if(marquee&&!marquee.dataset.controls){
  marquee.dataset.controls='true';
  const strip=marquee.closest('.gm-reviews-strip'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const button=document.createElement('button');button.type='button';button.className='gm-marquee-toggle';button.textContent='Pause reviews';
  strip.insertAdjacentElement('afterend',button);
  let paused=false,visible=false,hovering=false,focused=false;
  function sync(){marquee.style.animationPlayState=paused||!visible||hovering||focused||document.hidden||reduced.matches?'paused':'running';button.textContent=paused?'Play reviews':'Pause reviews';button.hidden=reduced.matches;}
  button.addEventListener('click',()=>{paused=!paused;sync()});
  strip.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){hovering=true;sync()}});strip.addEventListener('pointerleave',()=>{hovering=false;sync()});
  strip.addEventListener('focusin',()=>{focused=true;sync()});strip.addEventListener('focusout',()=>{focused=false;sync()});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()}).observe(strip);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
