import { syncCanvas } from '../canvasSync.js';

/** Swaying stems — throttled motion vs original. */
export function initAbout() {
  const canvas = document.getElementById('about-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let t = 0;
  const STEMS = [
    { x: 0.28, h: 0.55, leaves: [0.25, 0.45, 0.65, 0.8], col: '#5a7a50', lc: 'rgba(107,160,90,.7)' },
    { x: 0.52, h: 0.62, leaves: [0.2, 0.4, 0.6, 0.75], col: '#4a6a40', lc: 'rgba(90,140,80,.65)' },
    { x: 0.72, h: 0.5, leaves: [0.3, 0.5, 0.7], col: '#6a8a58', lc: 'rgba(120,170,100,.6)' },
    { x: 0.15, h: 0.45, leaves: [0.35, 0.6], col: '#3d5c3d', lc: 'rgba(80,120,70,.6)' }
  ];

  let raf = 0;
  function draw() {
    t += 0.006;
    syncCanvas(canvas);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a3d22');
    bg.addColorStop(1, '#1a2814');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(107,140,107,.05)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < H; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    STEMS.forEach((s) => {
      const cx = s.x * W;
      const baseY = H * 0.96;
      const tipY = baseY - s.h * H;
      ctx.strokeStyle = s.col;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, baseY);
      ctx.bezierCurveTo(
        cx + Math.sin(t) * 6,
        baseY - (tipY - baseY) * 0.3 * -1,
        cx - Math.sin(t) * 4,
        baseY - (tipY - baseY) * 0.72 * -1,
        cx,
        tipY
      );
      ctx.stroke();
      s.leaves.forEach((ly, i) => {
        const lx = cx + Math.sin(t * 0.7 + i) * 2.5;
        const lcy = baseY - (baseY - tipY) * ly;
        const side = i % 2 === 0 ? 1 : -1;
        ctx.save();
        ctx.translate(lx, lcy);
        ctx.rotate(side * 0.6 + Math.sin(t + i) * 0.04);
        const lg = ctx.createLinearGradient(0, 0, side * 30, -20);
        lg.addColorStop(0, s.lc);
        lg.addColorStop(1, 'rgba(107,140,107,.08)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(side * 18, -10, side * 28, -8, side * 30, -18);
        ctx.bezierCurveTo(side * 20, -12, side * 8, -5, 0, 0);
        ctx.fill();
        ctx.restore();
      });
    });

    for (let i = 0; i < 12; i++) {
      const px = W * 0.5 + Math.cos(t * 0.28 + i * 0.7) * W * 0.32;
      const py = H * 0.4 + Math.sin(t * 0.35 + i * 0.5) * H * 0.28;
      const grd = ctx.createRadialGradient(px, py, 0, px, py, 5);
      grd.addColorStop(0, 'rgba(200,160,82,.45)');
      grd.addColorStop(1, 'rgba(200,160,82,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const fade = ctx.createLinearGradient(0, H * 0.75, 0, H);
    fade.addColorStop(0, 'rgba(26,40,20,0)');
    fade.addColorStop(1, 'rgba(26,40,20,.75)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(draw);
  }

  draw();
  return () => cancelAnimationFrame(raf);
}
