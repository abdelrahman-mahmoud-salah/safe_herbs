'use strict';

// Shared utilities provided by js/pageUtils.js — must be loaded before this script.

PageUtils.initCursor();
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.tl-item, .mv-card, .value-item, .stat-c', 0.1);

const { syncCanvas, createVisibilityLoop } = PageUtils;

/* ════════════════════════════════════════
   HERO CANVAS — floating golden dust over green
════════════════════════════════════════ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const PARTICLE_COLORS = ['#c8a052', '#8ab870', '#6b8c6b'];

  const particles = Array.from({ length: 50 }, () => ({
    x:   Math.random(),
    y:   Math.random(),
    vx:  (Math.random() - 0.5) * 0.0002,
    vy:  -(Math.random() * 0.00015 + 0.00003),
    r:   Math.random() * 4 + 1.5,
    al:  Math.random() * 0.3 + 0.05,
    col: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));

  function draw() {
    t += 0.004;
    syncCanvas(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      if (p.x < -0.05 || p.x > 1.05) p.x = Math.random();
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = p.col;
      ctx.globalAlpha = p.al * (1 + Math.sin(t * 2 + p.x * 5) * 0.2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  createVisibilityLoop(canvas, draw);
})();

/* ════════════════════════════════════════
   STORY CANVAS — three-generation family tree
════════════════════════════════════════ */
(function initStoryCanvas() {
  const canvas = document.getElementById('story-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  // Three layers — one per generation —  innermost = oldest
  const GENERATIONS = [
    { y: 0.60, spread: 70,  leaves: 8,  col: 'rgba(60,100,40,.55)',  sz: 22 },
    { y: 0.35, spread: 55,  leaves: 10, col: 'rgba(75,130,50,.65)',  sz: 18 },
    { y: 0.12, spread: 40,  leaves: 12, col: 'rgba(100,170,65,.7)',  sz: 14 },
  ];

  const ROOT_OFFSETS = [-0.4, -0.2, 0.2, 0.4];

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

    // Subtle horizontal grid
    ctx.strokeStyle = 'rgba(107,140,107,.05)';
    ctx.lineWidth   = 0.5;
    for (let y = 0; y < H; y += 38) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const cx    = W * 0.5;
    const baseY = H * 0.92;
    const trunkH = H * 0.5;

    // Trunk
    ctx.strokeStyle = '#6a5030';
    ctx.lineWidth   = 6;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.bezierCurveTo(
      cx + Math.sin(t * 0.3) * 8, baseY - trunkH * 0.3,
      cx - Math.sin(t * 0.25) * 6, baseY - trunkH * 0.7,
      cx, baseY - trunkH
    );
    ctx.stroke();

    // Roots
    ctx.strokeStyle = 'rgba(106,80,48,.4)';
    ctx.lineWidth   = 2;
    ROOT_OFFSETS.forEach(rx => {
      ctx.beginPath();
      ctx.moveTo(cx, baseY);
      ctx.bezierCurveTo(cx + rx * 50, baseY + 10, cx + rx * 80, baseY + 20, cx + rx * 90, baseY + 30);
      ctx.stroke();
    });

    // Branches + leaves for each generation layer
    GENERATIONS.forEach((g, gi) => {
      const branchY = baseY - trunkH * (0.4 + gi * 0.24);
      const sw      = Math.sin(t * 0.4 + gi) * 0.015;
      for (let i = 0; i < 6; i++) {
        const a  = (i / 6) * Math.PI * 2;
        const bx = cx + Math.cos(a) * g.spread;
        const by = branchY + Math.sin(a) * g.spread * 0.4;
        ctx.strokeStyle = 'rgba(90,130,60,.45)';
        ctx.lineWidth   = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, branchY);
        ctx.lineTo(bx + sw * 20, by);
        ctx.stroke();
        ctx.save();
        ctx.translate(bx + sw * 20, by);
        ctx.rotate(a + sw * 2);
        ctx.fillStyle = g.col;
        ctx.beginPath();
        ctx.moveTo(0, -g.sz);
        ctx.bezierCurveTo( g.sz * 0.5, -g.sz * 0.4,  g.sz * 0.5, g.sz * 0.4, 0,  g.sz);
        ctx.bezierCurveTo(-g.sz * 0.5,  g.sz * 0.4, -g.sz * 0.5, -g.sz * 0.4, 0, -g.sz);
        ctx.fill();
        ctx.restore();
      }
    });

    // Golden glow at crown
    const topY = baseY - trunkH;
    const gg   = ctx.createRadialGradient(cx, topY, 0, cx, topY, 60);
    gg.addColorStop(0, 'rgba(200,160,82,.2)');
    gg.addColorStop(1, 'rgba(200,160,82,0)');
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(cx, topY, 60, 0, Math.PI * 2);
    ctx.fill();

    // Bottom fade-out
    const fade = ctx.createLinearGradient(0, H * 0.78, 0, H);
    fade.addColorStop(0, 'rgba(26,40,20,0)');
    fade.addColorStop(1, 'rgba(26,40,20,.85)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);
  }

  createVisibilityLoop(canvas, draw);
})();