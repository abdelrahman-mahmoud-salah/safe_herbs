'use strict';

PageUtils.initCursor(['.test-card', '.photo-panel']);
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.check-item, .stat-cell, .test-card');

const { syncCanvas, createVisibilityLoop } = PageUtils;

/* ════════════════════════════════════════
   HERO SLIDESHOW — auto-rotating background images
════════════════════════════════════════ */
(function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.slideshow-dots .dot');
  if (!slides.length) return;

  let current = 0;

  window.goToSlide = function(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  };

  setInterval(function() {
    goToSlide((current + 1) % slides.length);
  }, 5000);
})();

/* ════════════════════════════════════════
   PIPELINE CANVAS — scroll-driven 7-step quality flow
════════════════════════════════════════ */
(function initPipeline() {
  const canvas = document.getElementById('pipeline-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const driver = document.getElementById('pipeline-driver');
  let t = 0;

  const STEPS = [
    { label: 'Arrival & Quarantine',  sub: 'Raw material held pending lab results',   col: '#c8a052', icon: '🌿' },
    { label: 'Sensory Inspection',    sub: 'Visual, aroma & taste grading by QC team', col: '#6b8c6b', icon: '👁'  },
    { label: 'Lab Analysis',          sub: 'External accredited laboratory testing',    col: '#8a9a5b', icon: '🔬' },
    { label: 'Sieving & Gravity',     sub: 'Dust, stone & foreign body removal',       col: '#c8a052', icon: '⚙'  },
    { label: 'Milling & Sizing',      sub: 'Particle size matched to specification',   col: '#6b8c6b', icon: '⚡' },
    { label: 'Colour Sorting',        sub: 'Optical rejection of off-colour material', col: '#8a9a5b', icon: '✨' },
    { label: 'Pack & Archive',        sub: 'Final test — sample retained 2 years',     col: '#c8a052', icon: '📦' },
  ];

  const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
    p:      i / 80,
    speed:  0.0008 + Math.random() * 0.0012,
    size:   Math.random() * 5 + 2,
    col:    ['#c8a052', '#8ab870', '#d4b870', '#a0c060', '#e2c07a'][i % 5],
    al:     Math.random() * 0.6 + 0.2,
    wobble: Math.random() * Math.PI * 2,
  }));

  function pathXY(p, W, H) {
    const margin = 80;
    return {
      x: margin + p * (W - margin * 2),
      y: H * 0.5 + Math.sin(p * Math.PI * 2) * H * 0.18,
    };
  }

  function getScrollProgress() {
    const rect    = driver.getBoundingClientRect();
    const total   = driver.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    return Math.max(0, Math.min(1, scrolled / total));
  }

  function draw() {
    t += 0.006;
    syncCanvas(canvas);
    const W = canvas._logicalWidth || canvas.width, H = canvas._logicalHeight || canvas.height;
    const progress = getScrollProgress();
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#ede5d0');
    bg.addColorStop(1, '#e5dcc6');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(107,140,107,.07)';
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = 'rgba(107,140,107,.2)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    for (let s = 0; s <= 200; s++) {
      const { x, y } = pathXY(s / 200, W, H);
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const visibleP = Math.min(1, progress * 1.4);
    PARTICLES.forEach(p => {
      p.p = (p.p + p.speed) % 1;
      if (p.p > visibleP + 0.1) return;
      const { x, y } = pathXY(p.p, W, H);
      ctx.save();
      ctx.globalAlpha = p.al * Math.min(1, (visibleP - p.p + 0.12) / 0.12);
      ctx.translate(x + Math.sin(t + p.wobble) * 6, y + Math.cos(t * 0.8 + p.wobble) * 4);
      ctx.rotate(p.p * Math.PI * 4 + t * 0.3);
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo( p.size * 0.5, -p.size * 0.4,  p.size * 0.5, p.size * 0.4, 0,  p.size);
      ctx.bezierCurveTo(-p.size * 0.5,  p.size * 0.4, -p.size * 0.5, -p.size * 0.4, 0, -p.size);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;

    STEPS.forEach((step, i) => {
      const sp        = (i + 0.5) / STEPS.length;
      const { x, y } = pathXY(sp, W, H);
      const activated = progress >= (i / STEPS.length) - 0.02;
      const alpha     = activated ? 1 : 0.25;
      const scale     = activated ? 1 + Math.sin(t * 2 + i) * 0.04 : 0.85;

      if (activated) {
        const pulse = 1 + Math.sin(t * 2 + i) * 0.35;
        ctx.beginPath();
        ctx.arc(x, y, 32 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,160,82,.07)';
        ctx.fill();
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fillStyle   = activated ? step.col : 'rgba(107,140,107,.2)';
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.strokeStyle = activated ? 'rgba(255,255,255,.4)' : 'rgba(107,140,107,.3)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      ctx.fillStyle       = activated ? '#fff' : 'rgba(30,35,24,.4)';
      ctx.font            = `500 11px 'Jost', sans-serif`;
      ctx.textAlign       = 'center';
      ctx.textBaseline    = 'middle';
      ctx.fillText(String(i + 1).padStart(2, '0'), 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;

      const above  = i % 2 === 0;
      const labelY = above ? y - 52 : y + 52;
      ctx.globalAlpha = alpha;

      const labelW = Math.min(W * 0.22, 180);
      const lx     = Math.max(labelW / 2 + 10, Math.min(W - labelW / 2 - 10, x));
      ctx.fillStyle = activated ? 'rgba(30,35,24,.9)' : 'rgba(30,35,24,.3)';
      ctx.beginPath();
      ctx.roundRect(lx - labelW / 2, labelY - 22, labelW, 44, 6);
      ctx.fill();

      ctx.fillStyle       = activated ? 'rgba(245,240,232,.95)' : 'rgba(245,240,232,.35)';
      ctx.font            = `500 9.5px 'Jost', sans-serif`;
      ctx.textAlign       = 'center';
      ctx.textBaseline    = 'middle';
      ctx.fillText(step.label.toUpperCase(), lx, labelY - 7);
      ctx.fillStyle = activated ? 'rgba(200,160,82,.9)' : 'rgba(200,160,82,.3)';
      ctx.font      = `300 9px 'Jost', sans-serif`;
      ctx.fillText(step.sub, lx, labelY + 9);

      ctx.strokeStyle = activated ? step.col + '88' : 'rgba(107,140,107,.2)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(x, above ? y - 28 : y + 28);
      ctx.lineTo(x, above ? labelY + 22 : labelY - 22);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = 'rgba(30,35,24,.35)';
    ctx.font      = `300 11px 'Jost', sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(progress * 100)}% complete`, W - 24, H - 20);
    ctx.textAlign = 'left';
  }

  createVisibilityLoop(canvas, draw);
})();