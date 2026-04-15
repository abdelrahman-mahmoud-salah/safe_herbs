'use strict';

/* ── CURSOR ── */
const $cur  = document.getElementById('cur');
const $ring = document.getElementById('cur-ring');
let mx=0, my=0, rx=0, ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function cl(){ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; $cur.style.transform = `translate3d(${mx}px, ${my}px, 0)`; $ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`; requestAnimationFrame(cl); })();
document.querySelectorAll('a,button,.test-card,.photo-panel').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ $cur.style.width=$cur.style.height='16px'; $ring.style.width=$ring.style.height='56px'; });
  el.addEventListener('mouseleave',()=>{ $cur.style.width=$cur.style.height='8px';  $ring.style.width=$ring.style.height='36px'; });
});

/* ── NAV ── */
window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>60),{passive:true});

/* ── HAMBURGER ── */
let menuOpen=false;
function toggleMenu(){
  menuOpen=!menuOpen;
  document.getElementById('mobileMenu').classList.toggle('open',menuOpen);
  const[s0,s1,s2]=document.querySelectorAll('.hamburger span');
  s0.style.transform=menuOpen?'rotate(45deg) translate(4px,4px)':'';
  s1.style.opacity=menuOpen?'0':'1';
  s2.style.transform=menuOpen?'rotate(-45deg) translate(4px,-4px)':'';
}
function closeMobile(){
  menuOpen=false;
  document.getElementById('mobileMenu').classList.remove('open');
  document.querySelectorAll('.hamburger span').forEach(s=>{ s.style.transform=''; s.style.opacity='1'; });
}

/* ── SCROLL REVEAL ── */
const revealIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold:.08});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.check-item,.stat-cell,.test-card').forEach(el=>revealIO.observe(el));

/* ── CANVAS SYNC ── */
function sync(c){
  const dpr=window.devicePixelRatio||1, r=c.getBoundingClientRect();
  const cw=Math.round(r.width*dpr), ch=Math.round(r.height*dpr);
  if(c.width===cw&&c.height===ch) return;
  c.width=cw; c.height=ch; c.getContext('2d').scale(dpr,dpr);
}

/* ════════════════════════════════════════
   HERO CANVAS — microscope / lab aesthetic
   Petri-dish circles, scanning lines, organic particles
════════════════════════════════════════ */
(function initHero(){
  const canvas=document.getElementById('hero-canvas');
  const ctx=canvas.getContext('2d');
  let t=0;

  /* organic cell-like particles */
  const CELLS = Array.from({length:60},(_,i)=>({
    x:Math.random(), y:Math.random(),
    r:Math.random()*14+4,
    vx:(Math.random()-.5)*.0003,
    vy:(Math.random()-.5)*.0003,
    col:['rgba(107,140,107,','rgba(200,160,82,','rgba(90,130,70,'][i%3],
    al:Math.random()*.18+.04,
    phase:Math.random()*Math.PI*2
  }));

  function draw(){
    t+=.005; sync(canvas);
    const W=canvas.offsetWidth, H=canvas.offsetHeight;
    ctx.clearRect(0,0,W,H);

    /* deep green background */
    const bg=ctx.createRadialGradient(W*.5,H*.45,0,W*.5,H*.5,W*.9);
    bg.addColorStop(0,'#172412'); bg.addColorStop(.6,'#0d1a0a'); bg.addColorStop(1,'#060c04');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    /* large circle rings (microscope / petri) */
    [.18,.32,.48,.64].forEach((r,ri)=>{
      ctx.beginPath(); ctx.arc(W*.5,H*.45, r*Math.min(W,H), 0, Math.PI*2);
      ctx.strokeStyle=`rgba(107,140,107,${.06-.01*ri})`; ctx.lineWidth=.8; ctx.stroke();
    });

    /* rotating crosshair */
    const ang=t*.15;
    ctx.strokeStyle='rgba(200,160,82,.07)'; ctx.lineWidth=.7;
    [[ang,0],[ang+Math.PI*.5,0]].forEach(([a])=>{
      ctx.save(); ctx.translate(W*.5,H*.45); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-W*.8,0); ctx.lineTo(W*.8,0); ctx.stroke();
      ctx.restore();
    });

    /* horizontal scan line (lab scanner) */
    const scanY = (H*.1 + (Math.sin(t*.4)+1)*.5*H*.7);
    const sg=ctx.createLinearGradient(0,scanY-20,0,scanY+20);
    sg.addColorStop(0,'rgba(200,160,82,0)'); sg.addColorStop(.5,'rgba(200,160,82,.14)'); sg.addColorStop(1,'rgba(200,160,82,0)');
    ctx.fillStyle=sg; ctx.fillRect(0,scanY-20,W,40);

    /* organic cells */
    CELLS.forEach(c=>{
      c.x+=c.vx; c.y+=c.vy;
      if(c.x<-.1||c.x>1.1) c.vx*=-1;
      if(c.y<-.1||c.y>1.1) c.vy*=-1;
      const pulse=1+Math.sin(t*1.2+c.phase)*.12;
      ctx.beginPath(); ctx.arc(c.x*W,c.y*H,c.r*pulse,0,Math.PI*2);
      ctx.fillStyle=c.col+(c.al*pulse)+')'; ctx.fill();
      ctx.strokeStyle=c.col+(c.al*1.5+.02)+')'; ctx.lineWidth=.5; ctx.stroke();
    });

    /* bright centre glow */
    const cg=ctx.createRadialGradient(W*.5,H*.45,0,W*.5,H*.45,W*.18);
    cg.addColorStop(0,'rgba(200,160,82,.12)'); cg.addColorStop(1,'rgba(200,160,82,0)');
    ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);

    /* bottom vignette */
    const vg=ctx.createLinearGradient(0,H*.75,0,H);
    vg.addColorStop(0,'rgba(6,12,4,0)'); vg.addColorStop(1,'rgba(6,12,4,1)');
    ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ════════════════════════════════════════
   PIPELINE CANVAS — scroll-driven 7-step quality flow
   The driver div is 600vh tall; we map scroll progress 0→1
   to reveal each step with animated particles flowing
   along a conveyor-belt path.
════════════════════════════════════════ */
(function initPipeline(){
  const canvas=document.getElementById('pipeline-canvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const driver=document.getElementById('pipeline-driver');

  let t=0; /* autonomous tick for particle animation */

  const STEPS=[
    {label:'Arrival & Quarantine',  sub:'Raw material held pending lab results',   col:'#c8a052', icon:'🌿'},
    {label:'Sensory Inspection',    sub:'Visual, aroma & taste grading by QC team', col:'#6b8c6b', icon:'👁'},
    {label:'Lab Analysis',          sub:'External accredited laboratory testing',    col:'#8a9a5b', icon:'🔬'},
    {label:'Sieving & Gravity',     sub:'Dust, stone & foreign body removal',       col:'#c8a052', icon:'⚙'},
    {label:'Milling & Sizing',      sub:'Particle size matched to specification',   col:'#6b8c6b', icon:'⚡'},
    {label:'Colour Sorting',        sub:'Optical rejection of off-colour material', col:'#8a9a5b', icon:'✨'},
    {label:'Pack & Archive',        sub:'Final test — sample retained 2 years',     col:'#c8a052', icon:'📦'},
  ];

  /* particles flowing along the conveyor */
  const PARTICLES=Array.from({length:80},(_,i)=>({
    p:i/80,          /* normalised position along path 0→1 */
    speed:.0008+Math.random()*.0012,
    size:Math.random()*5+2,
    col:['#c8a052','#8ab870','#d4b870','#a0c060','#e2c07a'][i%5],
    al:Math.random()*.6+.2,
    wobble:Math.random()*Math.PI*2
  }));

  /* compute xy along a sinusoidal conveyor path */
  function pathXY(p, W, H){
    const margin=80;
    const x=margin + p*(W-margin*2);
    const y=H*.5 + Math.sin(p*Math.PI*2)*H*.18;
    return{x,y};
  }

  function getScrollProgress(){
    const rect=driver.getBoundingClientRect();
    const total=driver.offsetHeight - window.innerHeight;
    const scrolled=-rect.top;
    return Math.max(0,Math.min(1,scrolled/total));
  }

  function draw(){
    t+=.006; sync(canvas);
    const W=canvas.offsetWidth, H=canvas.offsetHeight;
    const progress=getScrollProgress();

    ctx.clearRect(0,0,W,H);

    /* background */
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#ede5d0'); bg.addColorStop(1,'#e5dcc6');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    /* subtle grid */
    ctx.strokeStyle='rgba(107,140,107,.07)'; ctx.lineWidth=.5;
    for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    /* ── CONVEYOR PATH ── */
    /* draw full path as dotted track */
    ctx.setLineDash([6,8]);
    ctx.strokeStyle='rgba(107,140,107,.2)'; ctx.lineWidth=1.5;
    ctx.beginPath();
    for(let s=0;s<=200;s++){
      const{x,y}=pathXY(s/200,W,H);
      if(s===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke(); ctx.setLineDash([]);

    /* ── PARTICLES ── */
    const visibleP=Math.min(1,progress*1.4);
    PARTICLES.forEach(p=>{
      p.p=(p.p+p.speed)%1;
      if(p.p>visibleP+.1) return;
      const{x,y}=pathXY(p.p,W,H);
      const wobX=Math.sin(t+p.wobble)*6;
      const wobY=Math.cos(t*.8+p.wobble)*4;
      ctx.save();
      ctx.globalAlpha=p.al*Math.min(1,(visibleP-p.p+.12)/.12);
      /* draw as leaf */
      ctx.translate(x+wobX,y+wobY);
      ctx.rotate(p.p*Math.PI*4+t*.3);
      ctx.fillStyle=p.col;
      ctx.beginPath();
      ctx.moveTo(0,-p.size);
      ctx.bezierCurveTo(p.size*.5,-p.size*.4,p.size*.5,p.size*.4,0,p.size);
      ctx.bezierCurveTo(-p.size*.5,p.size*.4,-p.size*.5,-p.size*.4,0,-p.size);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha=1;

    /* ── STEP NODES ── */
    STEPS.forEach((step,i)=>{
      const sp=(i+.5)/STEPS.length;
      const{x,y}=pathXY(sp,W,H);
      const activated=progress>=(i/STEPS.length)-.02;
      const alpha=activated?1:.25;
      const scale=activated?(1+Math.sin(t*2+i)*.04):0.85;

      /* connecting ring pulse */
      if(activated){
        const pulse=1+Math.sin(t*2+i)*.35;
        ctx.beginPath(); ctx.arc(x,y,32*pulse,0,Math.PI*2);
        ctx.fillStyle=`rgba(200,160,82,.07)`; ctx.fill();
      }

      /* node circle */
      ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
      ctx.beginPath(); ctx.arc(0,0,26,0,Math.PI*2);
      ctx.fillStyle=activated?step.col:'rgba(107,140,107,.2)';
      ctx.globalAlpha=alpha; ctx.fill();
      ctx.strokeStyle=activated?'rgba(255,255,255,.4)':'rgba(107,140,107,.3)';
      ctx.lineWidth=1.5; ctx.stroke();

      /* step number */
      ctx.fillStyle=activated?'#fff':'rgba(30,35,24,.4)';
      ctx.font=`500 11px 'Jost',sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(String(i+1).padStart(2,'0'),0,0);
      ctx.restore(); ctx.globalAlpha=1;

      /* label above/below alternating */
      const above=i%2===0;
      const labelY=above? y-52 : y+52;
      ctx.globalAlpha=alpha;

      /* label bg pill */
      const labelW=Math.min(W*.22,180);
      const lx=Math.max(labelW/2+10, Math.min(W-labelW/2-10, x));
      ctx.fillStyle=activated?'rgba(30,35,24,.9)':'rgba(30,35,24,.3)';
      ctx.beginPath();
      ctx.roundRect(lx-labelW/2, labelY-22, labelW, 44, 6);
      ctx.fill();

      ctx.fillStyle=activated?'rgba(245,240,232,.95)':'rgba(245,240,232,.35)';
      ctx.font=`500 9.5px 'Jost',sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(step.label.toUpperCase(), lx, labelY-7);
      ctx.fillStyle=activated?'rgba(200,160,82,.9)':'rgba(200,160,82,.3)';
      ctx.font=`300 9px 'Jost',sans-serif`;
      ctx.fillText(step.sub, lx, labelY+9);

      /* connector line from node to label */
      ctx.strokeStyle=activated?step.col+'88':'rgba(107,140,107,.2)';
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(x, above?y-28:y+28);
      ctx.lineTo(x, above?labelY+22:labelY-22);
      ctx.stroke();

      ctx.textAlign='left'; ctx.globalAlpha=1;
    });

    /* progress percentage label */
    ctx.fillStyle='rgba(30,35,24,.35)';
    ctx.font=`300 11px 'Jost',sans-serif`;
    ctx.textAlign='right';
    ctx.fillText(`${Math.round(progress*100)}% complete`,W-24,H-20);
    ctx.textAlign='left';

    requestAnimationFrame(draw);
  }
  draw();
})();