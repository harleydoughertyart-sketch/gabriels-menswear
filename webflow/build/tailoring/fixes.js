(() => {
 const root = document.querySelector('.wf-tailoring-fixes');
 if (!root) return;
 root.querySelectorAll('[data-adjust]').forEach(input => {
  const key = input.dataset.adjust;
  const specimen = input.closest('[data-specimen]');
  const drawing = specimen.querySelector('[data-move]');
  const control = input.closest('.wf-tailoring-fixes-control');
  const output = control.querySelector('output');
  const reset = control.querySelector('button');
  output.setAttribute('for',input.id);
  // Native range feedback announces the value; the visible output avoids a duplicate live announcement.
  output.setAttribute('aria-live','off');
  reset.setAttribute('aria-label','Reset ' + key + ' illustration');
  const update = () => {
   const amount = Number(input.value) / 100;
   drawing.style.transform = key === 'waist' ? 'scaleX(' + (1.1 - amount * .2) + ')' : 'translateY(' + ((.5 - amount) * 60) + 'px)';
   const label = key === 'waist' ? (amount < .34 ? 'More room' : amount > .66 ? 'Closer' : 'Medium') : (amount < .34 ? 'Longer' : amount > .66 ? 'Shorter' : 'Medium');
   output.value = label;
   input.setAttribute('aria-valuetext',label + ' ' + key + ' illustration');
   input.style.setProperty('--range-progress',input.value + '%');
   reset.disabled = Number(input.value) === 50;
  };
  control.hidden = false;
  input.addEventListener('input',update);
  reset.addEventListener('click',() => {
   input.value = 50;
   update();
   input.focus({preventScroll:true});
  });
  update();
 });
})();
