(() => {
 const root=document.querySelector('.wf-prom-fitting');if(!root)return;
 const radios=[...root.querySelectorAll('input[type=radio]')],panels=[...root.querySelectorAll('[data-start]')],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function update(animate=false){const selected=radios.find(r=>r.checked).value;root.dataset.selection=selected;panels.forEach(panel=>{panel.hidden=panel.dataset.start!==selected;if(!panel.hidden&&animate&&!reduced.matches)panel.animate([{opacity:.4},{opacity:1}],{duration:180,easing:'cubic-bezier(.23,1,.32,1)'});});}
 root.classList.add('is-interactive');root.querySelector('fieldset').hidden=false;radios.forEach(r=>r.addEventListener('change',()=>update(true)));update();

 const heading=root.querySelector('.wf-prom-fitting__heading');
 function layout(){const active=panels.find(p=>!p.hidden),answer=active?.querySelector('.wf-prom-fitting__answer');if(!answer)return;const top=Math.max(40,(root.clientHeight-heading.offsetHeight-answer.offsetHeight)/2);root.style.setProperty('--choice-top',top+'px');root.style.setProperty('--choice-answer-top',(top+heading.offsetHeight)+'px');}
 const observer=new ResizeObserver(layout);observer.observe(heading);observer.observe(root);panels.forEach(p=>observer.observe(p.querySelector('.wf-prom-fitting__answer')));root.addEventListener('click',()=>requestAnimationFrame(layout));root.addEventListener('change',()=>requestAnimationFrame(layout));document.fonts.ready.then(layout);layout();
})();
