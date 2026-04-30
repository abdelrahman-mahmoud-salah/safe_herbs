'use strict';

// Shared utilities provided by js/pageUtils.js — must be loaded before this script.

PageUtils.initCursor();
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.counter-cell, .milestone-card, .impact-item', 0.1);

const { syncCanvas, createVisibilityLoop } = PageUtils;

/* ════════════════════════════════════════
   ASSOC CANVAS — farmer network nodes
════════════════════════════════════════ */
(function initAssocCanvas() {
  const canvas = document.getElementById('assoc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const NODE_COLORS = ['#c8a052', '#6b8c6b', '#8ab870', '#d4b870'];

  const NODES = Array.from({ length: 60 }, (_, i) => ({
    x:     0.1 + Math.random() * 0.8,
    y:     0.1 + Math.random() * 0.8,
    r:     Math.random() * 5 + 2.5,
    phase: Math.random() * Math.PI * 2,
    vx:    (Math.random() - 0.5) * 0.0002,
    vy:    (Math.random() - 0.5) * 0.0002,
    col:   NODE_COLORS[i % 4],
  }));

  function draw() {
    t += 0.007;
    syncCanvas(canvas);
    const W = canvas._logicalWidth || canvas.width, H = canvas._logicalHeight || canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a3d22');
    bg.addColorStop(1, '#1a2814');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(107,140,107,.05)';
    ctx.lineWidth   = 0.5;
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Move nodes, bounce off edges
    NODES.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0.02 || n.x > 0.98) n.vx *= -1;
      if (n.y < 0.02 || n.y > 0.98) n.vy *= -1;
    });

    // Connections: O(n²) — draw line when nodes are close enough
    const CONNECTION_THRESHOLD = W * 0.18;
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const a = NODES[i], b = NODES[j];
        const d = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
        if (d < CONNECTION_THRESHOLD) {
          ctx.beginPath();
          ctx.moveTo(a.x * W, a.y * H);
          ctx.lineTo(b.x * W, b.y * H);
          ctx.strokeStyle = `rgba(200,160,82,${(1 - d / CONNECTION_THRESHOLD) * 0.1})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    // Node dots
    NODES.forEach(n => {
      const pulse = 1 + Math.sin(t + n.phase) * 0.15;
      ctx.beginPath();
      ctx.arc(n.x * W, n.y * H, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle   = n.col;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Central company node
    const cx = W * 0.5, cy = H * 0.5;
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    cg.addColorStop(0, 'rgba(200,160,82,.3)');
    cg.addColorStop(1, 'rgba(200,160,82,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#c8a052';
    ctx.fill();

    ctx.fillStyle       = 'rgba(30,35,24,.9)';
    ctx.font            = 'bold 9px sans-serif';
    ctx.textAlign       = 'center';
    ctx.textBaseline    = 'middle';
    ctx.fillText('SHS', cx, cy);
    ctx.textAlign       = 'left';
    ctx.textBaseline    = 'alphabetic';

    // Bottom fade
    const fade = ctx.createLinearGradient(0, H * 0.76, 0, H);
    fade.addColorStop(0, 'rgba(26,40,20,0)');
    fade.addColorStop(1, 'rgba(26,40,20,.85)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);
  }

  createVisibilityLoop(canvas, draw);
})();

/* ════════════════════════════════════════
   IMPACT CANVAS — member growth bar chart
════════════════════════════════════════ */
(function initImpactCanvas() {
  const canvas = document.getElementById('impact-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const BARS = [
    { v: 0.35, col: 'rgba(107,140,107,.5)',  lbl: '2006' },
    { v: 0.55, col: 'rgba(107,140,107,.62)', lbl: '2008' },
    { v: 0.70, col: 'rgba(107,140,107,.72)', lbl: '2010' },
    { v: 0.80, col: 'rgba(200,160,82,.7)',   lbl: '2012' },
    { v: 0.88, col: 'rgba(200,160,82,.8)',   lbl: '2015' },
    { v: 0.94, col: 'rgba(200,160,82,.9)',   lbl: '2020' },
    { v: 0.99, col: '#c8a052',               lbl: 'Today' },
  ];

  function draw() {
    t += 0.005;
    syncCanvas(canvas);
    const W = canvas._logicalWidth || canvas.width, H = canvas._logicalHeight || canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Parchment background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#ede5d0');
    bg.addColorStop(1, '#e0d4bc');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(107,140,107,.1)';
    ctx.lineWidth   = 0.5;
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Bar layout
    const barW   = W / (BARS.length * 1.6);
    const gap    = barW * 0.6;
    const totalW = BARS.length * (barW + gap) - gap;
    const startX = (W - totalW) / 2;

    BARS.forEach((b, i) => {
      const x     = startX + i * (barW + gap);
      const animV = b.v * (1 - Math.max(0, Math.sin(t + i * 0.3) * 0.02));
      const barH  = animV * H * 0.72;
      const by    = H * 0.88 - barH;

      // Bar with gradient
      const grad = ctx.createLinearGradient(x, by, x, H * 0.88);
      grad.addColorStop(0, b.col);
      grad.addColorStop(1, b.col.replace(/[\d.]+\)$/, '0.2)'));
      ctx.fillStyle = grad;
      ctx.fillRect(x, by, barW, barH);

      // Top glow strip
      ctx.fillStyle = b.col.replace(/[\d.]+\)$/, '0.4)');
      ctx.fillRect(x, by, barW, 3);

      // Year label below bar
      ctx.fillStyle = 'rgba(30,35,24,.5)';
      ctx.font      = '400 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.lbl, x + barW / 2, H * 0.93);

      // Member count above bar
      const isFinal = i === BARS.length - 1;
      ctx.fillStyle = isFinal ? '#c8a052' : 'rgba(30,35,24,.6)';
      ctx.font      = `${isFinal ? '500' : '400'} 10px sans-serif`;
      ctx.fillText(Math.round(animV * 196) + ' mbrs', x + barW / 2, by - 8);

      ctx.textAlign = 'left';
    });

    // X-axis line
    ctx.strokeStyle = 'rgba(107,140,107,.3)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(startX - 10, H * 0.88);
    ctx.lineTo(startX + totalW + 10, H * 0.88);
    ctx.stroke();

    // Chart title
    ctx.fillStyle = 'rgba(30,35,24,.4)';
    ctx.font      = '300 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Association member growth', W / 2, H * 0.04 + 14);
    ctx.textAlign = 'left';
  }

  createVisibilityLoop(canvas, draw);
})();