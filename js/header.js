// Inject header CSS
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'css/header.css';
document.head.appendChild(link);

fetch("component/header.html")
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById("header-container");
    if (container) {
      container.innerHTML = html;

      // Set active class based on current path
      let currentPath = window.location.pathname.split('/').pop();
      if (!currentPath || currentPath === "") {
        currentPath = "index.html";
      }

      // Highlight active desktop nav links
      const navLinks = container.querySelectorAll('.nav-links a');
      navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Highlight active mobile menu links
      const mobileLinks = container.querySelectorAll('.mobile-menu a');
      mobileLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Initialize nav scroll behavior
      const $nav = document.getElementById('navbar');
      if ($nav) {
        let isScrolling = false;
        window.addEventListener(
          'scroll',
          () => {
            if (isScrolling) return;
            isScrolling = true;
            requestAnimationFrame(() => {
              $nav.classList.toggle('scrolled', window.scrollY > 60);
              isScrolling = false;
            });
          },
          { passive: true }
        );
        // Initial check
        if (window.scrollY > 60) {
          $nav.classList.add('scrolled');
        }
      }
    }
  });
