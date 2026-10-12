/* Service-only enhancement. gm-site.js alone mounts ScrollCraft and analytics. */
document.addEventListener('DOMContentLoaded', () => {
 const body = document.body;
 if (!body.classList.contains('gm-premium')) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const header = document.querySelector('.gm-bar');
 if (header && 'ResizeObserver' in window) new ResizeObserver(() => {
  body.style.setProperty('--gm-bar-h', `${header.offsetHeight}px`);
 }).observe(header);
 const videos = [...document.querySelectorAll('video[data-gm-video],video.gm-roll')].filter(v => !v.hasAttribute('data-sc-scrub'));
 const paused = new WeakSet();
 function hydrate(v) {
  if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; }
  if (v.dataset.src) { v.src = v.dataset.src; delete v.dataset.src; v.load(); }
 }
 function syncMedia() {
  videos.forEach(v => {
   const rect=v.getBoundingClientRect();
   const wanted=!document.hidden&&!reduced.matches&&!paused.has(v)&&rect.width>0&&rect.bottom>0&&rect.top<innerHeight&&v.dataset.cinemaCovered!=='true';
   if(wanted)hydrate(v);
   window.GMVideoLifecycle.set(v,wanted);
  });
 }
 if ('IntersectionObserver' in window) {
  const warm = new IntersectionObserver(entries => entries.forEach(e => {
   if (e.isIntersecting && !reduced.matches) { hydrate(e.target); warm.unobserve(e.target); }
  }), { rootMargin: '450px' });
  const watcher = new IntersectionObserver(entries => {
   syncMedia();
  }, { threshold: .05 });
  videos.forEach(v => { v.autoplay = false; warm.observe(v); watcher.observe(v); });
  const reveals = new IntersectionObserver(entries => entries.forEach(e => {
   if (e.isIntersecting) { e.target.classList.add('gm-is-visible'); reveals.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll('[data-gm-reveal],[data-gm-draw]').forEach(el => {
   if (el.hasAttribute('data-gm-draw') && typeof el.getTotalLength === 'function') el.style.setProperty('--gm-path-length', el.getTotalLength());
   reveals.observe(el);
  });
  body.classList.add('gm-premium-ready');
 } else videos.forEach(hydrate);
 document.querySelectorAll('[data-gm-video-toggle]').forEach(button => {
  const scope = button.closest('section') || document;
  const owned = videos.filter(v => scope.contains(v));
  button.setAttribute('aria-pressed','false');
  button.addEventListener('click', () => {
   const stop = button.getAttribute('aria-pressed') !== 'true';
   owned.forEach(v => stop ? paused.add(v) : paused.delete(v));
   button.setAttribute('aria-pressed', String(stop));
   button.textContent = stop ? 'Play videos' : 'Pause videos'; syncMedia();
  });
 });
 document.addEventListener('visibilitychange', syncMedia);
 addEventListener('pageshow',syncMedia);
 let mediaFrame=0;function scheduleMedia(){if(!mediaFrame)mediaFrame=requestAnimationFrame(()=>{mediaFrame=0;syncMedia();});}
 addEventListener('scroll',scheduleMedia,{passive:true});addEventListener('resize',scheduleMedia,{passive:true});
 reduced.addEventListener('change', syncMedia);
 const menu = document.querySelector('.gm-nav__toggle');
 if (menu) {
  menu.addEventListener('click', () => {
   if (menu.getAttribute('aria-expanded') === 'true') document.querySelector('.gm-nav__list a')?.focus();
  });
 }
 // Optional chapter navigation observes sections; it never intercepts wheel/touch.
 const chapters = [...document.querySelectorAll('[data-gm-chapters] a[href^="#"]')];
 if (chapters.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
   if (!e.isIntersecting) return;
   chapters.forEach(a => {
    if (a.hash === '#' + e.target.id) a.setAttribute('aria-current','location');
    else a.removeAttribute('aria-current');
   });
  }), { rootMargin: '-20% 0px -55% 0px' });
  chapters.forEach(a => { const target = document.getElementById(a.hash.slice(1)); if(target) observer.observe(target); });
 }
 window.GMPremium = Object.freeze({ syncMedia });
});

