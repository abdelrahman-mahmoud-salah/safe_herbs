import { syncCanvas } from '../canvasSync.js';

export function initProducts() {
  const CYCLE = 300;
  const STAGE_LABELS = ['Planting seeds', 'Seedling sprouting', 'Plant growing', 'Harvest time'];
  const eio = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  function drawSky(ctx, W, H, day) {
    const sk = ctx.createLinearGradient(0, 0, 0, H * 0.54);
    const r = Math.round(10 + day * 115);
    const g = Math.round(18 + day * 88);
    const b = Math.round(8 + day * 55);
    sk.addColorStop(0, `rgb(${r},${g},${b})`);
    sk.addColorStop(1, `rgb(${Math.round(r * 0.52)},${Math.round(g * 0.6)},${Math.round(b * 0.44)})`);
    ctx.fillStyle = sk;
    ctx.fillRect(0, 0, W, H * 0.54);
  }

  function drawSun(ctx, W, H, rawP) {
    const al = Math.max(0, Math.sin(rawP * Math.PI) * 0.85);
    if (al < 0.04) return;
    const sx = W * (0.12 + rawP * 0.76);
    const sy = H * 0.16 - Math.sin(rawP * Math.PI) * H * 0.09;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 20);
    sg.addColorStop(0, `rgba(255,215,70,${al})`);
    sg.addColorStop(0.5, `rgba(255,170,30,${al * 0.5})`);
    sg.addColorStop(1, 'rgba(255,140,10,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,235,100,${al})`;
    ctx.fill();
  }

  function drawGround(ctx, W, H) {
    const gg = ctx.createLinearGradient(0, H * 0.5, 0, H);
    gg.addColorStop(0, '#4a3218');
    gg.addColorStop(0.35, '#5e4020');
    gg.addColorStop(1, '#2e1a08');
    ctx.fillStyle = gg;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
    ctx.strokeStyle = 'rgba(80,48,18,.42)';
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      const y = H * 0.54 + i * H * 0.088;
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(i) * 2.5);
      ctx.lineTo(W, y + Math.sin(i + 1) * 2.5);
      ctx.stroke();
    }
  }

  function drawRain(ctx, W, H, rawP) {
    if (rawP < 0.14 || rawP > 0.44) return;
    const al = rawP < 0.22 ? (rawP - 0.14) / 0.08 : rawP > 0.36 ? 1 - (rawP - 0.36) / 0.08 : 1;
    ctx.save();
    ctx.globalAlpha = al * 0.42;
    ctx.strokeStyle = '#90c0e0';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 14; i++) {
      const rx = (W * 0.04 + (i / 13) * W * 0.92 + rawP * W * 2.8) % W;
      const ry = (H * 0.04 + i * 18 + rawP * H * 7) % (H * 0.5);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 1.2, ry + 9);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSeed(ctx, x, y, p) {
    if (p > 0.16) return;
    ctx.save();
    ctx.globalAlpha = 1 - p / 0.16;
    ctx.fillStyle = '#c8a052';
    ctx.beginPath();
    ctx.ellipse(x, y, 4.5, 7.5, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6020';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  function drawSparkles(ctx, W, H, rawP) {
    if (rawP < 0.88) return;
    const fp = (rawP - 0.88) / 0.12;
    for (let i = 0; i < 10; i++) {
      const sx = W * (0.1 + (i / 9) * 0.8);
      const sy = H * (0.25 + Math.sin(i * 1.4) * 0.14) - fp * 22;
      ctx.save();
      ctx.globalAlpha = fp * 0.75;
      ctx.fillStyle = '#c8a052';
      ctx.beginPath();
      ctx.arc(sx, sy, fp * 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,160,82,.5)';
      ctx.lineWidth = 0.8;
      for (let r = 0; r < 4; r++) {
        const ra = (r / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(ra) * 4, sy + Math.sin(ra) * 4);
        ctx.lineTo(sx + Math.cos(ra) * 9 * fp, sy + Math.sin(ra) * 9 * fp);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawHerb(ctx, cx, gY, p) {
    if (p < 0.04) {
      drawSeed(ctx, cx, gY - 8, p);
      return;
    }
    const h = Math.min(p * 2.6, 1) * 128;
    ctx.strokeStyle = '#5a8040';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, gY);
    ctx.bezierCurveTo(cx + 5, gY - h * 0.38, cx - 4, gY - h * 0.72, cx + 2, gY - h);
    ctx.stroke();
    if (p > 0.18) {
      [
        [0.28, -1, 30, 13],
        [0.46, 1, 26, 11],
        [0.62, -1, 34, 14],
        [0.78, 1, 28, 12],
        [0.92, -1, 20, 9]
      ].forEach(([fr, sd, lw, lh]) => {
        const em = Math.max(0, Math.min(1, (p - (0.18 + fr * 0.28)) * 5));
        if (em < 0.01) return;
        const lx = cx + Math.sin(-0.3 * fr) * 4;
        const ly = gY - h * fr;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(sd * (0.62 + fr * 0.18));
        const lg = ctx.createLinearGradient(0, 0, sd * lw * em, -lh * em * 0.5);
        lg.addColorStop(0, '#4a7830');
        lg.addColorStop(1, '#80c060');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sd * lw * em * 0.38, -lh * em * 0.55, sd * lw * em * 0.78, -lh * em * 0.28, sd * lw * em, 0);
        ctx.bezierCurveTo(sd * lw * em * 0.58, lh * em * 0.18, sd * lw * em * 0.18, lh * em * 0.08, 0, 0);
        ctx.fill();
        ctx.strokeStyle = '#3a6022';
        ctx.lineWidth = 0.4;
        ctx.stroke();
        ctx.restore();
      });
    }
    if (p > 0.82) {
      const fp = (p - 0.82) / 0.18;
      [
        [0, -h],
        [-14, -h * 0.72],
        [15, -h * 0.83]
      ].forEach(([ox, oy], fi) => {
        ctx.save();
        ctx.globalAlpha = fp;
        ctx.translate(cx + ox, gY + oy);
        for (let pi = 0; pi < 5; pi++) {
          const a = (pi / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * 5.5, Math.sin(a) * 5.5, 4.5, 2.8, a, 0, Math.PI * 2);
          ctx.fillStyle = fi === 0 ? '#f0e055' : '#f0a055';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#e8c030';
        ctx.fill();
        ctx.restore();
      });
    }
  }

  function drawSeedPlant(ctx, cx, gY, p) {
    if (p < 0.04) {
      drawSeed(ctx, cx, gY - 8, p);
      return;
    }
    const h = Math.min(p * 2.9, 1) * 115;
    ctx.strokeStyle = '#7a9252';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx, gY);
    ctx.lineTo(cx + 2, gY - h * 0.48);
    ctx.lineTo(cx - 1, gY - h);
    ctx.stroke();
    if (p > 0.28) {
      const bp = Math.min((p - 0.28) / 0.42, 1);
      [
        [-1, 0.35, -0.78],
        [1, 0.58, 0.72]
      ].forEach(([sd, fr, ang]) => {
        const bl = 28 * bp;
        ctx.strokeStyle = '#7a9252';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, gY - h * fr);
        ctx.lineTo(cx + sd * Math.cos(ang) * bl, gY - h * fr - Math.sin(Math.abs(ang)) * bl * 0.65);
        ctx.stroke();
      });
    }
    if (p > 0.48) {
      const sp = Math.min((p - 0.48) / 0.42, 1);
      const tx = cx - 1;
      const ty = gY - h;
      ctx.strokeStyle = '#6a8042';
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const r = 24 * sp;
        const ex = tx + Math.cos(ang) * r;
        const ey = ty + Math.sin(ang) * r * 0.48;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        if (sp > 0.55) {
          ctx.beginPath();
          ctx.arc(ex, ey, 2.5 * sp, 0, Math.PI * 2);
          ctx.fillStyle = p > 0.82 ? '#d4a840' : '#b0c870';
          ctx.fill();
        }
      }
    }
  }

  function drawBulb(ctx, cx, gY, p, type) {
    if (p < 0.04) {
      drawSeed(ctx, cx, gY - 6, p);
      return;
    }
    if (p > 0.22) {
      const bp = Math.min((p - 0.22) / 0.62, 1);
      const r = bp * (type === 0 ? 21 : 15);
      if (type === 0) {
        const og = ctx.createRadialGradient(cx - r * 0.22, gY + r * 0.25, 0, cx, gY, r * 1.2);
        og.addColorStop(0, `rgba(215,175,82,${bp * 0.92})`);
        og.addColorStop(0.55, `rgba(178,128,48,${bp * 0.78})`);
        og.addColorStop(1, `rgba(115,75,18,${bp * 0.38})`);
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.ellipse(cx, gY + 5, r, r * 1.12, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let l = 0; l < 4; l++) {
          ctx.beginPath();
          ctx.ellipse(cx, gY + 5, r * (1 - l * 0.17), r * 1.12 * (1 - l * 0.17), 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(178,138,58,${bp * 0.22})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      } else {
        const garr = ctx.createRadialGradient(cx - r * 0.22, gY - r * 0.12, 0, cx, gY, r * 1.3);
        garr.addColorStop(0, `rgba(248,238,205,${bp * 0.95})`);
        garr.addColorStop(0.6, `rgba(212,196,156,${bp * 0.8})`);
        garr.addColorStop(1, `rgba(158,138,98,${bp * 0.3})`);
        ctx.fillStyle = garr;
        ctx.beginPath();
        ctx.ellipse(cx, gY + 3, r * 0.78, r * 1.12, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let cl = 0; cl < 5; cl++) {
          const ca = (cl / 5) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(ca) * r * 0.4, gY + 3 + Math.sin(ca) * r * 0.44, r * 0.22, r * 0.34, ca, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(178,158,98,${bp * 0.38})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      ctx.strokeStyle = 'rgba(95,65,28,.38)';
      ctx.lineWidth = 0.75;
      for (let ri = 0; ri < 6; ri++) {
        const ra = Math.PI + (ri / 5 - 0.5) * 1.25;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ra) * r * 0.58, gY + r + Math.sin(ra) * r * 0.28);
        ctx.bezierCurveTo(
          cx + Math.cos(ra) * r * 0.9 + (ri - 2) * 3,
          gY + r + 11,
          cx + Math.cos(ra) * r + (ri - 2) * 5,
          gY + r + 19,
          cx + Math.cos(ra) * r * 1.1 + (ri - 2) * 8,
          gY + r + 27
        );
        ctx.stroke();
      }
    }
    const h = Math.min(p * 3.1, 1) * 98;
    const cnt = type === 0 ? 5 : 7;
    for (let li = 0; li < cnt; li++) {
      if (p < 0.11 + li * 0.07) continue;
      const lp = Math.min((p - 0.11 - li * 0.07) / 0.32, 1);
      const ang = (li / cnt) * Math.PI * 2 - Math.PI / 2;
      const lh = h * lp * (0.68 + Math.sin(ang) * 0.28);
      const lean = Math.cos(ang) * 11 * lp;
      ctx.strokeStyle = type === 0 ? '#6a9840' : '#8ab850';
      ctx.lineWidth = 2.1 - li * 0.14;
      ctx.beginPath();
      ctx.moveTo(cx, gY);
      ctx.bezierCurveTo(cx + lean * 0.28, gY - lh * 0.38, cx + lean * 0.68, gY - lh * 0.72, cx + lean, gY - lh);
      ctx.stroke();
    }
  }

  const CARDS = [
    { id: 'pc1', dotsId: 'dots1', lblId: 'lbl1', type: 'herb', startFrame: 0 },
    { id: 'pc2', dotsId: 'dots2', lblId: 'lbl2', type: 'seed', startFrame: CYCLE / 3 },
    { id: 'pc3', dotsId: 'dots3', lblId: 'lbl3', type: 'bulb', startFrame: (CYCLE * 2) / 3 }
  ];

  const PLANT_POSITIONS = {
    herb: [
      [0.19, 0],
      [0.37, 0.055],
      [0.56, 0.03],
      [0.75, 0.09]
    ],
    seed: [
      [0.18, 0],
      [0.36, 0.065],
      [0.55, 0.035],
      [0.74, 0.1]
    ],
    bulb: [
      [0.22, 0, 0],
      [0.44, 0.06, 1],
      [0.65, 0.03, 0]
    ]
  };

  const cleanups = [];

  CARDS.forEach((card) => {
    const canvas = document.getElementById(card.id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dotsRoot = document.getElementById(card.dotsId);
    const lblEl = document.getElementById(card.lblId);
    if (!dotsRoot || !lblEl) return;
    const dots = dotsRoot.querySelectorAll('.sdot');

    let frame = Math.floor(card.startFrame);
    let active = false;
    let rafId = null;

    function tick() {
      if (!active) {
        rafId = null;
        return;
      }
      frame++;
      syncCanvas(canvas);
      const W = canvas._logicalWidth || canvas.width;
      const H = canvas._logicalHeight || canvas.height;
      if (W < 2 || H < 2) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const rawP = (frame % CYCLE) / CYCLE;
      const p = eio(rawP);
      const gY = H * 0.52;
      const day = Math.sin(rawP * Math.PI) * 0.68 + 0.14;

      ctx.clearRect(0, 0, W, H);
      drawSky(ctx, W, H, day);
      drawSun(ctx, W, H, rawP);
      drawRain(ctx, W, H, rawP);
      drawGround(ctx, W, H);

      PLANT_POSITIONS[card.type].forEach((pos) => {
        const [fx, off, btype] = pos;
        const pp = Math.max(0, Math.min(1, p - off));
        if (pp < 0.02) return;
        if (card.type === 'herb') drawHerb(ctx, W * fx, gY, pp);
        else if (card.type === 'seed') drawSeedPlant(ctx, W * fx, gY, pp);
        else drawBulb(ctx, W * fx, gY, pp, btype);
      });

      drawSparkles(ctx, W, H, rawP);

      const si = rawP < 0.17 ? 0 : rawP < 0.42 ? 1 : rawP < 0.76 ? 2 : 3;
      dots.forEach((d, i) => d.classList.toggle('active', i === si));
      lblEl.textContent = STAGE_LABELS[si];

      rafId = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          active = e.isIntersecting;
          if (active && !rafId) tick();
        });
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);
    cleanups.push(() => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
