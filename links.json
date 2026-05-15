export function renderLinks(linkData) {
  const listEl = document.getElementById("links-list");
  if (!listEl) return;

  listEl.innerHTML = linkData.items
    .map(
      (item) => `
      <a class="link-card reveal" href="${item.url}" target="_blank" rel="noopener noreferrer">
        <div class="link-card-head">
          <img class="link-icon" src="./data/link1.png" alt="" loading="lazy" decoding="async" aria-hidden="true" />
          <h2>${item.title}</h2>
        </div>
        <p>${item.description}</p>
      </a>
    `
    )
    .join("");
}
