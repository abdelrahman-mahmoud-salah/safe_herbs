'use strict';

// Shared utilities provided by js/pageUtils.js — must be loaded before this script.

PageUtils.initCursor(['.cert-card']);
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.cert-card, .stat-cell, .pillar');

const { syncCanvas, createVisibilityLoop } = PageUtils;

/* ── Certificate download — analytics hook ── */
function trackDownload(name) {
  console.log('Certificate downloaded:', name);
}

/* ════════════════════════════════════════
   HERO CANVAS — organic particles on dark radial background
════════════════════════════════════════ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const PARTICLE_COLORS = [
    'rgba(107,140,107,',
    'rgba(200,160,82,',
    'rgba(90,130,70,',
  ];

  const RING_RADII = [0.18, 0.32, 0.48, 0.62];

  const particles = Array.from({ length: 60 }, (_, i) => ({
    x:   Math.random(),
    y:   Math.random(),
    vx:  (Math.random() - 0.5) * 0.00017,
    vy:  -(Math.random() * 0.00019 + 0.00004),
    r:   Math.random() * 4 + 1.5,
    al:  Math.random() * 0.28 + 0.06,
    ph:  Math.random() * Math.PI * 2,
    col: PARTICLE_COLORS[i % 3],
  }));

  function draw() {
    t += 0.005;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Radial dark background
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.5, W * 0.85);
    bg.addColorStop(0,   '#172412');
    bg.addColorStop(0.6, '#0d1a0a');
    bg.addColorStop(1,   '#060c04');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Petri-dish rings
    RING_RADII.forEach((r, ri) => {
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.45, r * Math.min(W, H), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(107,140,107,${0.06 - 0.012 * ri})`;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    });

    // Horizontal scan line
    const sy = H * 0.1 + (Math.sin(t * 0.4) + 1) * 0.5 * H * 0.65;
    const sg = ctx.createLinearGradient(0, sy - 18, 0, sy + 18);
    sg.addColorStop(0,   'rgba(200,160,82,0)');
    sg.addColorStop(0.5, 'rgba(200,160,82,.12)');
    sg.addColorStop(1,   'rgba(200,160,82,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, sy - 18, W, 36);

    // Particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      if (p.x < -0.05 || p.x > 1.05) p.x = Math.random();
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col + (p.al * (1 + Math.sin(t * 2 + p.ph) * 0.18)) + ')';
      ctx.fill();
    });

    // Bottom vignette
    const vg = ctx.createLinearGradient(0, H * 0.75, 0, H);
    vg.addColorStop(0, 'rgba(6,12,4,0)');
    vg.addColorStop(1, 'rgba(6,12,4,1)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  createVisibilityLoop(canvas, draw);
})();

/* ════════════════════════════════════════
   PHILOSOPHY CANVAS — orbiting certification nodes
════════════════════════════════════════ */
(function initPhilCanvas() {
  const canvas = document.getElementById('phil-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const RING_DEFS = [
    { r: 0.26, count: 3, spd:  0.009, off: 0   },
    { r: 0.40, count: 4, spd: -0.006, off: 0.4  },
    { r: 0.54, count: 4, spd:  0.004, off: 0.9  },
  ];

  const NODE_COLORS  = ['#c8a052', '#6b8c6b', '#8a9a5b'];
  const CERT_LABELS  = ['ISO', 'EU', 'NOP', 'FSSC', 'FDA', 'FT', 'RA', 'UEBT', 'Sedex', 'NFSA', 'FT'];

  let labelIdx = 0;
  const nodes = RING_DEFS.flatMap((ring, ri) =>
    Array.from({ length: ring.count }, (_, i) => ({
      ring,
      ri,
      phase: (i / ring.count) * Math.PI * 2 + ring.off,
      label: CERT_LABELS[labelIdx++] || '✓',
      col:   NODE_COLORS[ri],
    }))
  );

  function draw() {
    t += 0.007;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a3d22');
    bg.addColorStop(1, '#1a2814');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const cx = W * 0.5, cy = H * 0.5;
    const minDim = Math.min(W, H);

    // Orbit ring guides
    RING_DEFS.forEach(ring => {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r * minDim, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(107,140,107,.1)';
      ctx.lineWidth   = 0.6;
      ctx.stroke();
    });

    // Compute current node positions
    const positions = nodes.map(n => ({
      x: cx + Math.cos(n.phase + t * n.ring.spd) * n.ring.r * minDim,
      y: cy + Math.sin(n.phase + t * n.ring.spd) * n.ring.r * minDim * 0.65,
      n,
    }));

    // Connections between close nodes
    const CONN_THRESHOLD = minDim * 0.22;
    positions.forEach((a, i) => positions.forEach((b, j) => {
      if (j <= i) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < CONN_THRESHOLD) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(200,160,82,${(1 - d / CONN_THRESHOLD) * 0.12})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }));

    // Node circles + labels
    positions.forEach(({ x, y, n }) => {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 18);
      grd.addColorStop(0, n.col + '44');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = n.col;
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.fillStyle   = 'rgba(26,40,20,.85)';
      ctx.fill();

      ctx.fillStyle    = n.col;
      ctx.font         = `500 8px 'Jost', sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, x, y);
    });
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';

    // Centre hub
    const cr  = minDim * 0.09;
    const cg  = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 1.4);
    cg.addColorStop(0, 'rgba(200,160,82,.2)');
    cg.addColorStop(1, 'rgba(200,160,82,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, cr * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,160,82,.5)';
    ctx.lineWidth   = 1.2;
    ctx.stroke();
    ctx.fillStyle   = 'rgba(26,40,20,.85)';
    ctx.fill();

    ctx.fillStyle    = '#c8a052';
    ctx.font         = `300 ${Math.round(cr * 0.48)}px 'Cormorant Garamond', serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('11', cx, cy - cr * 0.1);
    ctx.font         = `400 ${Math.round(cr * 0.18)}px 'Jost', sans-serif`;
    ctx.fillStyle    = 'rgba(200,160,82,.6)';
    ctx.fillText('CERTS', cx, cy + cr * 0.32);
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  createVisibilityLoop(canvas, draw);
})();