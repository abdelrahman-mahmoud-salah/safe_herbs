// Inject footer CSS
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'css/footer.css';
document.head.appendChild(link);

fetch("component/footer.html")
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById("footer-container");
    if (container) {
      container.innerHTML = html;
    }
  });