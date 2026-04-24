'use strict';

// Shared utilities provided by js/pageUtils.js — must be loaded before this script.

PageUtils.initCursor(['.cert-card']);
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.cert-card, .stat-item, .pillar');

const { syncCanvas, createVisibilityLoop } = PageUtils;

/* ════════════════════════════════════════
   HERO CANVAS — botanical leaf particle field
════════════════════════════════════════ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const LEAF_COLORS = ['#6b8c6b', '#8a9a5b', '#c8a052', '#3d5c3d', '#a0b870'];

  const particles = Array.from({ length: 55 }, () => ({
    x:    Math.random(),
    y:    Math.random(),
    vx:   (Math.random() - 0.5) * 0.00015,
    vy:   -(Math.random() * 0.00018 + 0.00004),
    rot:  Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.007,
    size: Math.random() * 9 + 3,
    al:   Math.random() * 0.30 + 0.06,
    col:  LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
  }));

  function drawLeaf(x, y, size, rot, col, al) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = al;
    ctx.fillStyle   = col;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo( size * 0.6, -size * 0.5,  size * 0.6, size * 0.5, 0,  size);
    ctx.bezierCurveTo(-size * 0.6,  size * 0.5, -size * 0.6, -size * 0.5, 0, -size);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    t += 0.005;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Deep green linear background
    const bg = ctx.createLinearGradient(0, 0, W * 0.5, H);
    bg.addColorStop(0,   '#1a2a14');
    bg.addColorStop(0.5, '#2d4a28');
    bg.addColorStop(1,   '#0e180b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(107,140,107,.06)';
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Animated radial glow
    const grd = ctx.createRadialGradient(
      W * (0.4 + Math.sin(t) * 0.1), H * 0.4, 0, W * 0.5, H * 0.5, W * 0.65
    );
    grd.addColorStop(0, 'rgba(107,140,107,.12)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Leaf particles
    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      if (p.x < -0.1 || p.x > 1.1) p.x = Math.random();
      drawLeaf(p.x * W, p.y * H, p.size, p.rot, p.col, p.al);
    });
    ctx.globalAlpha = 1;
  }

  createVisibilityLoop(canvas, draw);
})();

/* ════════════════════════════════════════
   PHILOSOPHY CANVAS — rotating certification badge rings
════════════════════════════════════════ */
(function initPhilCanvas() {
  const canvas = document.getElementById('phil-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const RINGS = [
    { r: 0.28, count: 3, speed:  0.008, offset: 0   },
    { r: 0.42, count: 4, speed: -0.005, offset: 0.4  },
    { r: 0.56, count: 4, speed:  0.003, offset: 0.9  },
  ];

  const RING_COLORS = ['#c8a052', '#6b8c6b', '#8a9a5b'];
  const CERT_LABELS = ['ISO', 'EU', 'NOP', 'FSSC', 'FDA', 'FT', 'RA', 'UEBT', 'Sedex', 'FSMA', 'NFSA'];

  let labelIdx = 0;
  const nodes = RINGS.flatMap((ring, ri) =>
    Array.from({ length: ring.count }, (_, i) => ({
      ring, ri,
      phase: (i / ring.count) * Math.PI * 2 + ring.offset,
      label: CERT_LABELS[labelIdx++] || '✓',
      col:   RING_COLORS[ri],
    }))
  );

  function draw() {
    t += 0.008;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a3d22');
    bg.addColorStop(1, '#1a2814');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const cx     = W * 0.5, cy = H * 0.5;
    const minDim = Math.min(W, H);

    // Orbit guide rings
    RINGS.forEach(ring => {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r * minDim, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(107,140,107,.12)';
      ctx.lineWidth   = 0.6;
      ctx.stroke();
    });

    // Compute positions once, then draw connections, then nodes
    const positions = nodes.map(n => {
      const ang = n.phase + t * n.ring.speed;
      return {
        x: cx + Math.cos(ang) * n.ring.r * minDim,
        y: cy + Math.sin(ang) * n.ring.r * minDim,
        n,
      };
    });

    const CONN_THRESHOLD = minDim * 0.25;
    positions.forEach((a, i) => positions.forEach((b, j) => {
      if (j <= i) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < CONN_THRESHOLD) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(200,160,82,${(1 - d / CONN_THRESHOLD) * 0.14})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }));

    positions.forEach(({ x, y, n }) => {
      // Glow
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 20);
      grd.addColorStop(0, 'rgba(200,160,82,.22)');
      grd.addColorStop(1, 'rgba(200,160,82,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.strokeStyle = n.col;
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.fillStyle   = 'rgba(26,40,20,.8)';
      ctx.fill();

      // Label
      ctx.fillStyle    = n.col;
      ctx.font         = `500 8px 'Jost', sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, x, y);
    });
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';

    // Centre hub
    const centreR = minDim * 0.1;
    const centreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, centreR * 1.4);
    centreG.addColorStop(0, 'rgba(200,160,82,.18)');
    centreG.addColorStop(1, 'rgba(200,160,82,0)');
    ctx.fillStyle = centreG;
    ctx.beginPath();
    ctx.arc(cx, cy, centreR * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, centreR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,160,82,.5)';
    ctx.lineWidth   = 1.2;
    ctx.stroke();
    ctx.fillStyle   = 'rgba(26,40,20,.8)';
    ctx.fill();

    ctx.fillStyle    = '#c8a052';
    ctx.font         = `300 ${Math.round(centreR * 0.45)}px 'Cormorant Garamond', serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('11', cx, cy - centreR * 0.12);
    ctx.font         = `400 ${Math.round(centreR * 0.18)}px 'Jost', sans-serif`;
    ctx.fillStyle    = 'rgba(200,160,82,.6)';
    ctx.fillText('CERTS', cx, cy + centreR * 0.32);
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  createVisibilityLoop(canvas, draw);
})();
