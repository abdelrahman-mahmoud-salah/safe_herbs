'use strict';

/* ── CURSOR ── */
const $cur = document.getElementById('cur');
const $ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function cursorLoop() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  $cur.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  $ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  requestAnimationFrame(cursorLoop);
})();
document.querySelectorAll('a, button, .farm-block, .legend-item').forEach(el => {
  el.addEventListener('mouseenter', () => { $cur.style.width = $cur.style.height = '16px'; $ring.style.width = $ring.style.height = '56px'; });
  el.addEventListener('mouseleave', () => { $cur.style.width = $cur.style.height = '8px';  $ring.style.width = $ring.style.height = '36px'; });
});

/* ── NAV SCROLL ── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── HAMBURGER ── */
let menuOpen = false;
function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('mobileMenu').classList.toggle('open', menuOpen);
  const [s0,s1,s2] = document.querySelectorAll('.hamburger span');
  s0.style.transform = menuOpen ? 'rotate(45deg) translate(4px,4px)'  : '';
  s1.style.opacity   = menuOpen ? '0' : '1';
  s2.style.transform = menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : '';
}
function closeMobile() {
  menuOpen = false;
  document.getElementById('mobileMenu').classList.remove('open');
  document.querySelectorAll('.hamburger span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
}

/* ── SCROLL REVEAL ── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.stat-item,.soil-feature').forEach(el => revealIO.observe(el));

/* ── CANVAS RESIZE HELPER ── */
function syncCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const r   = canvas.getBoundingClientRect();
  const cw  = Math.round(r.width  * dpr);
  const ch  = Math.round(r.height * dpr);
  if (canvas.width === cw && canvas.height === ch) return;
  canvas.width  = cw;
  canvas.height = ch;
  canvas.getContext('2d').scale(dpr, dpr);
}

