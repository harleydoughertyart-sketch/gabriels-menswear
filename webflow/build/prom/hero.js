(() => {
 const root=document.querySelector('.wf-prom-hero');if(!root)return;
 const film=root.querySelector('video'),button=root.querySelector('[data-prom-video-toggle]'),header=document.querySelector('.gm-bar'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,visible=false,loaded=false,covered=false,frame=0;
 function sync(){const rect=film.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight&&rect.width>0&&!paused&&!covered&&!reduced.matches&&!document.hidden){const source=innerWidth<=700?film.dataset.mobile:film.dataset.desktop;if(film.getAttribute('src')!==source){film.src=source;film.load();loaded=true;}window.GMVideoLifecycle.set(film,true);}else window.GMVideoLifecycle.set(film,false);button.textContent=paused?'Play film':'Pause film';button.setAttribute('aria-pressed',String(paused));button.hidden=reduced.matches;}
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15}).observe(film);
 button.hidden=false;button.addEventListener('click',()=>{paused=!paused;sync();});document.addEventListener('visibilitychange',sync);addEventListener('pageshow',()=>{update();sync();});reduced.addEventListener('change',sync);
 matchMedia('(max-width:700px)').addEventListener('change',sync);
 function size(){document.body.style.setProperty('--prom-header',(header?.getBoundingClientRect().height||72)+'px');}if(header&&'ResizeObserver' in window)new ResizeObserver(size).observe(header);size();sync();
 const next=document.querySelector('.wf-prom-size'),stack=document.createElement('div');stack.className='wf-prom-takeover';root.before(stack);stack.append(root,next);
 const heroCopy=root.querySelector('.wf-prom-hero__copy'),reading=[...document.querySelectorAll('.wf-prom-size__copy,.wf-prom-gabriel__copy')];
 function update(){
  frame=0;sync();
  const enabled=!reduced.matches&&innerWidth>700;
  stack.classList.toggle('is-active',enabled);
  const y=next.getBoundingClientRect().top,ratio=Math.max(0,Math.min(1,1-y/innerHeight));
  root.querySelector('.wf-prom-hero__media').style.transform=enabled?'scale('+(1-.025*ratio)+')':'';
  const rect=heroCopy.getBoundingClientRect();
  heroCopy.style.opacity=enabled?String(Math.max(0,Math.min(1,(y-rect.top)/Math.max(1,rect.height)))):'';
  const c=y<=(header?.offsetHeight||72);if(c!==covered){covered=c;sync();}
  reading.forEach(el=>{el.style.opacity='1';});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});document.addEventListener('focusin',schedule);reduced.addEventListener('change',schedule);update();
})();
