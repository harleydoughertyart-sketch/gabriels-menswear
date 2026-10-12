(() => {
  const root = document.querySelector('.wf-tailoring-fitting');
  if (!root) return;
  const video = root.querySelector('video');
  const mobile = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Runs before the shared lifecycle hydrates the lazy source.
  if (mobile.matches) {
    video.dataset.src = video.dataset.srcMobile;
    video.dataset.poster = video.dataset.posterMobile;
    video.poster = video.dataset.poster;
  }
  const steps = [...root.querySelectorAll('[data-fitting-step]')];
  const surface = root.querySelector('.wf-tailoring-fitting-surface');
  const marks = [...root.querySelectorAll('.wf-tailoring-fitting-progress span')];
  let frame = 0;
  let current = -1;
  function update() {
    frame = 0;
    const enabled = !reduced.matches && innerHeight >= 620;
    root.classList.toggle('is-sequenced', enabled);
    if (!enabled) { current = -1; return; }
    const rect = root.getBoundingClientRect();
    const travel = Math.max(1, rect.height - surface.offsetHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    const next = Math.min(2, Math.floor(progress * 3));
    if (next === current) return;
    current = next;
    steps.forEach((step, index) => step.classList.toggle('is-current', index === next));
    marks.forEach((mark, index) => mark.classList.toggle('is-current', index === next));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  mobile.addEventListener('change', schedule);
  reduced.addEventListener('change', schedule);
  update();
})();