/* ════════════════════════════════════════
   HERO CANVAS — aerial field view
════════════════════════════════════════ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let t = 0;

  // field row constants
  const ROWS   = 28;
  const COLORS = ['#2a4a20','#305428','#244018','#3a5c2a','#1e3614'];

  function draw() {
    t += 0.004;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * .5);
    sky.addColorStop(0, '#0e1c0a');
    sky.addColorStop(1, '#1e3614');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // aerial farm rows (perspective)
    for (let i = 0; i < ROWS; i++) {
      const y   = H * .35 + (i / ROWS) * H * .65;
      const wid = W * (.1 + (i / ROWS) * .9);
      const x0  = (W - wid) / 2;
      const h   = (H * .65 / ROWS) * .72;
      const wave = Math.sin(t + i * .3) * (i / ROWS) * 6;
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.globalAlpha = .55 + (i / ROWS) * .35;
      ctx.beginPath();
      ctx.moveTo(x0, y + wave);
      ctx.lineTo(x0 + wid, y + wave);
      ctx.lineTo(x0 + wid - (wid * .02), y + h + wave);
      ctx.lineTo(x0 + (wid * .02), y + h + wave);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Nile canal running through
    ctx.strokeStyle = 'rgba(60,130,180,.45)';
    ctx.lineWidth = 3 + Math.sin(t * .5) * .5;
    ctx.beginPath();
    ctx.moveTo(W * .48, H * .35);
    ctx.bezierCurveTo(W * .5, H * .55, W * .49, H * .72, W * .51, H);
    ctx.stroke();

    // floating particles
    for (let i = 0; i < 20; i++) {
      const px = W * (.1 + ((i / 20 + t * .012) % .9));
      const py = H * (.15 + Math.sin(t * .4 + i * .8) * .08);
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,160,82,.5)'; ctx.fill();
    }

    // vignette
    const vig = ctx.createRadialGradient(W*.5, H*.5, H*.2, W*.5, H*.5, H*.9);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ════════════════════════════════════════
   MAP CANVAS — Egypt farm map
════════════════════════════════════════ */
(function initMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const FARMS = [
    { name:'Fayoum',    x:.42, y:.48, col:'#c8a052', r:8,  label:'195 ha' },
    { name:'Beni Suef', x:.46, y:.56, col:'#6b8c6b', r:9,  label:'213 ha' },
    { name:'Al Minia',  x:.48, y:.63, col:'#6b8c6b', r:7,  label:'100+ ha'},
    { name:'Assuit',    x:.50, y:.70, col:'#7a5c3a', r:6.5,label:'84 ha'  },
    { name:'Luxor',     x:.54, y:.80, col:'#7a5c3a', r:6,  label:'60 ha'  },
    { name:'Al Wahat',  x:.28, y:.62, col:'#5a8040', r:6,  label:'50+ ha' },
  ];

  function draw() {
    t += 0.01;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#dcecd0'); bg.addColorStop(1,'#c8deb4');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    ctx.strokeStyle = 'rgba(90,130,70,.1)'; ctx.lineWidth = .5;
    for (let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for (let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    // Egypt outline
    ctx.fillStyle = 'rgba(107,140,107,.18)';
    ctx.beginPath();
    ctx.moveTo(W*.25,H*.10); ctx.lineTo(W*.72,H*.10);
    ctx.lineTo(W*.72,H*.25); ctx.lineTo(W*.65,H*.25);
    ctx.lineTo(W*.65,H*.18); ctx.lineTo(W*.55,H*.18);
    ctx.lineTo(W*.62,H*.42); ctx.lineTo(W*.58,H*.95);
    ctx.lineTo(W*.42,H*.95); ctx.lineTo(W*.38,H*.42);
    ctx.lineTo(W*.25,H*.42); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(90,130,70,.25)'; ctx.lineWidth=1.5; ctx.stroke();

    // Nile
    ctx.beginPath();
    ctx.moveTo(W*.5,H*.18);
    ctx.bezierCurveTo(W*.52,H*.35,W*.49,H*.55,W*.51,H*.75);
    ctx.bezierCurveTo(W*.52,H*.85,W*.5,H*.92,W*.5,H*.96);
    ctx.strokeStyle='rgba(60,130,180,.38)'; ctx.lineWidth=3; ctx.stroke();

    // Western Desert label
    ctx.fillStyle='rgba(107,140,107,.25)';
    ctx.font = '500 9px sans-serif'; ctx.textAlign='center';
    ctx.fillText('WESTERN DESERT', W*.18, H*.35);
    ctx.textAlign='left';

    // connections
    ctx.setLineDash([4,6]);
    FARMS.forEach((f,i) => {
      if(i===0) return;
      ctx.beginPath();
      ctx.moveTo(FARMS[0].x*W,FARMS[0].y*H);
      ctx.lineTo(f.x*W,f.y*H);
      ctx.strokeStyle=`rgba(107,140,107,${.14+Math.sin(t+i)*.05})`;
      ctx.lineWidth=.8; ctx.stroke();
    });
    ctx.setLineDash([]);

    // farm markers
    FARMS.forEach((f,i) => {
      const px=f.x*W, py=f.y*H;
      const pulse=1+Math.sin(t*1.5+i)*.3;

      const grd=ctx.createRadialGradient(px,py,0,px,py,f.r*3*pulse);
      grd.addColorStop(0,`${f.col}28`); grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(px,py,f.r*3*pulse,0,Math.PI*2); ctx.fill();

      ctx.beginPath(); ctx.arc(px,py,f.r,0,Math.PI*2);
      ctx.fillStyle=f.col; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=1.5; ctx.stroke();

      ctx.fillStyle='#1e2318';
      ctx.font=`${i===0?'600':'400'} ${i===0?11:10}px sans-serif`;
      ctx.fillText(f.name, px+f.r+6, py+4);
      ctx.fillStyle='rgba(30,35,24,.5)';
      ctx.font='400 8px sans-serif';
      ctx.fillText(f.label, px+f.r+6, py+14);
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ════════════════════════════════════════
   FARM CANVASES — each with a different crop scene
   Only animates when visible
════════════════════════════════════════ */
const FARM_PALETTE = [
  { sky: ['#1a3018','#2a4a20'], ground: ['#4a3218','#2e1a08'], accent: '#f0e055', type: 'herb'    }, // Fayoum
  { sky: ['#1e3414','#2e5022'], ground: ['#3e2810','#241408'], accent: '#80c060', type: 'mint'    }, // Beni Suef
  { sky: ['#1a2a14','#2c4018'], ground: ['#483018','#2a1a08'], accent: '#f0a055', type: 'tall'    }, // Al Minia
  { sky: ['#1c2a10','#2a3e18'], ground: ['#402e14','#281808'], accent: '#d4a840', type: 'seed'    }, // Assuit
  { sky: ['#2a1c10','#3a2818'], ground: ['#3c2410','#221408'], accent: '#c84060', type: 'hibiscus'}, // Luxor
  { sky: ['#121e10','#1a2c14'], ground: ['#502e0c','#321c08'], accent: '#c8a052', type: 'desert'  }, // Al Wahat
];

FARM_PALETTE.forEach((pal, idx) => {
  const canvas = document.getElementById(`farm-canvas-${idx + 1}`);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0, active = false, rafId = null;

  function drawScene() {
    t += 0.007;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const sky = ctx.createLinearGradient(0,0,W,H*.55);
    sky.addColorStop(0, pal.sky[0]); sky.addColorStop(1, pal.sky[1]);
    ctx.fillStyle = sky; ctx.fillRect(0,0,W,H*.55);

    // sun
    const sunX=W*(.15+t*.005%0.7), sunY=H*.14;
    const sg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,16);
    sg.addColorStop(0,'rgba(255,220,80,.7)'); sg.addColorStop(1,'rgba(255,150,20,0)');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sunX,sunY,16,0,Math.PI*2); ctx.fill();

    const gnd=ctx.createLinearGradient(0,H*.5,0,H);
    gnd.addColorStop(0,pal.ground[0]); gnd.addColorStop(1,pal.ground[1]);
    ctx.fillStyle=gnd; ctx.fillRect(0,H*.5,W,H*.5);

    ctx.strokeStyle='rgba(80,48,18,.35)'; ctx.lineWidth=.7;
    for(let i=0;i<4;i++){
      const y=H*.54+i*H*.1;
      ctx.beginPath();ctx.moveTo(0,y+Math.sin(i)*2);ctx.lineTo(W,y+Math.sin(i+1)*2);ctx.stroke();
    }

    // plants based on type
    const positions = [.15,.28,.42,.56,.70,.84];
    positions.forEach((fx,pi) => {
      const cx = W*fx, gY = H*.52;
      const ph = (pi*.18 + t*.8) % (Math.PI*2);
      if(pal.type==='herb'||pal.type==='mint'){
        const h=(Math.sin(ph)*.1+.9)*H*.38;
        ctx.strokeStyle=pal.type==='mint'?'#50904a':'#5a8040'; ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.moveTo(cx,gY);
        ctx.bezierCurveTo(cx+Math.sin(t+pi)*5,gY-h*.4,cx-Math.sin(t+pi)*4,gY-h*.75,cx,gY-h);
        ctx.stroke();
        for(let li=0;li<3;li++){
          const lf=.3+li*.25, lside=li%2===0?1:-1;
          const lx=cx+Math.sin(-.3*lf)*3, ly=gY-h*lf;
          ctx.save(); ctx.translate(lx,ly); ctx.rotate(lside*.55+Math.sin(t+pi+li)*.04);
          ctx.fillStyle=pal.type==='mint'?'rgba(70,140,60,.7)':'rgba(75,125,50,.7)';
          ctx.beginPath();
          ctx.moveTo(0,0); ctx.bezierCurveTo(lside*16,-8,lside*24,-6,lside*26,-15);
          ctx.bezierCurveTo(lside*18,-10,lside*7,-4,0,0); ctx.fill();
          ctx.restore();
        }
      } else if(pal.type==='tall'){
        const h=H*(.32+Math.sin(ph)*.05);
        ctx.strokeStyle='#7a9050'; ctx.lineWidth=2.2;
        ctx.beginPath(); ctx.moveTo(cx,gY); ctx.lineTo(cx+2,gY-h*.5); ctx.lineTo(cx-1,gY-h); ctx.stroke();
        const sg2=ctx.createRadialGradient(cx-1,gY-h,0,cx-1,gY-h,18);
        sg2.addColorStop(0,pal.accent+'88'); sg2.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=sg2; ctx.beginPath(); ctx.arc(cx-1,gY-h,18,0,Math.PI*2); ctx.fill();
      } else if(pal.type==='seed'){
        const h=H*(.3+Math.sin(ph)*.05);
        ctx.strokeStyle='#7a9252'; ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.moveTo(cx,gY); ctx.lineTo(cx+1,gY-h*.5); ctx.lineTo(cx,gY-h); ctx.stroke();
        for(let si=0;si<6;si++){
          const sa=(si/6)*Math.PI*2-Math.PI/2, sr=14;
          const sx=cx+Math.cos(sa)*sr, sy=gY-h+Math.sin(sa)*sr*.5;
          ctx.beginPath(); ctx.arc(sx,sy,2.5,0,Math.PI*2);
          ctx.fillStyle='#d4a840'; ctx.fill();
        }
      } else if(pal.type==='hibiscus'){
        const h=H*.3;
        ctx.strokeStyle='#5a8040'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(cx,gY); ctx.lineTo(cx,gY-h); ctx.stroke();
        const fp=Math.max(0,Math.sin(t+pi));
        for(let pe=0;pe<5;pe++){
          const pa=(pe/5)*Math.PI*2;
          ctx.beginPath(); ctx.ellipse(cx+Math.cos(pa)*10,gY-h+Math.sin(pa)*10,8,5,pa,0,Math.PI*2);
          ctx.fillStyle=`rgba(210,40,80,${fp*.7})`; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(cx,gY-h,4,0,Math.PI*2);
        ctx.fillStyle='rgba(240,200,50,.8)'; ctx.fill();
      } else if(pal.type==='desert'){
        const h=H*(.28+Math.sin(ph)*.04);
        ctx.strokeStyle='#7a9050'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(cx,gY); ctx.lineTo(cx,gY-h); ctx.stroke();
        for(let di=0;di<4;di++){
          const da=(di/4)*Math.PI*1.6-Math.PI*.8, dr=16;
          ctx.beginPath(); ctx.moveTo(cx,gY-h);
          ctx.lineTo(cx+Math.cos(da)*dr,gY-h+Math.sin(da)*dr*.6);
          ctx.strokeStyle='rgba(180,200,100,.5)'; ctx.lineWidth=1; ctx.stroke();
        }
      }
    });

    // ground haze
    const hz=ctx.createLinearGradient(0,H*.46,0,H*.58);
    hz.addColorStop(0,'rgba(0,0,0,0)'); hz.addColorStop(.5,'rgba(0,0,0,.12)'); hz.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=hz; ctx.fillRect(0,H*.46,W,H*.12);

    rafId = requestAnimationFrame(drawScene);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      active = e.isIntersecting;
      if(active && !rafId) drawScene();
      if(!active && rafId){ cancelAnimationFrame(rafId); rafId=null; }
    });
  }, { threshold: 0.05 });
  io.observe(canvas);
});

/* ════════════════════════════════════════
   SOIL CANVAS — cross-section illustration
════════════════════════════════════════ */
(function initSoil() {
  const canvas = document.getElementById('soil-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function draw() {
    t += 0.006;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0,0,W,H);

    // dark bg
    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#1e3218'); bg.addColorStop(1,'#0e1c0a');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // sky stripe
    const skh = H*.45;
    const sky=ctx.createLinearGradient(0,0,0,skh);
    sky.addColorStop(0,'#1a2e14'); sky.addColorStop(1,'#2a4820');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,skh);

    // sun
    const sg=ctx.createRadialGradient(W*.75,H*.12,0,W*.75,H*.12,30);
    sg.addColorStop(0,'rgba(255,220,80,.65)'); sg.addColorStop(1,'rgba(255,140,10,0)');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(W*.75,H*.12,30,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W*.75,H*.12,10,0,Math.PI*2);
    ctx.fillStyle='rgba(255,235,100,.8)'; ctx.fill();

    // soil layers
    const layers=[
      {y:.45,h:.06,col:'#4a3218',label:'Topsoil'},
      {y:.51,h:.12,col:'#3e2810',label:'Rich Alluvial'},
      {y:.63,h:.15,col:'#342010',label:'Clay Layer'},
      {y:.78,h:.22,col:'#281808',label:'Subsoil'},
    ];
    layers.forEach(l=>{
      ctx.fillStyle=l.col;
      ctx.fillRect(0,H*l.y,W,H*l.h);
      ctx.fillStyle='rgba(245,240,232,.22)';
      ctx.font='400 9px sans-serif'; ctx.textAlign='right';
      ctx.fillText(l.label.toUpperCase(),W-16,H*(l.y+l.h*.5)+3);
      ctx.textAlign='left';
    });

    // wavy soil boundary
    ctx.strokeStyle='rgba(200,160,82,.2)'; ctx.lineWidth=.8;
    [.45,.51,.63,.78].forEach(fy=>{
      ctx.beginPath();
      for(let x=0;x<W;x+=4){
        const y=H*fy+Math.sin(x*.06+t)*2.5;
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    });

    // roots
    const rootStarts=[[W*.2,H*.45],[W*.4,H*.45],[W*.6,H*.45],[W*.8,H*.45]];
    rootStarts.forEach(([rx,ry],ri)=>{
      ctx.strokeStyle='rgba(90,65,28,.55)'; ctx.lineWidth=.9;
      for(let rd=0;rd<4;rd++){
        const ra=Math.PI*.5+((rd-1.5)*.4);
        const rlen=H*.25*(1+rd*.1);
        ctx.beginPath(); ctx.moveTo(rx,ry);
        ctx.bezierCurveTo(
          rx+Math.cos(ra+(ri*.1))*rlen*.4+Math.sin(t+rd+ri)*8, ry+Math.sin(ra)*rlen*.4,
          rx+Math.cos(ra+(ri*.1))*rlen*.7+Math.sin(t*1.1+rd)*6, ry+Math.sin(ra)*rlen*.7,
          rx+Math.cos(ra+(ri*.1))*rlen+Math.sin(t*1.2+rd+ri)*5, ry+Math.sin(ra)*rlen
        );
        ctx.stroke();
      }
    });

    // above-ground plants
    [[.2,0],[.4,.05],[.6,.02],[.8,.07]].forEach(([fx,ph])=>{
      const cx=W*fx, gY=H*.45;
      const h=H*.28;
      const sw=Math.sin(t*.5+ph*10);
      ctx.strokeStyle='#5a8040'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx,gY);
      ctx.bezierCurveTo(cx+sw*6,gY-h*.38,cx-sw*4,gY-h*.72,cx+sw*2,gY-h);
      ctx.stroke();
      [[.3,-1,24,10],[.55,1,20,9],[.78,-1,18,8]].forEach(([lf,sd,lw,lh])=>{
        const lx=cx+sw*3,ly=gY-h*lf;
        ctx.save(); ctx.translate(lx,ly); ctx.rotate(sd*.6+sw*.05);
        ctx.fillStyle='rgba(75,125,50,.65)';
        ctx.beginPath();
        ctx.moveTo(0,0); ctx.bezierCurveTo(sd*lw,-lh*.5,sd*lw*.8,-lh*.25,sd*lw,0);
        ctx.bezierCurveTo(sd*lw*.5,lh*.15,sd*lw*.2,lh*.05,0,0); ctx.fill();
        ctx.restore();
      });
    });

    // Nile water seeping
    ctx.strokeStyle='rgba(60,130,180,.28)'; ctx.lineWidth=1.5;
    for(let wi=0;wi<3;wi++){
      ctx.beginPath();
      for(let x=0;x<W;x+=4){
        const y=H*(.52+wi*.08)+Math.sin(x*.08+t+wi)*3;
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }

    // label: "NILE ALLUVIAL SOIL"
    ctx.fillStyle='rgba(200,160,82,.35)';
    ctx.font='500 10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('NILE ALLUVIAL SOIL',W*.5,H*.57);
    ctx.textAlign='left';

    requestAnimationFrame(draw);
  }
  draw();
})();