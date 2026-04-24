'use strict';

// Shared utilities provided by js/pageUtils.js — must be loaded before this script.

PageUtils.initCursor(['a', 'button', '.herb-card']);
PageUtils.initNavScroll();
PageUtils.initHamburger();
PageUtils.initReveal('.reveal, .reveal-left, .reveal-right, .step, .q-item', 0.1);

// Alias pageUtils.syncCanvas so existing canvas code below needs no changes
const sync = PageUtils.syncCanvas;

/* ══════════════════════════════════════════════════════════
   HERO CANVAS
   Scene: a pair of hands rising from darkness, holding a
   loose bunch of herbs. Leaves and petals scatter upward.
   Timeline (t 0–1 looping, ~6 s per cycle):
     0.00–0.18  hands rise from bottom, herbs appear
     0.18–0.55  herbs glow and sway gently
     0.55–0.82  petals and leaves scatter upward
     0.82–1.00  fade and reset
══════════════════════════════════════════════════════════ */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let t = 0;

  /* scattered particles released from hands */
  const PARTICLES = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    /* normalised position relative to centre-of-hands */
    ox: (Math.random() - .5) * 2,
    oy: Math.random() * -.1 - Math.random() * 1.2,
    vx: (Math.random() - .5) * .6,
    vy: -(Math.random() * 1.2 + .4),
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - .5) * .04,
    size: Math.random() * 7 + 2,
    alpha: Math.random() * .7 + .3,
    born: Math.random() * .4,/* 0..0.4 = scatter phase start */
    /* type: 0=leaf, 1=petal, 2=seed-dot */
    type: Math.floor(Math.random() * 3),
    col: ['#80c060', '#f0e055', '#c8a052', '#f0a055', '#e08090', '#a0d070', '#d4c870'][Math.floor(Math.random() * 7)]
  }));


  /* draw a stylised herb stem with leaves */
  function drawHerbStem(ctx, cx, cy, height, lean, sway, col, leafCol) {
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(
      cx + lean * .3 + sway * 8, cy - height * .35,
      cx + lean * .6 - sway * 5, cy - height * .72,
      cx + lean, cy - height
    );
    ctx.stroke();
    /* leaves */
    [[.3, -1, 18, 8], [.55, 1, 16, 7], [.78, -1, 14, 6]].forEach(([lf, sd, lw, lh]) => {
      const lx = cx + lean * lf, ly = cy - height * lf;
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(sd * .65 + sway * .04);
      const lg = ctx.createLinearGradient(0, 0, sd * lw, -lh * .5);
      lg.addColorStop(0, leafCol); lg.addColorStop(1, 'rgba(50,100,30,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(sd * lw * .4, -lh * .55, sd * lw * .82, -lh * .28, sd * lw, 0);
      ctx.bezierCurveTo(sd * lw * .6, lh * .2, sd * lw * .2, lh * .06, 0, 0);
      ctx.fill();
      ctx.restore();
    });
  }

  /* draw a small chamomile-style flower */
  function drawFlower(ctx, cx, cy, r, col, petalCol) {
    for (let p = 0; p < 8; p++) {
      const a = (p / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * r * 1.1, cy + Math.sin(a) * r * 1.1, r * .55, r * .3, a, 0, Math.PI * 2);
      ctx.fillStyle = petalCol; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, r * .55, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
  }

  function draw() {
    t = (t + .003) % 1;
    sync(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    /* ── BACKGROUND ── */
    const bg = ctx.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .5, W * .8);
    bg.addColorStop(0, '#1e3218');
    bg.addColorStop(.5, '#142610');
    bg.addColorStop(1, '#080e06');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    /* subtle light shaft */
    const shaft = ctx.createRadialGradient(W * .5, H * .05, 0, W * .5, H * .4, W * .45);
    shaft.addColorStop(0, 'rgba(200,160,82,.12)');
    shaft.addColorStop(1, 'rgba(200,160,82,0)');
    ctx.fillStyle = shaft; ctx.fillRect(0, 0, W, H);

    /* ── PHASE ── */
    const rise = Math.max(0, Math.min(1, t < .18 ? t / .18 : 1));           // 0→1 hands rising
    const settle = Math.max(0, Math.min(1, (t - .18) / .37));                  // steady hold phase
    const scatter = Math.max(0, Math.min(1, t > .55 ? (t - .55) / .27 : 0));     // 0→1 scatter
    const fade = t > .82 ? (t - .82) / .18 : 0;                               // final fade

    /* ── PARTICLE SCATTER ── */
    if (scatter > 0) {
      PARTICLES.forEach(p => {
        const pAlive = scatter - p.born;
        if (pAlive <= 0) return;
        const pT = Math.min(pAlive / .4, 1);

        const hx = W * .5 + p.ox * 80;
        const hy = H * .58 - rise * H * .22;
        const px = hx + p.vx * pT * W * .14;
        const py = hy + p.vy * pT * H * .18 + .5 * 9.8 * pT * pT * H * .02;
        const al = p.alpha * (1 - pT * .7) * (1 - fade);
        if (al <= 0) return;

        ctx.save(); ctx.translate(px, py); ctx.rotate(p.rot + p.rotV * pT * 60); ctx.globalAlpha = al;

        if (p.type === 0) {/* leaf */
          ctx.fillStyle = p.col;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * .5, -p.size * .4, p.size * .5, p.size * .4, 0, p.size);
          ctx.bezierCurveTo(-p.size * .5, p.size * .4, -p.size * .5, -p.size * .4, 0, -p.size);
          ctx.fill();
          ctx.strokeStyle = p.col; ctx.lineWidth = .4;
          ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(0, p.size); ctx.stroke();
        } else if (p.type === 1) {/* petal ellipse */
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.ellipse(0, 0, p.size * .7, p.size * 1.4, 0, 0, Math.PI * 2); ctx.fill();
        } else {/* seed dot */
          ctx.beginPath(); ctx.arc(0, 0, p.size * .5, 0, Math.PI * 2);
          ctx.fillStyle = p.col; ctx.fill();
        }
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    }

    if (rise > 0.05) {
      /* ── HANDS ── */
      const handY = H * .72 - rise * H * .22;
      const sway = Math.sin(t * Math.PI * 3) * .018;
      const glAlpha = Math.max(0, 1 - fade);
      ctx.globalAlpha = glAlpha;

      /* wrist / arm shadows */
      const wg = ctx.createLinearGradient(0, handY + H * .18, 0, handY + H * .5);
      wg.addColorStop(0, 'rgba(0,0,0,0)'); wg.addColorStop(1, 'rgba(0,0,0,.6)');
      ctx.fillStyle = wg; ctx.fillRect(0, handY + H * .1, W, H * .4);

      /* left hand */
      drawHand(ctx, W * .38 + sway * W * .03, handY, Math.min(W, H) * .18, -1, rise);
      /* right hand */
      drawHand(ctx, W * .62 - sway * W * .03, handY, Math.min(W, H) * .18, 1, rise);

      /* ── HERBS HELD IN HANDS ── */
      const herbOpacity = Math.min(1, rise * 3) * (1 - scatter * .8) * (1 - fade);
      if (herbOpacity > 0.02) {
        ctx.globalAlpha = herbOpacity;
        const hcx = W * .5, hcy = handY + Math.min(W, H) * .04;
        const stemH = Math.min(W, H) * .28;
        const sw = Math.sin(t * Math.PI * 4) * .012;

        /* main bunch of stems */
        const stems = [
          { lean: -28, col: '#5a8040', lc: 'rgba(80,140,55,.75)' },
          { lean: 0, col: '#4a7030', lc: 'rgba(70,130,45,.8)' },
          { lean: 20, col: '#608848', lc: 'rgba(90,150,60,.7)' },
          { lean: -14, col: '#528238', lc: 'rgba(75,135,50,.7)' },
          { lean: 10, col: '#4e7c34', lc: 'rgba(72,130,48,.72)' },
        ];
        stems.forEach(s => {
          drawHerbStem(ctx, hcx + s.lean, hcy, stemH, s.lean * .6, sw, s.col, s.lc);
        });

        /* chamomile flowers at tips */
        drawFlower(ctx, hcx - 20, hcy - stemH, '#f0e055', '#f0e055', 'rgba(248,245,180,.9)',);
        drawFlower(ctx, hcx + 4, hcy - stemH * 1.04, 10, '#e8c030', 'rgba(248,245,180,.85)');
        drawFlower(ctx, hcx + 24, hcy - stemH * .96, 9, '#f0e055', 'rgba(255,245,200,.8)');

        /* hibiscus petal (pink/red) at one tip */
        for (let pe = 0; pe < 6; pe++) {
          const pa = (pe / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(hcx - 14 + Math.cos(pa) * 10, hcy - stemH * .88 + Math.sin(pa) * 10, 8, 5, pa, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,50,80,.75)`; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(hcx - 14, hcy - stemH * .88, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,200,50,.8)'; ctx.fill();

        /* gold dust particles around herbs */
        for (let gi = 0; gi < 14; gi++) {
          const gx = hcx + (Math.cos(t * Math.PI * 2 + gi * 0.45) * Math.sin(t + gi)) * 40;
          const gy = hcy - stemH * .5 - Math.abs(Math.sin(t * 2 + gi)) * (stemH * .5);
          const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, 5);
          gg.addColorStop(0, 'rgba(200,160,82,.55)'); gg.addColorStop(1, 'rgba(200,160,82,0)');
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(gx, gy, 5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200,160,82,.8)'; ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    /* ── BOTTOM VIGNETTE ── */
    const vg = ctx.createLinearGradient(0, H * .82, 0, H);
    vg.addColorStop(0, 'rgba(8,14,6,0)'); vg.addColorStop(1, 'rgba(8,14,6,1)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════
   INTRO CANVAS — swaying herbs close-up
══════════════════════════════════════════ */
(function initIntro() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;
  const STEMS = [
    { x: .18, h: .68, leaves: [.25, .45, .65, .8], col: '#5a8040', lc: 'rgba(107,160,90,.75)' },
    { x: .38, h: .75, leaves: [.2, .4, .6, .78], col: '#4a7030', lc: 'rgba(90,140,80,.7)' },
    { x: .58, h: .7, leaves: [.3, .5, .68], col: '#608848', lc: 'rgba(120,170,100,.65)' },
    { x: .78, h: .65, leaves: [.28, .52, .72], col: '#4e7c34', lc: 'rgba(80,130,65,.7)' },
    { x: .28, h: .6, leaves: [.35, .58], col: '#528238', lc: 'rgba(95,145,70,.65)' },
  ];
  function draw() {
    t += .009; sync(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a3d22'); bg.addColorStop(1, '#1a2814');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(107,140,107,.05)'; ctx.lineWidth = .5;
    for (let y = 0; y < H; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    STEMS.forEach(s => {
      const cx = s.x * W, baseY = H * .98, tipY = H * (1 - s.h);
      const sw = Math.sin(t * .6 + s.x * 8) * .012;
      ctx.strokeStyle = s.col; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(cx, baseY);
      ctx.bezierCurveTo(cx + sw * W * .08, baseY - (baseY - tipY) * .35, cx - sw * W * .06, baseY - (baseY - tipY) * .72, cx + sw * W * .04, tipY);
      ctx.stroke();
      s.leaves.forEach((ly, i) => {
        const lx = cx + sw * W * .05, lcy = baseY - (baseY - tipY) * ly;
        const sd = i % 2 === 0 ? 1 : -1;
        ctx.save(); ctx.translate(lx, lcy); ctx.rotate(sd * .6 + sw * .06);
        const lg = ctx.createLinearGradient(0, 0, sd * 28, -12);
        lg.addColorStop(0, s.lc); lg.addColorStop(1, 'rgba(50,90,30,0)');
        ctx.fillStyle = lg; ctx.beginPath();
        ctx.moveTo(0, 0); ctx.bezierCurveTo(sd * 18, -10, sd * 26, -7, sd * 28, -16);
        ctx.bezierCurveTo(sd * 18, -11, sd * 8, -5, 0, 0); ctx.fill(); ctx.restore();
      });
    });
    /* gold particles */
    for (let i = 0; i < 16; i++) {
      const px = W * .5 + Math.cos(t * .35 + i * .7) * W * .38;
      const py = H * .4 + Math.sin(t * .4 + i * .55) * H * .3;
      const gg = ctx.createRadialGradient(px, py, 0, px, py, 5);
      gg.addColorStop(0, 'rgba(200,160,82,.48)'); gg.addColorStop(1, 'rgba(200,160,82,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,160,82,.85)'; ctx.fill();
    }
    const fade = ctx.createLinearGradient(0, H * .78, 0, H);
    fade.addColorStop(0, 'rgba(26,40,20,0)'); fade.addColorStop(1, 'rgba(26,40,20,.85)');
    ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════
   HERB CARD CANVASES — 15 individual herb scenes
   Each only runs while visible
══════════════════════════════════════════ */
const HERB_DEFS = [
  /* 0  Chamomile   */ { sky: '#1e3a14', ground: '#3e2810', accent: '#f5f0a0', type: 'flower', flcol: 'rgba(245,240,160,.85)', cen: '#e8c030' },
  /* 1  Peppermint  */ { sky: '#1a3412', ground: '#3a2608', accent: '#70c860', type: 'mint', col: '#4a9038', lc: 'rgba(80,160,60,.75)' },
  /* 2  Spearmint   */ { sky: '#1c3814', ground: '#3c2a0a', accent: '#80d870', type: 'mint', col: '#58a840', lc: 'rgba(90,175,65,.7)' },
  /* 3  Hibiscus    */ { sky: '#2a1414', ground: '#3c2008', accent: '#e04060', type: 'hibiscus', col: 'rgba(210,40,70,.8)', cen: '#f0c030' },
  /* 4  Rosemary    */ { sky: '#1a2a18', ground: '#382810', accent: '#8090c0', type: 'needle', col: '#506098', lc: 'rgba(80,100,160,.65)' },
  /* 5  Lemongrass  */ { sky: '#203818', ground: '#3e2c0a', accent: '#c0d840', type: 'grass', col: '#789028', lc: 'rgba(140,170,40,.7)' },
  /* 6  Basil       */ { sky: '#1c3a10', ground: '#3a2808', accent: '#50c840', type: 'basil', col: '#388030', lc: 'rgba(60,140,48,.8)' },
  /* 7  Sage        */ { sky: '#1e3218', ground: '#3c280c', accent: '#90a870', type: 'sage', col: '#6a8850', lc: 'rgba(105,145,80,.72)' },
  /* 8  Marjoram    */ { sky: '#1e381a', ground: '#3e2a0c', accent: '#b0d080', type: 'herb', col: '#5a8042', lc: 'rgba(95,140,68,.7)' },
  /* 9  Calendula   */ { sky: '#1e3010', ground: '#3e2c08', accent: '#f0a030', type: 'flower', flcol: 'rgba(240,160,40,.9)', cen: '#e87020' },
  /* 10 Licorice    */ { sky: '#201e10', ground: '#402e10', accent: '#c8a050', type: 'root', col: '#8a6030', lc: 'rgba(160,110,50,.65)' },
  /* 11 Parsley     */ { sky: '#183418', ground: '#382a0a', accent: '#58d058', type: 'herb', col: '#389030', lc: 'rgba(60,155,50,.78)' },
  /* 12 Laurus      */ { sky: '#1a3218', ground: '#38280a', accent: '#70a850', type: 'basil', col: '#4a7838', lc: 'rgba(75,130,60,.75)' },
  /* 13 Echinacea   */ { sky: '#1c1e18', ground: '#3a2c0a', accent: '#d070a0', type: 'flower', flcol: 'rgba(200,80,140,.8)', cen: '#c87020' },
  /* 14 Molokhia    */ { sky: '#183818', ground: '#362808', accent: '#60d060', type: 'herb', col: '#388040', lc: 'rgba(65,145,65,.75)' },
];

HERB_DEFS.forEach((def, idx) => {
  const canvas = document.getElementById('hc' + idx);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = idx * .7, active = false, rafId = null;

  function frame() {
    if (!active) { rafId = null; return; }
    t += .008; sync(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    if (W < 2 || H < 2) { rafId = requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, W, H);

    /* sky */
    const sk = ctx.createLinearGradient(0, 0, 0, H * .55);
    sk.addColorStop(0, def.sky); sk.addColorStop(1, def.sky + 'cc');
    ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H * .55);

    /* subtle sun */
    const sx = W * (.2 + Math.sin(t * .1) * .05), sy = H * .14;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
    sg.addColorStop(0, 'rgba(255,220,80,.5)'); sg.addColorStop(1, 'rgba(255,140,20,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, 14, 0, Math.PI * 2); ctx.fill();

    /* ground */
    const gg = ctx.createLinearGradient(0, H * .5, 0, H);
    gg.addColorStop(0, def.ground); gg.addColorStop(1, '#1a0c04');
    ctx.fillStyle = gg; ctx.fillRect(0, H * .5, W, H * .5);
    ctx.strokeStyle = 'rgba(80,48,18,.3)'; ctx.lineWidth = .6;
    for (let i = 0; i < 3; i++) { const y = H * .53 + i * H * .1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const gY = H * .52, sw = Math.sin(t * .55) * .012;

    const drawStem = (cx, h, lean) => {
      ctx.strokeStyle = def.col || '#5a8040'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(cx, gY);
      ctx.bezierCurveTo(cx + sw * W * .06 + lean * .3, gY - h * .38, cx - sw * W * .04 + lean * .6, gY - h * .72, cx + lean, gY - h);
      ctx.stroke();
    };
    const drawLeaves = (cx, h, lean) => {
      [[.3, -1, 20, 9], [.55, 1, 17, 8], [.78, -1, 15, 7]].forEach(([lf, sd, lw, lh]) => {
        const lx = cx + lean * lf, ly = gY - h * lf;
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(sd * .62 + sw * .04);
        const lg = ctx.createLinearGradient(0, 0, sd * lw, -lh * .5);
        lg.addColorStop(0, def.lc || 'rgba(80,140,55,.75)'); lg.addColorStop(1, 'rgba(30,60,20,0)');
        ctx.fillStyle = lg; ctx.beginPath();
        ctx.moveTo(0, 0); ctx.bezierCurveTo(sd * lw * .38, -lh * .55, sd * lw * .8, -lh * .28, sd * lw, 0);
        ctx.bezierCurveTo(sd * lw * .6, lh * .18, sd * lw * .18, lh * .06, 0, 0); ctx.fill(); ctx.restore();
      });
    };

    /* plant types */
    const positions = [-.32, -.12, .08, .28];
    positions.forEach((lean, pi) => {
      const cx = W * (.28 + pi * .14), h = H * (.32 + Math.sin(t * .4 + pi * .8) * .03);
      if (def.type === 'flower') {
        drawStem(cx, h, lean * W * .08); drawLeaves(cx, h, lean * W * .08);
        const tx = cx + lean * W * .08, ty = gY - h;
        const fr = Math.max(0, Math.sin(t * .6 + pi));
        for (let pe = 0; pe < 8; pe++) {
          const pa = (pe / 8) * Math.PI * 2;
          ctx.beginPath(); ctx.ellipse(tx + Math.cos(pa) * 9, ty + Math.sin(pa) * 9, 7, 4, pa, 0, Math.PI * 2);
          ctx.fillStyle = def.flcol; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fillStyle = def.cen; ctx.fill();
      } else if (def.type === 'hibiscus') {
        drawStem(cx, h, lean * W * .07);
        const tx = cx + lean * W * .07, ty = gY - h;
        for (let pe = 0; pe < 5; pe++) {
          const pa = (pe / 5) * Math.PI * 2;
          ctx.beginPath(); ctx.ellipse(tx + Math.cos(pa) * 11, ty + Math.sin(pa) * 11, 9, 5.5, pa, 0, Math.PI * 2);
          ctx.fillStyle = def.col; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fillStyle = def.cen; ctx.fill();
      } else if (def.type === 'mint' || def.type === 'basil' || def.type === 'herb' || def.type === 'sage') {
        drawStem(cx, h, lean * W * .07); drawLeaves(cx, h, lean * W * .07);
        /* extra broad leaves for basil */
        if (def.type === 'basil') {
          const lx = cx + lean * W * .05, ly = gY - h * .5;
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(.3);
          ctx.fillStyle = 'rgba(50,130,40,.6)';
          ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
      } else if (def.type === 'grass') {
        ctx.strokeStyle = def.col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, gY);
        ctx.bezierCurveTo(cx + lean * W * .04, gY - h * .5, cx + lean * W * .06 + sw * W * .04, gY - h, cx + lean * W * .08 + sw * W * .04, gY - h);
        ctx.stroke();
      } else if (def.type === 'needle') {
        drawStem(cx, h, lean * W * .06);
        /* needle leaves */
        for (let ni = 0; ni < 6; ni++) {
          const ny = gY - h * (.15 + ni * .14);
          for (let ns of [-1, 1]) {
            ctx.strokeStyle = 'rgba(80,100,155,.7)'; ctx.lineWidth = .8;
            ctx.beginPath(); ctx.moveTo(cx, ny); ctx.lineTo(cx + ns * 12, -ny * .0 + ny - 2); ctx.stroke();
          }
        }
      } else if (def.type === 'root') {
        ctx.strokeStyle = def.col; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(cx, gY); ctx.lineTo(cx + lean * W * .05, gY + H * .12); ctx.stroke();
        for (let ri = 0; ri < 4; ri++) {
          const ra = (ri / 3) * 1.2 - .6 + Math.PI * .5;
          ctx.strokeStyle = 'rgba(140,90,40,.5)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx, gY + H * .08);
          ctx.lineTo(cx + Math.cos(ra) * H * .12, gY + H * .08 + Math.sin(ra) * H * .1);
          ctx.stroke();
        }
        /* above ground part */
        drawStem(cx, h * .6, lean * W * .05); drawLeaves(cx, h * .6, lean * W * .05);
      }
    });

    /* aroma wisps */
    for (let wi = 0; wi < 6; wi++) {
      const wx = W * (.2 + wi * .12) + Math.sin(t + wi) * 20;
      const wy = H * (.2 - wi * .03) + Math.cos(t * .7 + wi) * 15;
      ctx.save(); ctx.globalAlpha = .12 + Math.sin(t + wi) * .06;
      ctx.strokeStyle = def.accent; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(wx, wy);
      ctx.bezierCurveTo(wx + 8, wy - 12, wx - 6, wy - 22, wx + 4, wy - 32);
      ctx.stroke(); ctx.restore();
    }

    /* bottom fade */
    const bf = ctx.createLinearGradient(0, H * .62, 0, H);
    bf.addColorStop(0, 'rgba(0,0,0,0)'); bf.addColorStop(1, 'rgba(0,0,0,.9)');
    ctx.fillStyle = bf; ctx.fillRect(0, 0, W, H);

    rafId = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      active = e.isIntersecting;
      if (active && !rafId) frame();
      if (!active && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    });
  }, { threshold: .05 });
  io.observe(canvas);
});

/* ══════════════════════════════════════════
   QUALITIES CANVAS — floating herb molecules
══════════════════════════════════════════ */
(function initQualities() {
  const canvas = document.getElementById('qualities-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  const NODES = Array.from({ length: 24 }, (_, i) => ({
    phase: (i / 24) * Math.PI * 2,
    r: .18 + Math.random() * .28,
    speed: (Math.random() - .5) * .009,
    ph2: Math.random() * Math.PI * 2,
    col: ['#c8a052', '#6b8c6b', '#8a9a5b', '#a0b870', '#d4b870'][i % 5],
    size: 3 + Math.random() * 5,
    label: ['C', 'H', 'O', 'N', 'Ca', 'Mg', 'K', 'Fe', 'Zn'][i % 9]
  }));

  function draw() {
    t += .007; sync(canvas);
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#22381a'); bg.addColorStop(1, '#121e0e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const cx = W * .5, cy = H * .5;

    /* rings */
    [.2, .34, .48].forEach((r, ri) => {
      ctx.beginPath(); ctx.arc(cx, cy, r * Math.min(W, H), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(107,140,107,${.1 - .02 * ri})`; ctx.lineWidth = .6; ctx.stroke();
    });

    /* node positions */
    const npos = NODES.map(n => ({
      x: cx + Math.cos(n.phase + t * n.speed) * n.r * Math.min(W, H) * (1 + Math.sin(n.ph2 + t * .5) * .1),
      y: cy + Math.sin(n.phase * 1.3 + t * n.speed * 1.1) * n.r * Math.min(W, H) * .7,
      n
    }));

    /* connection lines */
    npos.forEach((a, i) => {
      npos.forEach((b, j) => {
        if (j <= i) return;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < Math.min(W, H) * .22) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(200,160,82,${(1 - d / (Math.min(W, H) * .22)) * .15})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      });
    });

    /* nodes */
    npos.forEach(({ x, y, n }) => {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, n.size * 2.5);
      grd.addColorStop(0, n.col + '55'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, n.size * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, n.size, 0, Math.PI * 2);
      ctx.fillStyle = n.col; ctx.fill();
    });

    /* central herb illustration */
    const hs = Math.min(W, H) * .24;
    ctx.strokeStyle = '#6a9050'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(cx, cy + hs);
    ctx.bezierCurveTo(cx + Math.sin(t) * hs * .1, cy, cx - Math.sin(t) * .08 * hs, cy - hs * .6, cx, cy - hs);
    ctx.stroke();
    [[.35, -1, hs * .28, hs * .12], [.6, 1, hs * .24, hs * .1], [.8, -1, hs * .2, hs * .09]].forEach(([lf, sd, lw, lh]) => {
      const lx = cx, ly = cy + hs - hs * 2 * lf;
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(sd * .65 + Math.sin(t) * .04);
      const lg = ctx.createLinearGradient(0, 0, sd * lw, -lh * .5);
      lg.addColorStop(0, 'rgba(80,150,55,.7)'); lg.addColorStop(1, 'rgba(40,80,25,0)');
      ctx.fillStyle = lg; ctx.beginPath();
      ctx.moveTo(0, 0); ctx.bezierCurveTo(sd * lw * .4, -lh * .55, sd * lw * .8, -lh * .28, sd * lw, 0);
      ctx.bezierCurveTo(sd * lw * .6, lh * .18, sd * lw * .2, lh * .06, 0, 0); ctx.fill(); ctx.restore();
    });
    /* flower */
    for (let pe = 0; pe < 8; pe++) {
      const pa = (pe / 8) * Math.PI * 2;
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(pa) * hs * .2, cy - hs + Math.sin(pa) * hs * .2, hs * .14, hs * .09, pa, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,240,160,.8)'; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy - hs, hs * .1, 0, Math.PI * 2); ctx.fillStyle = '#e8c030'; ctx.fill();

    requestAnimationFrame(draw);
  }
  draw();
})();