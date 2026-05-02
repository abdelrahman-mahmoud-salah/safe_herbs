import { buildProductsGridHtml } from './productsData.js';

const ROUTE_TO_SECTION = {
  '/': 'hero',
  '/about': 'about',
  '/products': 'products',
  '/farms': 'farms',
  '/certificates': 'certs',
  '/contact': 'contact'
};

const SECTION_TO_ROUTE = Object.fromEntries(
  Object.entries(ROUTE_TO_SECTION).map(([path, id]) => [id, path])
);

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 900px)').matches;
}

function allowHeavyEffects() {
  return !prefersReducedMotion() && !isMobileLayout();
}

function scrollToSection(id, { replace = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  const path = SECTION_TO_ROUTE[id] || '/';
  if (replace) history.replaceState({ section: id }, '', path);
  else history.pushState({ section: id }, '', path);
}

function normalizePathname() {
  let p = window.location.pathname || '/';
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  if (!ROUTE_TO_SECTION[p]) p = '/';
  return p;
}

function getSectionFromPath() {
  return ROUTE_TO_SECTION[normalizePathname()];
}

/* ── Global error surface ── */
function showErrorBanner(message) {
  let bar = document.getElementById('app-error-banner');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'app-error-banner';
    bar.className = 'app-error-banner';
    bar.setAttribute('role', 'alert');
    bar.innerHTML =
      '<p class="app-error-banner__text"></p><button type="button" class="app-error-banner__close" aria-label="Dismiss">×</button>';
    document.body.appendChild(bar);
    bar.querySelector('.app-error-banner__close').addEventListener('click', () => bar.remove());
  }
  bar.querySelector('.app-error-banner__text').textContent = message;
}

window.addEventListener('error', (e) => {
  showErrorBanner(e.message || 'Something went wrong. Please refresh if the page misbehaves.');
});

window.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason && e.reason.message ? e.reason.message : 'An unexpected error occurred.';
  showErrorBanner(msg);
});

/* ── Image fallbacks ── */
document.addEventListener(
  'error',
  (e) => {
    const t = e.target;
    if (!(t instanceof HTMLImageElement)) return;
    t.classList.add('img-fallback');
    if (t.dataset.fallbackSrc && !t.dataset.fallbackTried) {
      t.dataset.fallbackTried = '1';
      t.src = t.dataset.fallbackSrc;
    }
  },
  true
);

/* ── Cursor (pointer devices only) ── */
function initCursor() {
  if (!allowHeavyEffects()) return;
  const $cur = document.getElementById('cur');
  const $ring = document.getElementById('cur-ring');
  if (!$cur || !$ring) return;
  document.body.classList.add('effects-pointer');
  let mx = 0;
  let my = 0;
  let rx = 0;
  let ry = 0;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
  function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    $cur.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    $ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  }
  loop();
  document.querySelectorAll('a, button, .product-card').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      $cur.style.width = $cur.style.height = '16px';
      $ring.style.width = $ring.style.height = '56px';
    });
    el.addEventListener('mouseleave', () => {
      $cur.style.width = $cur.style.height = '8px';
      $ring.style.width = $ring.style.height = '36px';
    });
  });
}


/* ── Mobile menu ── */
let menuOpen = false;
window.toggleMenu = function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('mobileMenu').classList.toggle('open', menuOpen);
  const [s0, s1, s2] = document.querySelectorAll('.hamburger span');
  s0.style.transform = menuOpen ? 'rotate(45deg) translate(4px,4px)' : '';
  s1.style.opacity = menuOpen ? '0' : '1';
  s2.style.transform = menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : '';
};

window.closeMobile = function closeMobile() {
  if (!menuOpen) return;
  menuOpen = false;
  document.getElementById('mobileMenu').classList.remove('open');
  document.querySelectorAll('.hamburger span').forEach((s) => {
    s.style.transform = '';
    s.style.opacity = '1';
  });
};

