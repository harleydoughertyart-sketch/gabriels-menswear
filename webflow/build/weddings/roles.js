(() => {
 const root=document.querySelector('.wf-weddings-roles');if(!root)return;
 const tabs=[...root.querySelectorAll('[role=tab]')],panels=[...root.querySelectorAll('.wf-weddings-roles__panel')],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function select(index,keyboard=false,animate=false){
  tabs.forEach((tab,i)=>{const active=i===index;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;panels[i].hidden=!active;});
  if(keyboard)tabs[index].focus();
  if(animate&&!reduced.matches)panels[index].animate([{opacity:.3},{opacity:1}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});
 }
 panels.forEach((panel,i)=>{panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tabs[i].id);});
 tabs.forEach((tab,i)=>tab.addEventListener('click',()=>select(i,false,true)));
 root.querySelector('[role=tablist]').addEventListener('keydown',event=>{const current=tabs.indexOf(document.activeElement);if(current<0)return;const next=event.key==='ArrowRight'?(current+1)%tabs.length:event.key==='ArrowLeft'?(current+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:-1;if(next<0)return;event.preventDefault();select(next,true);});
 root.classList.add('is-interactive');root.querySelector('[role=tablist]').hidden=false;select(0);


 const heading=root.querySelector('.wf-weddings-roles__heading');
 function layout(){const active=panels.find(p=>!p.hidden),answer=active?.querySelector('.wf-weddings-roles__answer');if(!answer)return;const top=Math.max(40,(root.clientHeight-heading.offsetHeight-answer.offsetHeight)/2);root.style.setProperty('--choice-top',top+'px');root.style.setProperty('--choice-answer-top',(top+heading.offsetHeight)+'px');}
 const observer=new ResizeObserver(layout);observer.observe(heading);observer.observe(root);panels.forEach(p=>observer.observe(p.querySelector('.wf-weddings-roles__answer')));root.addEventListener('click',()=>requestAnimationFrame(layout));root.addEventListener('change',()=>requestAnimationFrame(layout));document.fonts.ready.then(layout);layout();
})();
