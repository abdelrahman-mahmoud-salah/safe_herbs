'use strict';

// Shared utilities provided by js/pageUtils.js — must be loaded before this script.

PageUtils.initCursor(['input', 'select', 'textarea']);
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.person-card', 0.1);

const { syncCanvas, createVisibilityLoop } = PageUtils;

/* ── Contact form submission ── */
function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.textContent    = 'Message Sent ✓';
  btn.style.background = 'var(--sage)';
  btn.style.color      = '#fff';
  btn.disabled         = true;
  setTimeout(() => {
    btn.textContent    = 'Send Message ✦';
    btn.style.background = '';
    btn.style.color      = '';
    btn.disabled         = false;
  }, 4000);
}

/* ════════════════════════════════════════
   HERO CANVAS — golden particles floating over dark
════════════════════════════════════════ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const PARTICLE_COLORS = ['#c8a052', '#e2c07a', '#8ab870'];

  const particles = Array.from({ length: 55 }, () => ({
    x:   Math.random(),
    y:   Math.random(),
    vx:  (Math.random() - 0.5) * 0.0002,
    vy:  -(Math.random() * 0.00015 + 0.00004),
    r:   Math.random() * 3 + 1,
    al:  Math.random() * 0.25 + 0.06,
    col: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));

  function draw() {
    t += 0.004;
    syncCanvas(canvas);
    const W = canvas._logicalWidth || canvas.width, H = canvas._logicalHeight || canvas.height;
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      if (p.x < -0.05 || p.x > 1.05) p.x = Math.random();
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = p.col;
      ctx.globalAlpha = p.al;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  createVisibilityLoop(canvas, draw);
})();

/* ════════════════════════════════════════
   MAP CANVAS — Egypt map with export arc lines
════════════════════════════════════════ */
(function initMapCanvas() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const FAYOUM = { x: 0.45, y: 0.56 };

  // World export endpoints (approximate relative positions)
  const EXPORTS = [
    { tx: 0.15, ty: 0.35, lbl: 'Europe'   },
    { tx: 0.82, ty: 0.28, lbl: 'Asia'     },
    { tx: 0.88, ty: 0.55, lbl: 'Gulf'     },
    { tx: 0.05, ty: 0.45, lbl: 'Americas' },
  ];

  function draw() {
    t += 0.006;
    syncCanvas(canvas);
    const W = canvas._logicalWidth || canvas.width, H = canvas._logicalHeight || canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Dark map background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0e1a0c');
    bg.addColorStop(1, '#080e08');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(107,140,107,.06)';
    ctx.lineWidth   = 0.4;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const fx = FAYOUM.x * W;
    const fy = FAYOUM.y * H;

    // Animated export arc lines
    EXPORTS.forEach((ex, i) => {
      const tx  = ex.tx * W;
      const ty  = ex.ty * H;
      const cpx = (fx + tx) / 2;
      const cpy = Math.min(fy, ty) - 80;

      // Dashed animated arc
      const grad = ctx.createLinearGradient(fx, fy, tx, ty);
      grad.addColorStop(0,   'rgba(200,160,82,0)');
      grad.addColorStop(0.5, 'rgba(200,160,82,.35)');
      grad.addColorStop(1,   'rgba(200,160,82,0)');
      ctx.strokeStyle  = grad;
      ctx.lineWidth    = 1;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -t * 20;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(cpx, cpy, tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Travelling dot along the arc
      const dt = ((t * 0.3 + i * 0.25) % 1);
      const bx = (1 - dt) * (1 - dt) * fx + 2 * (1 - dt) * dt * cpx + dt * dt * tx;
      const by = (1 - dt) * (1 - dt) * fy + 2 * (1 - dt) * dt * cpy + dt * dt * ty;
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,160,82,.9)';
      ctx.fill();

      // Destination label
      ctx.fillStyle = 'rgba(245,240,232,.4)';
      ctx.font      = '300 10px sans-serif';
      ctx.textAlign = ex.tx < 0.5 ? 'right' : 'left';
      ctx.fillText(ex.lbl, tx + (ex.tx < 0.5 ? -8 : 8), ty + 4);
      ctx.textAlign = 'left';

      // Destination dot
      ctx.beginPath();
      ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,160,82,.5)';
      ctx.fill();
    });

    // Fayoum origin pin
    const pulse = 1 + Math.sin(t * 2) * 0.3;
    ctx.beginPath();
    ctx.arc(fx, fy, 18 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,160,82,.1)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx, fy, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,160,82,.25)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx, fy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#c8a052';
    ctx.fill();

    // Pin label
    ctx.fillStyle    = 'rgba(245,240,232,.7)';
    ctx.font         = '500 11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.fillText('FAYOUM', fx, fy - 22);
    ctx.font         = '300 9px sans-serif';
    ctx.fillStyle    = 'rgba(245,240,232,.4)';
    ctx.fillText('Egypt', fx, fy - 10);
    ctx.textAlign    = 'left';
  }

  createVisibilityLoop(canvas, draw);
})();