/* ── SPA router (History API) ── */
function initRouter() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    if (a.dataset.spaIgnore === 'true') return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;

    let path = href;
    if (href.startsWith('/')) {
      path = href.split('#')[0] || '/';
      if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    } else if (href === '#') {
      e.preventDefault();
      scrollToSection('hero');
      closeMobile();
      return;
    } else return;

    const section = ROUTE_TO_SECTION[path] || ROUTE_TO_SECTION['/'];
    if (!section) return;
    e.preventDefault();
    scrollToSection(section);
    closeMobile();
  });

  window.addEventListener('popstate', () => {
    const id = getSectionFromPath();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  });

  const initial = getSectionFromPath();
  if (initial !== 'hero') {
    requestAnimationFrame(() => {
      document.getElementById(initial)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }
}

/* ── Reveal + section lazy canvas ── */
function initReveal() {
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    },
    { rootMargin: '0px 0px 80px 0px', threshold: 0.06 }
  );
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .cert-item').forEach((el) => revealIO.observe(el));

  const sectionLazyIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        entry.target.classList.add('section-lazy--ready');
        sectionLazyIO.unobserve(entry.target);
        if (!allowHeavyEffects()) return;
        if (id === 'about') import('./canvas/about.js').then((m) => m.initAbout());
        if (id === 'farms') import('./canvas/farms.js').then((m) => m.initFarms());
        if (id === 'contact') import('./canvas/contact.js').then((m) => m.initContact());
      });
    },
    { rootMargin: '120px', threshold: 0.05 }
  );

  ['about', 'farms', 'contact'].forEach((sid) => {
    const sec = document.getElementById(sid);
    if (sec) sectionLazyIO.observe(sec);
  });
}

/* ── Products: skeleton → grid + optional canvas ── */
async function initProductsMount() {
  const mount = document.getElementById('products-mount');
  const skel = document.getElementById('products-skeleton');
  if (!mount) return;

  try {
    await new Promise((r) => setTimeout(r, prefersReducedMotion() ? 0 : 280));
    mount.innerHTML = `<div class="products-grid">${buildProductsGridHtml()}</div>`;
    const headerReveals = mount.closest('#products')?.querySelectorAll('.products-header .reveal');
    headerReveals?.forEach((el) => {
      requestAnimationFrame(() => el.classList.add('visible'));
    });
    const cards = mount.querySelectorAll('.product-card.reveal');
    const staggerMs = prefersReducedMotion() ? 0 : 110;
    cards.forEach((el, i) => {
      const go = () => el.classList.add('visible');
      if (staggerMs === 0) requestAnimationFrame(go);
      else setTimeout(go, i * staggerMs);
    });
    if (allowHeavyEffects()) {
      const { initProducts } = await import('./canvas/products.js');
      initProducts();
    }
  } catch (err) {
    mount.innerHTML =
      '<p class="products-fallback">We could not load the product showcase. Please email <a href="mailto:info@safeherbsco.com">info@safeherbsco.com</a> for our full range.</p>';
    showErrorBanner(err.message || 'Product section failed to load.');
  } finally {
    skel?.remove();
  }
}

/* ── Hero canvas (desktop only, after idle) ── */
function scheduleHeroCanvas() {
  if (!allowHeavyEffects()) return;
  const run = () => import('./canvas/hero.js').then((m) => m.initHero());
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => run(), { timeout: 2000 });
  } else {
    setTimeout(run, 400);
  }
}

/* ── Prefetch heavy chunks on idle ── */
function prefetchChunks() {
  if (!allowHeavyEffects()) return;
  const base = new URL('./', import.meta.url);
  const names = ['./canvas/products.js', './canvas/about.js', './canvas/farms.js', './canvas/contact.js'];
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1600));
  idle(() => {
    names.forEach((name) => {
      const href = new URL(name, base).href;
      const l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = href;
      l.as = 'script';
      document.head.appendChild(l);
    });
  });
}
/* ── TYPEWRITER ── */
(function initTypewriter() {
  document.querySelectorAll('.typewriter').forEach(el => {
    const text  = el.dataset.text  || el.textContent;
    const speed = parseInt(el.dataset.speed  || 60);
    const delay = parseInt(el.dataset.delay  || 0);

    el.textContent = '';

    const cur = document.createElement('span');
    cur.className = 'typewriter-cursor';
    el.appendChild(cur);

    let i = 0;

    setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          el.insertBefore(document.createTextNode(text[i]), cur);
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);
    }, delay);
  });
})();
/* ── Boot ── */
function boot() {
  document.documentElement.classList.toggle('no-effects', !allowHeavyEffects());
  initCursor();
  initRouter();
  initReveal();
  scheduleHeroCanvas();
  prefetchChunks();

  const productsSection = document.getElementById('products');
  if (!productsSection) {
    initProductsMount();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      initProductsMount();
    },
    { rootMargin: '200px', threshold: 0.01 }
  );
  io.observe(productsSection);
}

boot();
