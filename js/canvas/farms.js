import { syncCanvas } from '../canvasSync.js';

export function initFarms() {
  const canvas = document.getElementById('farms-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let t = 0;
  const FARMS = [
    { name: 'Fayoum', x: 0.42, y: 0.48, main: true },
    { name: 'Beni Suef', x: 0.46, y: 0.56, main: false },
    { name: 'Al Minia', x: 0.48, y: 0.63, main: false },
    { name: 'Assuit', x: 0.5, y: 0.7, main: false },
    { name: 'Luxor', x: 0.54, y: 0.8, main: false },
    { name: 'Al Wahat', x: 0.28, y: 0.62, main: false }
  ];

  let raf = 0;
  function draw() {
    t += 0.008;
    syncCanvas(canvas);
    const W = canvas._logicalWidth || canvas.width;
    const H = canvas._logicalHeight || canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#d8eccc');
    bg.addColorStop(1, '#c0d8a8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(90,130,70,.08)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(107,140,107,.15)';
    ctx.beginPath();
    ctx.moveTo(W * 0.25, H * 0.1);
    ctx.lineTo(W * 0.72, H * 0.1);
    ctx.lineTo(W * 0.72, H * 0.25);
    ctx.lineTo(W * 0.65, H * 0.25);
    ctx.lineTo(W * 0.65, H * 0.18);
    ctx.lineTo(W * 0.55, H * 0.18);
    ctx.lineTo(W * 0.62, H * 0.42);
    ctx.lineTo(W * 0.58, H * 0.95);
    ctx.lineTo(W * 0.42, H * 0.95);
    ctx.lineTo(W * 0.38, H * 0.42);
    ctx.lineTo(W * 0.25, H * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,130,70,.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.18);
    ctx.bezierCurveTo(W * 0.52, H * 0.35, W * 0.49, H * 0.55, W * 0.51, H * 0.75);
    ctx.bezierCurveTo(W * 0.52, H * 0.85, W * 0.5, H * 0.92, W * 0.5, H * 0.96);
    ctx.strokeStyle = 'rgba(60,130,180,.3)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.setLineDash([4, 6]);
    FARMS.slice(1).forEach((f, i) => {
      ctx.beginPath();
      ctx.moveTo(FARMS[0].x * W, FARMS[0].y * H);
      ctx.lineTo(f.x * W, f.y * H);
      ctx.strokeStyle = `rgba(107,140,107,${0.12 + Math.sin(t + i) * 0.04})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
    ctx.setLineDash([]);

    FARMS.forEach((f, i) => {
      const px = f.x * W;
      const py = f.y * H;
      const pulse = 1 + Math.sin(t * 1.2 + i) * 0.22;
      ctx.beginPath();
      ctx.arc(px, py, (f.main ? 18 : 12) * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${f.main ? '200,160,82' : '107,140,107'},.1)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, f.main ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = f.main ? '#c8a052' : '#6b8c6b';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = f.main ? '#3d2010' : '#1e2318';
      ctx.font = `${f.main ? '600' : '400'} ${f.main ? 11 : 10}px Inter, sans-serif`;
      ctx.fillText(f.name, px + 10, py + 4);
    });

    raf = requestAnimationFrame(draw);
  }

  draw();
  return () => cancelAnimationFrame(raf);
}
