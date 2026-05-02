'use strict';

// Shared utilities (cursor, nav, hamburger, reveal, syncCanvas, createVisibilityLoop)
// provided by js/pageUtils.js — must be loaded before this script.

PageUtils.initCursor(['.farm-block', '.legend-item']);
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.stat-item, .soil-feature');

const { syncCanvas, createVisibilityLoop } = PageUtils;

/* ════════════════════════════════════════
   HERO CANVAS — aerial field view
════════════════════════════════════════ */
// (function initHero() {
//   const canvas = document.getElementById('hero-canvas');
//   if (!canvas) return;
//   const ctx = canvas.getContext('2d');
//   let t = 0;

//   const ROWS = 28;
//   const COLORS = ['#2a4a20', '#305428', '#244018', '#3a5c2a', '#1e3614'];

//   function draw() {
//     t += 0.004;
//     syncCanvas(canvas);
//     const W = canvas._logicalWidth || canvas.width, H = canvas._logicalHeight || canvas.height;
//     ctx.clearRect(0, 0, W, H);

//     // Sky gradient
//     const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
//     sky.addColorStop(0, '#0e1c0a');
//     sky.addColorStop(1, '#1e3614');
//     ctx.fillStyle = sky;
//     ctx.fillRect(0, 0, W, H);

//     // Aerial farm rows (perspective projection)
//     for (let i = 0; i < ROWS; i++) {
//       const y = H * 0.35 + (i / ROWS) * H * 0.65;
//       const wid = W * (0.1 + (i / ROWS) * 0.9);
//       const x0 = (W - wid) / 2;
//       const h = (H * 0.65 / ROWS) * 0.72;
//       const wave = Math.sin(t + i * 0.3) * (i / ROWS) * 6;
//       ctx.fillStyle = COLORS[i % COLORS.length];
//       ctx.globalAlpha = 0.55 + (i / ROWS) * 0.35;
//       ctx.beginPath();
//       ctx.moveTo(x0, y + wave);
//       ctx.lineTo(x0 + wid, y + wave);
//       ctx.lineTo(x0 + wid - wid * 0.02, y + h + wave);
//       ctx.lineTo(x0 + wid * 0.02, y + h + wave);
//       ctx.closePath();
//       ctx.fill();
//     }
//     ctx.globalAlpha = 1;

//     // Nile canal
//     ctx.strokeStyle = 'rgba(60,130,180,.45)';
//     ctx.lineWidth = 3 + Math.sin(t * 0.5) * 0.5;
//     ctx.beginPath();
//     ctx.moveTo(W * 0.48, H * 0.35);
//     ctx.bezierCurveTo(W * 0.5, H * 0.55, W * 0.49, H * 0.72, W * 0.51, H);
//     ctx.stroke();

//     // Floating ambient particles
//     for (let i = 0; i < 20; i++) {
//       const px = W * (0.1 + ((i / 20 + t * 0.012) % 0.9));
//       const py = H * (0.15 + Math.sin(t * 0.4 + i * 0.8) * 0.08);
//       ctx.beginPath();
//       ctx.arc(px, py, 1.5, 0, Math.PI * 2);
//       ctx.fillStyle = 'rgba(200,160,82,.5)';
//       ctx.fill();
//     }

//     // Vignette
//     const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.2, W * 0.5, H * 0.5, H * 0.9);
//     vig.addColorStop(0, 'rgba(0,0,0,0)');
//     vig.addColorStop(1, 'rgba(0,0,0,.55)');
//     ctx.fillStyle = vig;
//     ctx.fillRect(0, 0, W, H);
//   }

//   createVisibilityLoop(canvas, draw);
// })();

