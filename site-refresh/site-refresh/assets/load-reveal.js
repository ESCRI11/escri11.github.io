// load-reveal.js — staggered fade-up of .reveal blocks on load. Vanilla IIFE.

// ---- staggered load reveal ----
(function(){
  const els=[...document.querySelectorAll('.reveal')];
  els.forEach((el,i)=>setTimeout(()=>el.classList.add('in'), 120+i*90));
})();
