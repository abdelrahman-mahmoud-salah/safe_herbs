'use strict';

/* ── CURSOR ── */
const $cur  = document.getElementById('cur');
const $ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function cursorLoop() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  $cur.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  $ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  requestAnimationFrame(cursorLoop);
})();
document.querySelectorAll('a, button, .cert-card').forEach(el => {
  el.addEventListener('mouseenter', () => { $cur.style.width=$cur.style.height='16px'; $ring.style.width=$ring.style.height='56px'; });
  el.addEventListener('mouseleave', () => { $cur.style.width=$cur.style.height='8px';  $ring.style.width=$ring.style.height='36px'; });
});

/* ── NAV SCROLL ── */
const $nav = document.getElementById('navbar');
window.addEventListener('scroll', () => $nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });

/* ── HAMBURGER ── */
let menuOpen = false;
function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('mobileMenu').classList.toggle('open', menuOpen);
  const [s0, s1, s2] = document.querySelectorAll('.hamburger span');
  s0.style.transform = menuOpen ? 'rotate(45deg) translate(4px,4px)'  : '';
  s1.style.opacity   = menuOpen ? '0'                                   : '1';
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
}, { threshold: 0.1 });

document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .cert-card, .stat-item, .pillar'
).forEach(el => revealIO.observe(el));

/* ── CANVAS RESIZE HELPER ── */
function syncCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const r   = canvas.getBoundingClientRect();
  const cw  = Math.round(r.width  * dpr);
  const ch  = Math.round(r.height * dpr);
  if (canvas.width === cw && canvas.height === ch) return false;
  canvas.width  = cw;
  canvas.height = ch;
  canvas.getContext('2d').scale(dpr, dpr);
  return true;
}

/* ── HERO CANVAS — botanical particle field ── */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let t = 0;

  const COLORS = ['#6b8c6b','#8a9a5b','#c8a052','#3d5c3d','#a0b870'];
  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00015,
    vy: -(Math.random() * 0.00018 + 0.00004),
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.007,
    size: Math.random() * 9 + 3,
    al:   Math.random() * 0.30 + 0.06,
    col:  COLORS[Math.floor(Math.random() * COLORS.length)]
  }));

  function drawLeaf(x, y, size, rot, col, al) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha = al; ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo( size*.6,-size*.5,  size*.6, size*.5, 0,  size);
    ctx.bezierCurveTo(-size*.6, size*.5, -size*.6,-size*.5, 0, -size);
    ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0,-size); ctx.lineTo(0,size); ctx.stroke();
    ctx.restore();
  }

  function draw() {
    t += 0.005;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W * .5, H);
    bg.addColorStop(0, '#1a2a14'); bg.addColorStop(.5, '#2d4a28'); bg.addColorStop(1, '#0e180b');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(107,140,107,.06)'; ctx.lineWidth = .5;
    for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const grd = ctx.createRadialGradient(W*(.4+Math.sin(t)*.1), H*.4, 0, W*.5, H*.5, W*.65);
    grd.addColorStop(0, 'rgba(107,140,107,.12)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      if (p.x < -0.1 || p.x > 1.1) p.x = Math.random();
      drawLeaf(p.x * W, p.y * H, p.size, p.rot, p.col, p.al);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── PHILOSOPHY CANVAS — rotating certificate badge rings ── */
(function initPhilCanvas() {
  const canvas = document.getElementById('phil-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const rings = [
    { r: .28, count: 3, speed:  .008, offset: 0    },
    { r: .42, count: 4, speed: -.005, offset: .4   },
    { r: .56, count: 4, speed:  .003, offset: .9   },
  ];

  const RING_COLORS  = ['#c8a052','#6b8c6b','#8a9a5b'];
  const CERT_LABELS  = ['ISO','EU','NOP','FSSC','FDA','FT','RA','UEBT','Sedex','FSMA','NFSA'];
  let labelIdx = 0;
  const nodes = rings.flatMap((ring, ri) =>
    Array.from({ length: ring.count }, (_, i) => ({
      ring, ri,
      phase: (i / ring.count) * Math.PI * 2 + ring.offset,
      label: CERT_LABELS[labelIdx++] || '✓',
      col:   RING_COLORS[ri]
    }))
  );

  function draw() {
    t += 0.008;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a3d22'); bg.addColorStop(1, '#1a2814');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const cx = W * .5, cy = H * .5;

    rings.forEach((ring) => {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r * Math.min(W, H), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(107,140,107,.12)`;
      ctx.lineWidth = .6; ctx.stroke();
    });

    nodes.forEach((n, i) => {
      const ang  = n.phase + t * n.ring.speed;
      const r    = n.ring.r * Math.min(W, H);
      const nx   = cx + Math.cos(ang) * r;
      const ny   = cy + Math.sin(ang) * r;
      nodes.forEach((m, j) => {
        if (j <= i) return;
        const ang2 = m.phase + t * m.ring.speed;
        const r2   = m.ring.r * Math.min(W, H);
        const mx2  = cx + Math.cos(ang2) * r2;
        const my2  = cy + Math.sin(ang2) * r2;
        const d    = Math.hypot(nx - mx2, ny - my2);
        if (d < Math.min(W, H) * .25) {
          ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(mx2, my2);
          ctx.strokeStyle = `rgba(200,160,82,${(1 - d / (Math.min(W,H)*.25)) * .14})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      });
    });

    nodes.forEach(n => {
      const ang = n.phase + t * n.ring.speed;
      const r   = n.ring.r * Math.min(W, H);
      const nx  = cx + Math.cos(ang) * r;
      const ny  = cy + Math.sin(ang) * r;

      const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, 20);
      grd.addColorStop(0, `rgba(200,160,82,.22)`); grd.addColorStop(1, 'rgba(200,160,82,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(nx, ny, 20, 0, Math.PI*2); ctx.fill();

      ctx.beginPath(); ctx.arc(nx, ny, 18, 0, Math.PI*2);
      ctx.strokeStyle = n.col; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(26,40,20,.8)'; ctx.fill();

      ctx.fillStyle = n.col;
      ctx.font = `500 8px 'Jost', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.label, nx, ny);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    });

    const centreR = Math.min(W, H) * .1;
    const centreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, centreR * 1.4);
    centreGrd.addColorStop(0, 'rgba(200,160,82,.18)'); centreGrd.addColorStop(1, 'rgba(200,160,82,0)');
    ctx.fillStyle = centreGrd; ctx.beginPath(); ctx.arc(cx, cy, centreR*1.4, 0, Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.arc(cx, cy, centreR, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(200,160,82,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(26,40,20,.8)'; ctx.fill();

    ctx.fillStyle = '#c8a052';
    ctx.font = `300 ${Math.round(centreR*.45)}px 'Cormorant Garamond', serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('11', cx, cy - centreR * .12);
    ctx.font = `400 ${Math.round(centreR*.18)}px 'Jost', sans-serif`;
    ctx.fillStyle = 'rgba(200,160,82,.6)';
    ctx.fillText('CERTS', cx, cy + centreR * .32);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

    requestAnimationFrame(draw);
  }
  draw();
})();