/* ════════════════════════════════════════
   MAP CANVAS — Egypt farm locations
════════════════════════════════════════ */
(function initMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const FARMS = [
    { name: 'Fayoum', x: 0.42, y: 0.48, col: '#c8a052', r: 8, label: '195 ha' },
    { name: 'Beni Suef', x: 0.46, y: 0.56, col: '#6b8c6b', r: 9, label: '213 ha' },
    { name: 'Al Minia', x: 0.48, y: 0.63, col: '#6b8c6b', r: 7, label: '100+ ha' },
    { name: 'Assuit', x: 0.50, y: 0.70, col: '#7a5c3a', r: 6.5, label: '84 ha' },
    { name: 'Luxor', x: 0.54, y: 0.80, col: '#7a5c3a', r: 6, label: '60 ha' },
    { name: 'Al Wahat', x: 0.28, y: 0.62, col: '#5a8040', r: 6, label: '50+ ha' },
  ];

  function draw() {
    t += 0.01;
    syncCanvas(canvas);
    const W = canvas._logicalWidth || canvas.width, H = canvas._logicalHeight || canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#dcecd0');
    bg.addColorStop(1, '#c8deb4');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(90,130,70,.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Egypt outline
    ctx.fillStyle = 'rgba(107,140,107,.18)';
    ctx.beginPath();
    ctx.moveTo(W * 0.25, H * 0.10); ctx.lineTo(W * 0.72, H * 0.10);
    ctx.lineTo(W * 0.72, H * 0.25); ctx.lineTo(W * 0.65, H * 0.25);
    ctx.lineTo(W * 0.65, H * 0.18); ctx.lineTo(W * 0.55, H * 0.18);
    ctx.lineTo(W * 0.62, H * 0.42); ctx.lineTo(W * 0.58, H * 0.95);
    ctx.lineTo(W * 0.42, H * 0.95); ctx.lineTo(W * 0.38, H * 0.42);
    ctx.lineTo(W * 0.25, H * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,130,70,.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nile
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.18);
    ctx.bezierCurveTo(W * 0.52, H * 0.35, W * 0.49, H * 0.55, W * 0.51, H * 0.75);
    ctx.bezierCurveTo(W * 0.52, H * 0.85, W * 0.5, H * 0.92, W * 0.5, H * 0.96);
    ctx.strokeStyle = 'rgba(60,130,180,.38)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Western Desert label
    ctx.fillStyle = 'rgba(107,140,107,.25)';
    ctx.font = '500 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WESTERN DESERT', W * 0.18, H * 0.35);
    ctx.textAlign = 'left';

    // Dashed connections from Fayoum to other farms
    ctx.setLineDash([4, 6]);
    FARMS.forEach((f, i) => {
      if (i === 0) return;
      ctx.beginPath();
      ctx.moveTo(FARMS[0].x * W, FARMS[0].y * H);
      ctx.lineTo(f.x * W, f.y * H);
      ctx.strokeStyle = `rgba(107,140,107,${0.14 + Math.sin(t + i) * 0.05})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Farm markers
    FARMS.forEach((f, i) => {
      const px = f.x * W;
      const py = f.y * H;
      const pulse = 1 + Math.sin(t * 1.5 + i) * 0.3;

      const grd = ctx.createRadialGradient(px, py, 0, px, py, f.r * 3 * pulse);
      grd.addColorStop(0, `${f.col}28`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(px, py, f.r * 3 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, f.r, 0, Math.PI * 2);
      ctx.fillStyle = f.col;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#1e2318';
      ctx.font = `${i === 0 ? '600' : '400'} ${i === 0 ? 11 : 10}px sans-serif`;
      ctx.fillText(f.name, px + f.r + 6, py + 4);
      ctx.fillStyle = 'rgba(30,35,24,.5)';
      ctx.font = '400 8px sans-serif';
      ctx.fillText(f.label, px + f.r + 6, py + 14);
    });
  }

  createVisibilityLoop(canvas, draw);
})();


/* ════════════════════════════════════════
   SOIL CANVAS — cross-section illustration
════════════════════════════════════════ */
(function initSoil() {
  const canvas = document.getElementById('soil-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const SOIL_LAYERS = [
    { y: 0.45, h: 0.06, col: '#4a3218', label: 'Topsoil' },
    { y: 0.51, h: 0.12, col: '#3e2810', label: 'Rich Alluvial' },
    { y: 0.63, h: 0.15, col: '#342010', label: 'Clay Layer' },
    { y: 0.78, h: 0.22, col: '#281808', label: 'Subsoil' },
  ];

  const SOIL_BOUNDARIES = [0.45, 0.51, 0.63, 0.78];

  const ROOT_STARTS = [[0.2, 0.45], [0.4, 0.45], [0.6, 0.45], [0.8, 0.45]];

  const ABOVE_GROUND_PLANTS = [[0.2, 0], [0.4, 0.05], [0.6, 0.02], [0.8, 0.07]];

  function draw() {
    t += 0.006;
    syncCanvas(canvas);
    const W = canvas._logicalWidth || canvas.width, H = canvas._logicalHeight || canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1e3218');
    bg.addColorStop(1, '#0e1c0a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Sky stripe
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    sky.addColorStop(0, '#1a2e14');
    sky.addColorStop(1, '#2a4820');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.45);

    // Sun
    const sg = ctx.createRadialGradient(W * 0.75, H * 0.12, 0, W * 0.75, H * 0.12, 30);
    sg.addColorStop(0, 'rgba(255,220,80,.65)');
    sg.addColorStop(1, 'rgba(255,140,10,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(W * 0.75, H * 0.12, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W * 0.75, H * 0.12, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,235,100,.8)';
    ctx.fill();

    // Soil layers
    SOIL_LAYERS.forEach(l => {
      ctx.fillStyle = l.col;
      ctx.fillRect(0, H * l.y, W, H * l.h);
      ctx.fillStyle = 'rgba(245,240,232,.22)';
      ctx.font = '400 9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(l.label.toUpperCase(), W - 16, H * (l.y + l.h * 0.5) + 3);
      ctx.textAlign = 'left';
    });

    // Wavy soil boundaries
    ctx.strokeStyle = 'rgba(200,160,82,.2)';
    ctx.lineWidth = 0.8;
    SOIL_BOUNDARIES.forEach(fy => {
      ctx.beginPath();
      for (let x = 0; x < W; x += 4) {
        const y = H * fy + Math.sin(x * 0.06 + t) * 2.5;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Roots
    ROOT_STARTS.forEach(([rx, ry], ri) => {
      ctx.strokeStyle = 'rgba(90,65,28,.55)';
      ctx.lineWidth = 0.9;
      for (let rd = 0; rd < 4; rd++) {
        const ra = Math.PI * 0.5 + (rd - 1.5) * 0.4;
        const rlen = H * 0.25 * (1 + rd * 0.1);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.bezierCurveTo(
          rx + Math.cos(ra + ri * 0.1) * rlen * 0.4 + Math.sin(t + rd + ri) * 8, ry + Math.sin(ra) * rlen * 0.4,
          rx + Math.cos(ra + ri * 0.1) * rlen * 0.7 + Math.sin(t * 1.1 + rd) * 6, ry + Math.sin(ra) * rlen * 0.7,
          rx + Math.cos(ra + ri * 0.1) * rlen + Math.sin(t * 1.2 + rd + ri) * 5, ry + Math.sin(ra) * rlen
        );
        ctx.stroke();
      }
    });

    // Above-ground plants
    ABOVE_GROUND_PLANTS.forEach(([fx, ph]) => {
      const cx = W * fx;
      const gY = H * 0.45;
      const h = H * 0.28;
      const sw = Math.sin(t * 0.5 + ph * 10);
      ctx.strokeStyle = '#5a8040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, gY);
      ctx.bezierCurveTo(cx + sw * 6, gY - h * 0.38, cx - sw * 4, gY - h * 0.72, cx + sw * 2, gY - h);
      ctx.stroke();
      [[0.3, -1, 24, 10], [0.55, 1, 20, 9], [0.78, -1, 18, 8]].forEach(([lf, sd, lw, lh]) => {
        const lx = cx + sw * 3;
        const ly = gY - h * lf;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(sd * 0.6 + sw * 0.05);
        ctx.fillStyle = 'rgba(75,125,50,.65)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sd * lw, -lh * 0.5, sd * lw * 0.8, -lh * 0.25, sd * lw, 0);
        ctx.bezierCurveTo(sd * lw * 0.5, lh * 0.15, sd * lw * 0.2, lh * 0.05, 0, 0);
        ctx.fill();
        ctx.restore();
      });
    });

    // Nile water seeping through soil
    ctx.strokeStyle = 'rgba(60,130,180,.28)';
    ctx.lineWidth = 1.5;
    for (let wi = 0; wi < 3; wi++) {
      ctx.beginPath();
      for (let x = 0; x < W; x += 4) {
        const y = H * (0.52 + wi * 0.08) + Math.sin(x * 0.08 + t + wi) * 3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = 'rgba(200,160,82,.35)';
    ctx.font = '500 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NILE ALLUVIAL SOIL', W * 0.5, H * 0.57);
    ctx.textAlign = 'left';
  }

  createVisibilityLoop(canvas, draw);
})();