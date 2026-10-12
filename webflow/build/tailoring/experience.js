(() => {
 const root = document.querySelector('.wf-tailoring-experience');
 if (!root) return;
 const beats = [...root.querySelectorAll('.wf-tailoring-experience__beat')];
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const fine = matchMedia('(hover:hover) and (pointer:fine)');
 const clamp = n => Math.max(0, Math.min(1, n));
 let frame = 0;
 function update() {
  frame = 0;
  const header = document.querySelector('header');
  const top = header ? Math.max(0, header.getBoundingClientRect().bottom) : 80;
  root.style.setProperty('--experience-top', top + 'px');
  const enabled = !reduced.matches && innerHeight > 650;
  root.classList.toggle('is-sequenced', enabled);
  const room = innerHeight - top;
  beats.forEach((beat, index) => {
   // Accommodate enlarged text if a card grows beyond the available height.
   beat.style.setProperty('--beat-top', (top - Math.max(0, beat.offsetHeight - room)) + 'px');
   const next = beats[index + 1]?.getBoundingClientRect();
   const covered = next ? clamp((room - (next.top - top)) / room) : 0;
   beat.style.setProperty('--copy-opacity', 1);
   const img = beat.querySelector('img');
   img.style.transform = enabled && fine.matches ? 'scale(' + (1.03 - .03 * covered) + ')' : '';
  });
 }
 function schedule() { if (!frame) frame = requestAnimationFrame(update); }
 addEventListener('scroll', schedule, {passive:true});
 addEventListener('resize', schedule, {passive:true});
 reduced.addEventListener('change', schedule);
 update();
})();
