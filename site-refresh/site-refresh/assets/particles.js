// particles.js — L2 drifting pointillist field (no connecting lines). Vanilla IIFE.
// Requires a fixed full-viewport <canvas id="dots"> behind content. Honors prefers-reduced-motion.

// ---- L2 drifting particle field (no connecting lines) ----
(function(){
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = document.getElementById('dots'), x = c.getContext('2d');
  let w,h,dpr,parts,mouse={x:-999,y:-999};
  function size(){
    dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth; h=innerHeight; c.width=w*dpr; c.height=h*dpr; x.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.min(140, Math.floor(w*h/14000));
    parts=Array.from({length:n},(_, i)=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*0.12, vy:(Math.random()-.5)*0.12,
      r:0.5+Math.random()*1.1,
      base:0.04+Math.random()*0.14, amp:0.03+Math.random()*0.05,
      ph:Math.random()*6.28, sp:0.0006+Math.random()*0.0009,
      sig:Math.random()<0.06
    }));
  }
  let t=0;
  function frame(){
    t+=16; x.clearRect(0,0,w,h);
    for(const p of parts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x+=w; if(p.x>w)p.x-=w; if(p.y<0)p.y+=h; if(p.y>h)p.y-=h;
      const dx=p.x-mouse.x, dy=p.y-mouse.y, d2=dx*dx+dy*dy;
      let ox=0,oy=0;
      if(d2<120*120){const d=Math.sqrt(d2)||1, f=(1-d/120)*12; ox=dx/d*f; oy=dy/d*f;}
      const o=p.base+Math.sin(t*p.sp+p.ph)*p.amp;
      x.beginPath(); x.arc(p.x+ox,p.y+oy,p.r,0,6.28);
      if(p.sig){x.fillStyle='rgba(114,222,194,'+Math.min(0.5,o*2.6)+')'; x.shadowColor='rgba(114,222,194,0.7)'; x.shadowBlur=4;}
      else{x.fillStyle='rgba(232,234,237,'+o+')'; x.shadowBlur=0;}
      x.fill();
    }
    x.shadowBlur=0; raf=requestAnimationFrame(frame);
  }
  let raf;
  addEventListener('resize',size);
  addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  addEventListener('mouseout',()=>{mouse.x=-999;mouse.y=-999;});
  document.addEventListener('visibilitychange',()=>{document.hidden?cancelAnimationFrame(raf):raf=requestAnimationFrame(frame);});
  size();
  if(rm){/* one static frame */ t=0; x.clearRect(0,0,w,h); for(const p of parts){x.beginPath();x.arc(p.x,p.y,p.r,0,6.28);x.fillStyle='rgba(232,234,237,'+p.base+')';x.fill();}}
  else raf=requestAnimationFrame(frame);
})();
