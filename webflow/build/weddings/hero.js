/* Weddings owns this lifecycle; frozen site helpers remain untouched. */
(() => {
 const root=document.querySelector('.wf-weddings-hero');
 if(!root)return;
 const video=root.querySelector('video'),toggle=root.querySelector('[data-wedding-video-toggle]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,covered=false;
 function sync(){
  const rect=video.getBoundingClientRect();
   const canPlay=rect.bottom>0&&rect.top<innerHeight&&rect.width>0&&!covered&&!paused&&!reduced.matches&&!document.hidden;
  if(canPlay){
   const source=innerWidth<=700?video.dataset.mobile:video.dataset.desktop;
   if(video.getAttribute('src')!==source){video.src=source;video.load();}
   window.GMVideoLifecycle.set(video,true);
  }else window.GMVideoLifecycle.set(video,false);
  toggle.textContent=paused?'Play film':'Pause film';
  toggle.setAttribute('aria-pressed',String(paused));
  toggle.hidden=reduced.matches;
 }
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{sync();},{threshold:.15}).observe(video);
 toggle.hidden=false;toggle.addEventListener('click',()=>{paused=!paused;sync();});
 document.addEventListener('visibilitychange',sync);addEventListener('pageshow',sync);reduced.addEventListener('change',sync);
 matchMedia('(max-width:700px)').addEventListener('change',sync);
 const header=document.querySelector('.gm-bar');
 function headerSize(){document.body.style.setProperty('--wedding-header',(header?.offsetHeight||72)+'px');}
 if(header&&'ResizeObserver' in window)new ResizeObserver(headerSize).observe(header);headerSize();sync();
 const roles=document.querySelector('.wf-weddings-roles');
 if(roles){
  const incoming=document.querySelector('.wf-weddings-steps')||roles;
  const stack=document.createElement('div');stack.className='wf-weddings-takeover';root.before(stack);stack.append(root,incoming);
  let frame=0;
  const reading=[...document.querySelectorAll('.wf-weddings-steps__copy,.wf-weddings-gabriel__copy,.wf-weddings-reviews figure')];
  function update(){
   frame=0;sync();const enabled=!reduced.matches&&innerWidth>700;
   stack.classList.toggle('is-active',enabled);
   const y=incoming.getBoundingClientRect().top,ratio=Math.max(0,Math.min(1,1-y/innerHeight));
   root.querySelector('.wf-weddings-hero__media').style.transform=enabled?'scale('+(1-.025*ratio)+')':'';
   const copy=root.querySelector('.wf-weddings-hero__copy'),copyRect=copy.getBoundingClientRect();
   copy.style.opacity=enabled?String(Math.max(0,Math.min(1,(y-copyRect.top)/Math.max(1,copyRect.height)))):'';
   roles.querySelector('.wf-weddings-roles__heading').style.opacity='1';
   const nextCovered=y<=(header?.offsetHeight||72);if(nextCovered!==covered){covered=nextCovered;sync();}
   reading.forEach(el=>{el.style.opacity='1';});
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});document.addEventListener('focusin',schedule);reduced.addEventListener('change',schedule);update();
 }
})();

