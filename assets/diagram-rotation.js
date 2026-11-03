document.querySelectorAll('[data-visual-switcher]').forEach(switcher=>{
  const slides=[...switcher.querySelectorAll('[data-visual-slide]')];
  const controls=[...switcher.querySelectorAll('[data-visual-trigger]')];
  if(slides.length<2||controls.length<2)return;
  const interval=Number(switcher.dataset.interval)||5000;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let active=Math.max(0,slides.findIndex(slide=>slide.classList.contains('is-active')));
  let timer=null,transitionTimer=null,focused=false,transitioning=false;
  const stop=()=>{window.clearTimeout(timer);timer=null};
  const schedule=()=>{
    stop();
    if(focused||document.hidden||transitioning)return;
    timer=window.setTimeout(()=>show((active+1)%slides.length),interval);
  };
  const updateControls=index=>controls.forEach((control,i)=>{
    const selected=i===index;
    control.classList.toggle('is-active',selected);
    control.setAttribute('aria-pressed',String(selected));
  });
  const show=index=>{
    index=(index+slides.length)%slides.length;
    if(index===active||transitioning){schedule();return}
    stop();
    transitioning=true;
    const previous=slides[active],next=slides[index];
    previous.classList.remove('is-active');
    previous.classList.add('is-leaving');
    previous.setAttribute('aria-hidden','true');
    previous.inert=true;
    const delay=reduceMotion.matches?0:450;
    transitionTimer=window.setTimeout(()=>{
      previous.classList.remove('is-leaving');
      next.classList.add('is-active');
      next.setAttribute('aria-hidden','false');
      next.inert=false;
      active=index;
      updateControls(active);
      transitioning=false;
      schedule();
    },delay);
  };
  slides.forEach((slide,i)=>{
    const selected=i===active;
    slide.setAttribute('aria-hidden',String(!selected));
    slide.inert=!selected;
  });
  updateControls(active);
  controls.forEach(control=>control.addEventListener('click',()=>show(Number(control.dataset.visualTrigger))));
  switcher.addEventListener('focusin',()=>{focused=true;stop()});
  switcher.addEventListener('focusout',event=>{
    if(!switcher.contains(event.relatedTarget)){focused=false;schedule()}
  });
  document.addEventListener('visibilitychange',schedule);
  schedule();
});
