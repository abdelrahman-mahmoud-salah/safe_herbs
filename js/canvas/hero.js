import { syncCanvas } from '../canvasSync.js';

/** Lighter hero animation (~28 leaves vs 60). */
export function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let t = 0;
  const LEAF_COLORS = ['#6b8c6b', '#8a9a5b', '#c8a052', '#3d5c3d', '#a0b870'];
  const count = 28;
  const particles = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00014,
    vy: -(Math.random() * 0.00018 + 0.00004),
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.006,
    size: Math.random() * 9 + 4,
    al: Math.random() * 0.28 + 0.06,
    col: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
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

  let raf = 0;
  function draw() {
    t += 0.0045;
    syncCanvas(canvas);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W * 0.5, H);
    bg.addColorStop(0, '#1a2a14');
    bg.addColorStop(0.5, '#2d4a28');
    bg.addColorStop(1, '#0e180b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(107,140,107,.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const grd = ctx.createRadialGradient(W * (0.4 + Math.sin(t) * 0.08), H * 0.4, 0, W * 0.5, H * 0.5, W * 0.55);
    grd.addColorStop(0, 'rgba(107,140,107,.1)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }
      if (p.x < -0.1 || p.x > 1.1) p.x = Math.random();
      drawLeaf(p.x * W, p.y * H, p.size, p.rot, p.col, p.al);
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }

  draw();

  return () => cancelAnimationFrame(raf);
}
