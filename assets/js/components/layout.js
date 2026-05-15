export function renderHeader(site, currentPage) {
  const header = document.getElementById("site-header");
  if (!header) return;

  const nav = site.navigation
    .map((item) => {
      const activeClass = item.key === currentPage ? "is-active" : "";
      return `<a class="${activeClass}" href="${item.href}">${item.label}</a>`;
    })
    .join("");

  header.innerHTML = `
    <div class="site-header">
      <a class="brand" href="./index.html">
        <img class="brand-logo" src="./data/logo.png" alt="${site.title}" />
      </a>
      <nav class="nav" aria-label="Main navigation">${nav}</nav>
    </div>
  `;
}

export function renderFooter(site) {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="site-footer">
      <div class="site-footer-content">
        <p class="footer-text">${site.footerText}</p>
        <img class="footer-icon" src="./data/footer.png" alt="" loading="lazy" decoding="async" aria-hidden="true" />
      </div>
    </div>
  `;
}
