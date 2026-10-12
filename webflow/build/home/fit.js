(() => {
 const root = document.querySelector('.wf-home-fit');
 if (!root) return;
 const steps = [...root.querySelectorAll('[data-fit-step]')];
 const films = [...root.querySelectorAll('[data-fit-film]')];
 const motion = matchMedia('(min-width: 851px) and (prefers-reduced-motion: no-preference)');
 let active = 0, frame = 0, manualUntilScroll = null;
 const select = (index) => {
  if (active === index) return;
  active = index;
  steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  films.forEach((film, i) => {
   film.hidden = i !== index;
   const video = film.querySelector('video');
   if (i !== index) video.pause();
   else if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden && !root.querySelector('[data-gm-video-toggle][aria-pressed="true"]')) {
    if (!video.getAttribute('src') && video.dataset.src) video.src = video.dataset.src;
    video.play().catch(() => {});
   }
  });
 };
 steps.forEach((button, i) => button.addEventListener('click', () => { manualUntilScroll = scrollY; select(i); }));
 const update = () => {
  frame = 0;
  if (!motion.matches) return;
  if (manualUntilScroll !== null && Math.abs(scrollY - manualUntilScroll) < 90) return;
  manualUntilScroll = null;
  const rect = root.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) return;
  const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, root.offsetHeight - innerHeight)));
  select(Math.min(2, Math.floor(progress * 3)));
 };
 addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
 motion.addEventListener('change', update);
})();
