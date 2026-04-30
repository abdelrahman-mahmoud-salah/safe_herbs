'use strict';

PageUtils.initCursor(['.cert-card']);
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.cert-card, .stat-item, .pillar');

const { syncCanvas, createVisibilityLoop } = PageUtils;

/* ═════════ HERO CANVAS ═════════ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let t = 0;
  let W = 0, H = 0, DPR = 1;

  const LEAF_COLORS = ['#6b8c6b', '#8a9a5b', '#c8a052', '#3d5c3d', '#a0b870'];

  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00015,
    vy: -(Math.random() * 0.00018 + 0.00004),
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.007,
    size: Math.random() * 9 + 3,
    al: Math.random() * 0.30 + 0.06,
    col: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
  }));

  function drawLeaf(x, y, size, rot, col, al) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = al;
    ctx.fillStyle = col;

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.6, -size * 0.5, size * 0.6, size * 0.5, 0, size);
    ctx.bezierCurveTo(-size * 0.6, size * 0.5, -size * 0.6, -size * 0.5, 0, -size);
    ctx.fill();

    ctx.strokeStyle = col;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();

    ctx.restore();
  }

  function draw() {
    t += 0.005;

    if (syncCanvas(canvas) || W === 0) {
      W = canvas._logicalWidth || canvas.width;
      H = canvas._logicalHeight || canvas.height;
    }

    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W * 0.5, H);
    bg.addColorStop(0, '#1a2a14');
    bg.addColorStop(0.5, '#2d4a28');
    bg.addColorStop(1, '#0e180b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(107,140,107,.06)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < W; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    for (let y = 0; y < H; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const grd = ctx.createRadialGradient(
      W * (0.4 + Math.sin(t) * 0.1),
      H * 0.4,
      0,
      W * 0.5,
      H * 0.5,
      W * 0.65
    );

    grd.addColorStop(0, 'rgba(107,140,107,.12)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;

      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }

      drawLeaf(p.x * W, p.y * H, p.size, p.rot, p.col, p.al);
    }
  }

  createVisibilityLoop(canvas, draw);
})();


/* ═════════ PHILOSOPHY CANVAS (OPTIMIZED) ═════════ */
(function initPhilCanvas() {
  const canvas = document.getElementById('phil-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let t = 0;
  let W = 0, H = 0, DPR = 1;

  const RINGS = [
    { r: 0.28, count: 3, speed: 0.008, offset: 0 },
    { r: 0.42, count: 4, speed: -0.005, offset: 0.4 },
    { r: 0.56, count: 4, speed: 0.003, offset: 0.9 },
  ];

  const COLORS = ['#c8a052', '#6b8c6b', '#8a9a5b'];

  const labels = ['ISO', 'EU', 'NOP', 'FSSC', 'FDA', 'FT', 'RA'];

  let nodes = [];
  let positions = [];

  function draw() {
    t += 0.008;

    if (syncCanvas(canvas) || W === 0) {
      W = canvas._logicalWidth || canvas.width;
      H = canvas._logicalHeight || canvas.height;
      
      const min = Math.min(W, H);
      nodes = [];
      let i = 0;
      for (let r of RINGS) {
        for (let j = 0; j < r.count; j++) {
          nodes.push({
            ring: r,
            phase: (j / r.count) * Math.PI * 2 + r.offset,
            label: labels[i++] || '✓',
            col: COLORS[i % COLORS.length],
          });
        }
      }
    }

    const cx = W / 2;
    const cy = H / 2;
    const min = Math.min(W, H);

    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a3d22');
    bg.addColorStop(1, '#1a2814');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    positions = nodes.map(n => {
      const ang = n.phase + t * n.ring.speed;
      return {
        x: cx + Math.cos(ang) * n.ring.r * min,
        y: cy + Math.sin(ang) * n.ring.r * min,
        n
      };
    });

    // ❌ removed O(n²) heavy connection system

    for (let p of positions) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26,40,20,.8)';
      ctx.fill();

      ctx.strokeStyle = p.n.col;
      ctx.stroke();

      ctx.fillStyle = p.n.col;
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.n.label, p.x, p.y);
    }

    ctx.textAlign = 'left';
  }

  createVisibilityLoop(canvas, draw);
})();