(function () {
  function hidePreloader() {
    var p = document.getElementById('preloader');
    if (!p || p.classList.contains('hidden')) return;
    p.classList.add('hidden');
    p.setAttribute('aria-busy', 'false');
  }
  function arm() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
    var delayMs = reduced || mobile ? 400 : 1200;
    window.addEventListener('load', function () {
      setTimeout(hidePreloader, delayMs);
    });
    setTimeout(hidePreloader, 12000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm);
  else arm();
})();


  document.getElementById('contact-submit')?.addEventListener('click', function () {
    var root = document.getElementById('contact');
    if (!root) return;
    var n = root.querySelector('input[name="name"]')?.value.trim() || '';
    var e = root.querySelector('input[name="email"]')?.value.trim() || '';
    var c = root.querySelector('input[name="company"]')?.value.trim() || '';
    var m = root.querySelector('textarea[name="message"]')?.value.trim() || '';
    var body = 'Name: ' + n + '\nEmail: ' + e + '\nCompany / Country: ' + c + '\n\n' + m;
    window.location.href = 'mailto:info@safeherbsco.com?subject=' + encodeURIComponent('Website inquiry') + '&body=' + encodeURIComponent(body);
  });