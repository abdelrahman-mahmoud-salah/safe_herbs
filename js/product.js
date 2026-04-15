/* ── CURSOR ── */
const $cur = document.getElementById('cur'), $ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function cl() { rx += (mx - rx) * .12; ry += (my - ry) * .12; $cur.style.left = mx + 'px'; $cur.style.top = my + 'px'; $ring.style.left = rx + 'px'; $ring.style.top = ry + 'px'; requestAnimationFrame(cl); })();
document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => { $cur.style.width = $cur.style.height = '16px'; $ring.style.width = $ring.style.height = '56px'; });
    el.addEventListener('mouseleave', () => { $cur.style.width = $cur.style.height = '8px'; $ring.style.width = $ring.style.height = '36px'; });
});

/* ── NAV ── */
window.addEventListener('scroll', () => document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60), { passive: true });

/* ── HAMBURGER ── */
let menuOpen = false;
function toggleMenu() { menuOpen = !menuOpen; document.getElementById('mobileMenu').classList.toggle('open', menuOpen); const [s0, s1, s2] = document.querySelectorAll('.hamburger span'); s0.style.transform = menuOpen ? 'rotate(45deg) translate(4px,4px)' : ''; s1.style.opacity = menuOpen ? '0' : '1'; s2.style.transform = menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : ''; }
function closeMobile() { menuOpen = false; document.getElementById('mobileMenu').classList.remove('open'); document.querySelectorAll('.hamburger span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; }); }

/* ── SCROLL TO SECTION ── */
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;

    const offset = 80;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
        top,
        behavior: "smooth"
    });
}

/* ── ACTIVE TAB on scroll ── */
const sections = ['herbs', 'seeds', 'oniongarlic'];

window.addEventListener('scroll', () => {
    let current = 'herbs';

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        if (rect.top <= 180) {
            current = id;
        }
    });

    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.section === current);
    });

}, { passive: true });

/* ── CANVAS SYNC ── */
function sync(c) {
    const dpr = window.devicePixelRatio || 1, r = c.getBoundingClientRect();
    const cw = Math.round(r.width * dpr), ch = Math.round(r.height * dpr);
    if (c.width === cw && c.height === ch) return;
    c.width = cw; c.height = ch; c.getContext('2d').scale(dpr, dpr);
}

