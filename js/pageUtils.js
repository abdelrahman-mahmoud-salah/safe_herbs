'use strict';

/**
 * pageUtils.js — Shared utilities for all inner-page scripts.
 * Exposes window.PageUtils and registers window.toggleMenu / window.closeMobile.
 *
 * Load this script BEFORE the page-specific script:
 *   <script src="js/pageUtils.js"></script>
 *   <script src="js/farms.js"></script>
 */
(function () {

  /* ── Canvas sync helper ─────────────────────────────────────────────── */
  /** Resize canvas to its CSS size × DPR. Returns true when resized. */
  function syncCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const r   = canvas.getBoundingClientRect();
    const cw  = Math.round(r.width  * dpr);
    const ch  = Math.round(r.height * dpr);
    if (canvas.width === cw && canvas.height === ch) return false;
    canvas.width  = cw;
    canvas.height = ch;
    canvas.getContext('2d').scale(dpr, dpr);
    return true;
  }

  /* ── Custom cursor ──────────────────────────────────────────────────── */
  /**
   * Starts the cursor follower rAF loop.
   * Silently skips on coarse-pointer (touch) devices — no rAF cost on mobile.
   *
   * @param {string[]} [extraSelectors] - additional CSS selectors to enlarge cursor on hover
   */
  function initCursor(extraSelectors) {
    const $cur  = document.getElementById('cur');
    const $ring = document.getElementById('cur-ring');
    if (!$cur || !$ring) return;
    // No visible cursor on touch / coarse-pointer devices — skip entirely.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      $cur.style.transform  = `translate3d(${mx}px, ${my}px, 0)`;
      $ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();

    const extraStr = extraSelectors && extraSelectors.length
      ? ', ' + extraSelectors.join(', ')
      : '';
    document.querySelectorAll('a, button' + extraStr).forEach(el => {
      el.addEventListener('mouseenter', () => {
        $cur.style.width  = $cur.style.height  = '16px';
        $ring.style.width = $ring.style.height = '56px';
      });
      el.addEventListener('mouseleave', () => {
        $cur.style.width  = $cur.style.height  = '8px';
        $ring.style.width = $ring.style.height = '36px';
      });
    });
  }

  /* ── Nav scroll state ───────────────────────────────────────────────── */
  /** Adds the "scrolled" class to #navbar when the page scrolls past 60 px. */
  function initNavScroll() {
    const $nav = document.getElementById('navbar');
    if (!$nav) return;
    window.addEventListener(
      'scroll',
      () => $nav.classList.toggle('scrolled', window.scrollY > 60),
      { passive: true }
    );
  }

  /* ── Mobile hamburger menu ──────────────────────────────────────────── */
  /**
   * Registers window.toggleMenu and window.closeMobile.
   * Called by the page script — references #mobileMenu lazily so the
   * element does not need to exist at call time (supports async injection).
   */
  function initHamburger() {
    let menuOpen = false;

    window.toggleMenu = function toggleMenu() {
      menuOpen = !menuOpen;
      document.getElementById('mobileMenu').classList.toggle('open', menuOpen);
      const [s0, s1, s2] = document.querySelectorAll('.hamburger span');
      s0.style.transform = menuOpen ? 'rotate(45deg) translate(4px,4px)'  : '';
      s1.style.opacity   = menuOpen ? '0'                                  : '1';
      s2.style.transform = menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : '';
    };

    window.closeMobile = function closeMobile() {
      if (!menuOpen) return;
      menuOpen = false;
      document.getElementById('mobileMenu').classList.remove('open');
      document.querySelectorAll('.hamburger span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '1';
      });
    };
  }

  /* ── Scroll reveal ──────────────────────────────────────────────────── */
  /**
   * Observes reveal elements and marks them visible on intersection.
   *
   * @param {string} [additionalSelector] - extra elements to observe
   * @param {number} [threshold=0.08]
   * @returns {IntersectionObserver}
   */
  function initReveal(additionalSelector, threshold) {
    const base = '.reveal, .reveal-left, .reveal-right';
    const sel  = additionalSelector ? `${base}, ${additionalSelector}` : base;
    const io   = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: threshold != null ? threshold : 0.08 }
    );
    document.querySelectorAll(sel).forEach(el => io.observe(el));
    return io;
  }

  /* ── Visibility-gated rAF loop ──────────────────────────────────────── */
  /**
   * Starts a requestAnimationFrame loop that **automatically pauses** when
   * the canvas leaves the viewport and resumes when it re-enters.
   * This saves GPU/CPU for off-screen canvases.
   *
   * The drawFn should NOT call requestAnimationFrame itself.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {function} drawFn - render function called once per active frame
   * @returns {IntersectionObserver} observer (call .disconnect() to teardown)
   */
  function createVisibilityLoop(canvas, drawFn) {
    let rafId = null;

    function tick() {
      drawFn();
      rafId = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !rafId) {
          rafId = requestAnimationFrame(tick);
        } else if (!e.isIntersecting && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0.05 });

    io.observe(canvas);
    return io;
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  window.PageUtils = {
    syncCanvas,
    initCursor,
    initNavScroll,
    initHamburger,
    initReveal,
    createVisibilityLoop,
  };

})();
