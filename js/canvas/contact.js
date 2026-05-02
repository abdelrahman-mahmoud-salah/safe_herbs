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
  let active = false;
  let raf = 0;

  function init() {
    syncCanvas(canvas);
    W = canvas._logicalWidth || canvas.width;
    H = canvas._logicalHeight || canvas.height;
    if (W < 2 || H < 2) return;
    pts = Array.from({ length: 26 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.8 + 0.5,
      al: Math.random() * 0.26 + 0.06
    }));
  }

  const linkDist = 95;

  function draw() {
    if (!active) { raf = 0; return; }
    syncCanvas(canvas);
    const nW = canvas._logicalWidth || canvas.width;
    const nH = canvas._logicalHeight || canvas.height;
    
    if (nW !== W || nH !== H) {
      if (W > 0 && H > 0 && pts.length > 0) {
        // scale existing points instead of resetting state
        pts.forEach(p => {
          p.x = p.x * (nW / W);
          p.y = p.y * (nH / H);
        });
      } else {
        init();
      }
      W = nW;
      H = nH;
    }
    
    if (W < 2 || H < 2) { raf = requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, W, H);

    pts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      else if (p.x > W) { p.x = W; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      else if (p.y > H) { p.y = H; p.vy *= -1; }
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

  /* Pause when contact section is off-screen */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        active = e.isIntersecting;
        if (active && !raf) {
          if (pts.length === 0) init();
          draw();
        }
      });
    },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  return () => {
    io.disconnect();
    if (raf) cancelAnimationFrame(raf);
  };
}
