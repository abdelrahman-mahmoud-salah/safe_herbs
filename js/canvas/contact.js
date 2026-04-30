import { syncCanvas } from '../canvasSync.js';

/** Fewer nodes + shorter link distance than original O(n²). */
export function initContact() {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let pts = [];
  let W = 0;
  let H = 0;

  function init() {
    W = canvas._logicalWidth || canvas.width;
    H = canvas._logicalHeight || canvas.height;
    syncCanvas(canvas);
    pts = Array.from({ length: 26 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.8 + 0.5,
      al: Math.random() * 0.26 + 0.06
    }));
  }

  let raf = 0;
  const linkDist = 95;

  function draw() {
    const nW = canvas._logicalWidth || canvas.width;
    const nH = canvas._logicalHeight || canvas.height;
    if (nW !== W || nH !== H) init();
    ctx.clearRect(0, 0, W, H);

    pts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < linkDist) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(200,160,82,${(1 - d / linkDist) * 0.07})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,160,82,${p.al})`;
      ctx.fill();
    });

    raf = requestAnimationFrame(draw);
  }

  init();
  draw();
  return () => cancelAnimationFrame(raf);
}