/* ════════════════════════════════════
   HERO CANVAS — aerial farm view
════════════════════════════════════ */
(function () {
    const c = document.getElementById('hero-canvas');
    const ctx = c.getContext('2d'); let t = 0;
    const ROWS = 26;
    const COLS = ['#2a4a20', '#305428', '#244018', '#3a5c2a', '#1e3614'];
    function draw() {
        t += .004; sync(c);
        const W = c.offsetWidth, H = c.offsetHeight;
        ctx.clearRect(0, 0, W, H);
        const sky = ctx.createLinearGradient(0, 0, 0, H * .5);
        sky.addColorStop(0, '#0e1c0a'); sky.addColorStop(1, '#1e3614');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < ROWS; i++) {
            const y = H * .35 + (i / ROWS) * H * .65;
            const wid = W * (.1 + (i / ROWS) * .9);
            const x0 = (W - wid) / 2;
            const h = (H * .65 / ROWS) * .72;
            const wave = Math.sin(t + i * .3) * (i / ROWS) * 6;
            ctx.fillStyle = COLS[i % COLS.length];
            ctx.globalAlpha = .5 + (i / ROWS) * .38;
            ctx.beginPath(); ctx.moveTo(x0, y + wave); ctx.lineTo(x0 + wid, y + wave); ctx.lineTo(x0 + wid - (wid * .02), y + h + wave); ctx.lineTo(x0 + (wid * .02), y + h + wave); ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Nile
        ctx.strokeStyle = 'rgba(60,130,180,.35)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(W * .47, H * .35); ctx.bezierCurveTo(W * .49, H * .55, W * .48, H * .72, W * .5, H); ctx.stroke();
        // particles
        for (let i = 0; i < 18; i++) { const px = W * (.1 + ((i / 18 + t * .012) % .9)); const py = H * (.14 + Math.sin(t * .4 + i * .8) * .07); ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,160,82,.5)'; ctx.fill(); }
        const vg = ctx.createRadialGradient(W * .5, H * .5, H * .2, W * .5, H * .5, H * .85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        requestAnimationFrame(draw);
    }
    draw();
})();

/* ════════════════════════════════════
   HERB CARD CANVASES
   Each card: unique plant illustration, only runs when visible
════════════════════════════════════ */
const HERB_PALETTES = [
    { sky: '#1e3a14', ac: '#f5f0a0', type: 'flower', fc: 'rgba(245,240,160,.85)', cc: '#e8c030' },  // chamomile
    { sky: '#1a3412', ac: '#70c860', type: 'mint', col: '#4a9038', lc: 'rgba(80,160,60,.75)' },  // peppermint
    { sky: '#1c3814', ac: '#80d870', type: 'mint', col: '#58a840', lc: 'rgba(90,175,65,.7)' },   // spearmint
    { sky: '#2a1414', ac: '#e04060', type: 'hibiscus', col: 'rgba(210,40,70,.8)', cc: '#f0c030' },  // hibiscus
    { sky: '#1a2a18', ac: '#8090c0', type: 'needle', col: '#506098', lc: 'rgba(80,100,160,.65)' }, // rosemary
    { sky: '#1c3a10', ac: '#50c840', type: 'basil', col: '#388030', lc: 'rgba(60,140,48,.8)' },   // basil
    { sky: '#1e3218', ac: '#90a870', type: 'sage', col: '#6a8850', lc: 'rgba(105,145,80,.72)' }, // sage
    { sky: '#1e381a', ac: '#b0d080', type: 'herb', col: '#5a8042', lc: 'rgba(95,140,68,.7)' },   // marjoram
    { sky: '#1e3010', ac: '#f0a030', type: 'flower', fc: 'rgba(240,160,40,.9)', cc: '#e87020' },   // calendula
    { sky: '#203818', ac: '#c0d840', type: 'grass', col: '#789028', lc: 'rgba(140,170,40,.7)' }, // lemongrass
    { sky: '#201e10', ac: '#c8a050', type: 'root', col: '#8a6030', lc: 'rgba(160,110,50,.65)' },// licorice
    { sky: '#183418', ac: '#58d058', type: 'herb', col: '#389030', lc: 'rgba(60,155,50,.78)' }, // parsley
    { sky: '#1a3218', ac: '#70a850', type: 'basil', col: '#4a7838', lc: 'rgba(75,130,60,.75)' }, // laurus
    { sky: '#1c1e18', ac: '#d070a0', type: 'flower', fc: 'rgba(200,80,140,.8)', cc: '#c87020' },   // echinacea
    { sky: '#183818', ac: '#60d060', type: 'herb', col: '#388040', lc: 'rgba(65,145,65,.75)' }, // molokhia
];

HERB_PALETTES.forEach((pal, idx) => {
    const canvas = document.getElementById('h' + idx);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = idx * .6, active = false, rafId = null;

    function frame() {
        if (!active) { rafId = null; return; }
        t += .009; sync(canvas);
        const W = canvas.offsetWidth, H = canvas.offsetHeight;
        if (W < 2 || H < 2) { rafId = requestAnimationFrame(frame); return; }
        ctx.clearRect(0, 0, W, H);
        // sky
        const sk = ctx.createLinearGradient(0, 0, 0, H * .55); sk.addColorStop(0, pal.sky); sk.addColorStop(1, pal.sky + 'cc'); ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H * .55);
        // sun
        const sx = W * .2, sy = H * .13; const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14); sg.addColorStop(0, 'rgba(255,220,80,.5)'); sg.addColorStop(1, 'rgba(255,140,20,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, 14, 0, Math.PI * 2); ctx.fill();
        // ground
        const grd = ctx.createLinearGradient(0, H * .5, 0, H); grd.addColorStop(0, '#3e2810'); grd.addColorStop(1, '#1a0c04'); ctx.fillStyle = grd; ctx.fillRect(0, H * .5, W, H * .5);
        const gY = H * .52, sw = Math.sin(t * .55) * .012;
        const positions = [-.32, -.12, .08, .28];
        positions.forEach((lean, pi) => {
            const cx = W * (.28 + pi * .14), h = H * (.32 + Math.sin(t * .4 + pi * .8) * .03);
            const dL = lean * W * .07;
            // stem
            ctx.strokeStyle = pal.col || '#5a8040'; ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(cx, gY); ctx.bezierCurveTo(cx + sw * W * .06 + dL * .3, gY - h * .38, cx - sw * W * .04 + dL * .6, gY - h * .72, cx + dL, gY - h); ctx.stroke();
            const tx = cx + dL, ty = gY - h;
            if (pal.type === 'flower' || pal.type === 'hibiscus' || pal.type === 'echinacea') {
                if (pal.type === 'hibiscus') {
                    for (let pe = 0; pe < 5; pe++) { const pa = (pe / 5) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(tx + Math.cos(pa) * 11, ty + Math.sin(pa) * 11, 9, 5.5, pa, 0, Math.PI * 2); ctx.fillStyle = pal.col; ctx.fill(); }
                } else {
                    for (let pe = 0; pe < 8; pe++) { const pa = (pe / 8) * Math.PI * 2; ctx.beginPath(); ctx.ellipse(tx + Math.cos(pa) * 9, ty + Math.sin(pa) * 9, 7, 4, pa, 0, Math.PI * 2); ctx.fillStyle = pal.fc; ctx.fill(); }
                }
                ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fillStyle = pal.cc; ctx.fill();
            } else if (pal.type === 'needle') {
                for (let ni = 0; ni < 6; ni++) { const ny = gY - h * (.15 + ni * .14); for (let ns of [-1, 1]) { ctx.strokeStyle = 'rgba(80,100,155,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(cx, ny); ctx.lineTo(cx + ns * 12, ny - 2); ctx.stroke(); } }
            } else if (pal.type === 'grass') {
                ctx.strokeStyle = pal.col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, gY); ctx.bezierCurveTo(cx + dL * .4, gY - h * .5, cx + dL * .6 + sw * W * .04, gY - h, cx + dL * .8 + sw * W * .04, gY - h); ctx.stroke();
            } else if (pal.type === 'root') {
                for (let ri = 0; ri < 4; ri++) { const ra = (ri / 3) * 1.2 - .6 + Math.PI * .5; ctx.strokeStyle = 'rgba(140,90,40,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, gY + H * .08); ctx.lineTo(cx + Math.cos(ra) * H * .12, gY + H * .08 + Math.sin(ra) * H * .1); ctx.stroke(); }
                // above ground
                [[.3, -1, 20, 9], [.55, 1, 17, 8]].forEach(([lf, sd, lw, lh]) => { const lx = cx + dL * lf, ly = gY - h * .6 * lf; ctx.save(); ctx.translate(lx, ly); ctx.rotate(sd * .62 + sw * .04); const lg = ctx.createLinearGradient(0, 0, sd * lw, -lh * .5); lg.addColorStop(0, pal.lc); lg.addColorStop(1, 'rgba(30,60,20,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(sd * lw * .38, -lh * .55, sd * lw * .8, -lh * .28, sd * lw, 0); ctx.bezierCurveTo(sd * lw * .6, lh * .18, sd * lw * .18, lh * .06, 0, 0); ctx.fill(); ctx.restore(); });
            } else {
                [[.3, -1, 20, 9], [.55, 1, 17, 8], [.78, -1, 15, 7]].forEach(([lf, sd, lw, lh]) => {
                    const lx = cx + dL * lf, ly = gY - h * lf;
                    ctx.save(); ctx.translate(lx, ly); ctx.rotate(sd * .62 + sw * .04);
                    const lg = ctx.createLinearGradient(0, 0, sd * lw, -lh * .5); lg.addColorStop(0, pal.lc || 'rgba(80,140,55,.75)'); lg.addColorStop(1, 'rgba(30,60,20,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(sd * lw * .38, -lh * .55, sd * lw * .8, -lh * .28, sd * lw, 0); ctx.bezierCurveTo(sd * lw * .6, lh * .18, sd * lw * .18, lh * .06, 0, 0); ctx.fill(); ctx.restore();
                });
                if (pal.type === 'basil') { const lx = cx + dL * .5, ly = gY - h * .5; ctx.save(); ctx.translate(lx, ly); ctx.rotate(.3); ctx.fillStyle = 'rgba(50,130,40,.6)'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
            }
        });
        // aroma wisps
        for (let wi = 0; wi < 5; wi++) { const wx = W * (.2 + wi * .14) + Math.sin(t + wi) * 18; const wy = H * (.18 - wi * .02) + Math.cos(t * .7 + wi) * 12; ctx.globalAlpha = .1 + Math.sin(t + wi) * .05; ctx.strokeStyle = pal.ac; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.bezierCurveTo(wx + 7, wy - 10, wx - 5, wy - 20, wx + 3, wy - 30); ctx.stroke(); ctx.globalAlpha = 1; }
        // bottom fade
        const bf = ctx.createLinearGradient(0, H * .6, 0, H); bf.addColorStop(0, 'rgba(0,0,0,0)'); bf.addColorStop(1, 'rgba(0,0,0,.92)'); ctx.fillStyle = bf; ctx.fillRect(0, 0, W, H);
        rafId = requestAnimationFrame(frame);
    }
    const io = new IntersectionObserver(entries => { entries.forEach(e => { active = e.isIntersecting; if (active && !rafId) frame(); if (!active && rafId) { cancelAnimationFrame(rafId); rafId = null; } }); }, { threshold: .05 });
    io.observe(canvas);
});

/* ════════════════════════════════════
   ONION & GARLIC CANVAS SCENES
════════════════════════════════════ */
(function () {
    // Garlic canvas
    const gc = document.getElementById('ogc0');
    const gctx = gc.getContext('2d');
    let gt = 0, ga = false, gRaf = null;
    function drawGarlic() {
        if (!ga) { gRaf = null; return; }
        gt += .006; sync(gc);
        const W = gc.offsetWidth, H = gc.offsetHeight;
        gctx.clearRect(0, 0, W, H);
        // bg
        const bg = ctx_grad(gctx, W, H, '#1e2a10', '#0e1608'); gctx.fillStyle = bg; gctx.fillRect(0, 0, W, H);
        // ground
        const gnd = gctx.createLinearGradient(0, H * .55, 0, H); gnd.addColorStop(0, '#3c2c10'); gnd.addColorStop(1, '#1e1408'); gctx.fillStyle = gnd; gctx.fillRect(0, H * .55, W, H * .45);
        // garlic bulb illustration
        const cx = W * .5, cy = H * .62;
        // bulb
        gctx.fillStyle = 'rgba(245,238,210,.85)';
        gctx.beginPath(); gctx.ellipse(cx, cy, W * .12, H * .14, 0, 0, Math.PI * 2); gctx.fill();
        // clove lines
        gctx.strokeStyle = 'rgba(210,200,160,.5)'; gctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; gctx.beginPath(); gctx.moveTo(cx, cy); gctx.lineTo(cx + Math.cos(a) * W * .11, cy + Math.sin(a) * H * .12); gctx.stroke(); }
        // stem
        const sw2 = Math.sin(gt * .6) * .015;
        gctx.strokeStyle = '#6a9050'; gctx.lineWidth = 2.5;
        gctx.beginPath(); gctx.moveTo(cx, cy - H * .14); gctx.bezierCurveTo(cx + sw2 * W, cy - H * .3, cx - sw2 * W * .8, cy - H * .55, cx + sw2 * W * .5, cy - H * .65); gctx.stroke();
        // leaves
        [[.35, -1, 30, 12], [.6, 1, 26, 11], [.8, -1, 22, 9]].forEach(([lf, sd, lw, lh]) => {
            const lx = cx + sw2 * W * .3, ly = cy - H * .14 - H * .5 * lf;
            gctx.save(); gctx.translate(lx, ly); gctx.rotate(sd * .7 + sw2 * .05);
            gctx.fillStyle = 'rgba(80,150,55,.7)'; gctx.beginPath(); gctx.moveTo(0, 0); gctx.bezierCurveTo(sd * lw * .4, -lh * .55, sd * lw * .8, -lh * .28, sd * lw, 0); gctx.bezierCurveTo(sd * lw * .6, lh * .18, sd * lw * .2, lh * .06, 0, 0); gctx.fill(); gctx.restore();
        });
        // golden particles
        for (let i = 0; i < 12; i++) { const px = cx + (Math.cos(gt * .3 + i * 0.55) * W * .3); const py = cy - H * .25 - Math.abs(Math.sin(gt * .5 + i)) * H * .25; const gg = gctx.createRadialGradient(px, py, 0, px, py, 5); gg.addColorStop(0, 'rgba(200,160,82,.45)'); gg.addColorStop(1, 'rgba(200,160,82,0)'); gctx.fillStyle = gg; gctx.beginPath(); gctx.arc(px, py, 5, 0, Math.PI * 2); gctx.fill(); }
        // vignette
        const vig = gctx.createRadialGradient(W * .5, H * .5, H * .2, W * .5, H * .5, W * .8); vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.65)'); gctx.fillStyle = vig; gctx.fillRect(0, 0, W, H);
        gRaf = requestAnimationFrame(drawGarlic);
    }
    new IntersectionObserver(e => { e.forEach(ev => { ga = ev.isIntersecting; if (ga && !gRaf) drawGarlic(); if (!ga && gRaf) { cancelAnimationFrame(gRaf); gRaf = null; } }); }, { threshold: .05 }).observe(gc);

    // Onion canvas
    const oc = document.getElementById('ogc1');
    const octx = oc.getContext('2d');
    let ot = 0, oa = false, oRaf = null;
    function drawOnion() {
        if (!oa) { oRaf = null; return; }
        ot += .006; sync(oc);
        const W = oc.offsetWidth, H = oc.offsetHeight;
        octx.clearRect(0, 0, W, H);
        const bg = ctx_grad(octx, W, H, '#22180e', '#110c06'); octx.fillStyle = bg; octx.fillRect(0, 0, W, H);
        const gnd = octx.createLinearGradient(0, H * .55, 0, H); gnd.addColorStop(0, '#3c2210'); gnd.addColorStop(1, '#1e1008'); octx.fillStyle = gnd; octx.fillRect(0, H * .55, W, H * .45);
        const cx = W * .5, cy = H * .64;
        const sw2 = Math.sin(ot * .5) * .012;
        // onion bulb
        octx.fillStyle = 'rgba(160,100,180,.75)';
        octx.beginPath(); octx.ellipse(cx, cy, W * .13, H * .16, 0, 0, Math.PI * 2); octx.fill();
        // skin lines
        octx.strokeStyle = 'rgba(180,120,200,.4)'; octx.lineWidth = 1;
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI - .5; octx.beginPath(); octx.moveTo(cx - W * .13 * Math.cos(a), cy - H * .16 * Math.sin(a)); octx.quadraticCurveTo(cx, cy + H * .04, cx + W * .13 * Math.cos(a), cy - H * .16 * Math.sin(a)); octx.stroke(); }
        // roots at bottom
        octx.strokeStyle = 'rgba(180,140,80,.45)'; octx.lineWidth = .8;
        for (let r = 0; r < 5; r++) { const ra = (r / 4) * 1.4 - .7 + Math.PI * .5; octx.beginPath(); octx.moveTo(cx, cy + H * .15); octx.lineTo(cx + Math.cos(ra) * W * .06, cy + H * .15 + Math.sin(ra) * H * .06); octx.stroke(); }
        // stem + leaves
        octx.strokeStyle = '#6a9050'; octx.lineWidth = 2.5;
        octx.beginPath(); octx.moveTo(cx, cy - H * .16); octx.bezierCurveTo(cx + sw2 * W * .8, cy - H * .32, cx - sw2 * W * .7, cy - H * .54, cx + sw2 * W * .6, cy - H * .62); octx.stroke();
        [[.4, -1, 28, 11], [.65, 1, 24, 10]].forEach(([lf, sd, lw, lh]) => {
            const lx = cx + sw2 * W * .3, ly = cy - H * .16 - H * .48 * lf;
            octx.save(); octx.translate(lx, ly); octx.rotate(sd * .65 + sw2 * .05);
            octx.fillStyle = 'rgba(75,145,50,.65)'; octx.beginPath(); octx.moveTo(0, 0); octx.bezierCurveTo(sd * lw * .4, -lh * .55, sd * lw * .8, -lh * .28, sd * lw, 0); octx.bezierCurveTo(sd * lw * .6, lh * .18, sd * lw * .2, lh * .06, 0, 0); octx.fill(); octx.restore();
        });
        for (let i = 0; i < 10; i++) { const px = cx + (Math.cos(ot * .35 + i * .6) * W * .32); const py = cy - H * .25 - Math.abs(Math.sin(ot * .5 + i)) * H * .22; const gg = octx.createRadialGradient(px, py, 0, px, py, 5); gg.addColorStop(0, 'rgba(200,160,82,.4)'); gg.addColorStop(1, 'rgba(200,160,82,0)'); octx.fillStyle = gg; octx.beginPath(); octx.arc(px, py, 5, 0, Math.PI * 2); octx.fill(); }
        const vig = octx.createRadialGradient(W * .5, H * .5, H * .2, W * .5, H * .5, W * .8); vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.65)'); octx.fillStyle = vig; octx.fillRect(0, 0, W, H);
        oRaf = requestAnimationFrame(drawOnion);
    }
    new IntersectionObserver(e => { e.forEach(ev => { oa = ev.isIntersecting; if (oa && !oRaf) drawOnion(); if (!oa && oRaf) { cancelAnimationFrame(oRaf); oRaf = null; } }); }, { threshold: .05 }).observe(oc);
})();

function ctx_grad(ctx, W, H, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, c1); g.addColorStop(1, c2); return g;
}