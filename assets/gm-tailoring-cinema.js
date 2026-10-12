/* Native document scrolling supplies the takeover; no wheel interception. */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('gm-premium--tailoring')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  // One-time, small entrances keep the reading order clear on a phone.
  // Content is visible by default, including without JS and in reduced motion.
  if ('IntersectionObserver' in window) {
    const copy = document.querySelectorAll('.wf-tailoring-gabriel__copy > *, .wf-tailoring-reviews__figure > *, .wf-tailoring-visit__heading > *, .wf-tailoring-visit__faq > h3');
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('gm-copy-visible'); reveal.unobserve(entry.target); }
    }), {threshold: .12, rootMargin:'0px 0px -28px 0px'});
    copy.forEach((el) => { el.classList.add('gm-mobile-copy'); reveal.observe(el); });
  }
  const pairs = [['top', 'fixes'], ['fitting', 'gabriel']].map(([out, incoming]) => {
    const panel = document.getElementById(out), cover = document.getElementById(incoming);
    if (!panel || !cover) return null;
    const stack = document.createElement('div');
    stack.className = 'gm-cinema-stack';
    panel.before(stack); stack.append(panel, cover);
    panel.classList.add('gm-cinema-outgoing');
    cover.classList.add('gm-cinema-incoming');
    return { panel, cover, surface: panel.querySelector('.gm-takeover-surface'), film: panel.querySelector('video') };
  }).filter(Boolean);
  let frame = 0;
  function update() {
    frame = 0;
    const height = innerHeight;
    let playbackChanged = false;
    pairs.forEach(({panel, cover, surface, film}) => {
      const top = cover.getBoundingClientRect().top;
      const progress = reduced.matches ? 0 : Math.max(0, Math.min(1, 1 - top / height));
      panel.style.setProperty('--gm-stick-top', `${Math.min(0, height - panel.offsetHeight)}px`);
      surface.style.setProperty('--gm-cinema-scale', 1 - .025 * progress);
      surface.style.setProperty('--gm-cinema-dim', .16 * progress);
      if (film && film.dataset.cinemaCovered !== String(top <= 1)) {
        film.dataset.cinemaCovered = String(top <= 1); playbackChanged = true;
      }
    });
    const opening = pairs[0];
    document.body.classList.toggle('gm-cinema-opening', !!opening && opening.cover.getBoundingClientRect().top > 80);
    if (playbackChanged) window.GMPremium?.syncMedia();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  document.querySelectorAll('[data-cinema-media]').forEach(media => {
    const stage = media.closest('.gm-takeover-surface');
    stage.addEventListener('pointermove', event => {
      if (reduced.matches || !fine.matches) return;
      const rect = stage.getBoundingClientRect();
      media.style.setProperty('--gm-pointer-x', `${((event.clientX - rect.left) / rect.width - .5) * 16}px`);
      media.style.setProperty('--gm-pointer-y', `${((event.clientY - rect.top) / rect.height - .5) * 16}px`);
    }, {passive:true});
    stage.addEventListener('pointerleave', () => {
      media.style.setProperty('--gm-pointer-x', '0px'); media.style.setProperty('--gm-pointer-y', '0px');
    });
  });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', schedule);
  update();
});
