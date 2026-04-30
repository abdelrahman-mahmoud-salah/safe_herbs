'use strict';

// تأكد إن PageUtils شغال
if (typeof PageUtils !== 'undefined') {
    PageUtils.initCursor(['a', 'button']);
    PageUtils.initNavScroll();
    PageUtils.initHamburger();
}

// Alias
const sync = PageUtils?.syncCanvas || function () { };

/* ─────────────────────────────
   SCROLL TO SECTION
───────────────────────────── */
function scrollToSection(id) {
    const el = document.getElementById(id);

    if (!el) {
        console.warn('Section not found:', id);
        return;
    }

    const navHeight = document.getElementById('navbar')?.offsetHeight || 80;

    const y = el.getBoundingClientRect().top + window.pageYOffset - navHeight;

    window.scrollTo({
        top: y,
        behavior: 'smooth'
    });
}

/* ─────────────────────────────
   HANDLE TAB CLICK (FIX MODULE ISSUE)
───────────────────────────── */
document.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.dataset.section;
        scrollToSection(sectionId);
    });
});

/* ─────────────────────────────
   ACTIVE TAB ON SCROLL
───────────────────────────── */
const sections = ['herbs', 'seeds', 'oniongarlic'];
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (isScrolling) return;
    isScrolling = true;
    requestAnimationFrame(() => {
        let current = sections[0];

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const rect = el.getBoundingClientRect();

            if (rect.top <= 150) {
                current = id;
            }
        });

        document.querySelectorAll('.cat-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === current);
        });
        isScrolling = false;
    });
}, { passive: true });

/* ─────────────────────────────
   NAV HEIGHT FIX
───────────────────────────── */
function setNavHeight() {
    const nav = document.getElementById('navbar');
    if (nav) {
        document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    }
}
setNavHeight();
let navResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(navResizeTimer);
    navResizeTimer = setTimeout(setNavHeight, 100);
});

/* ─────────────────────────────
   PREVENT CANVAS BLOCKING CLICK
───────────────────────────── */
document.querySelectorAll('canvas').forEach(c => {
    c.style.pointerEvents = 'none';
});