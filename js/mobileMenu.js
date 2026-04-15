fetch("component/mobileMenu.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("mobile-menu-container").innerHTML = html;
  });   