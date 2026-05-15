// ---- Lightbox ----

let lightboxItems = [];
let lightboxIndex = 0;

function getLightbox() {
  let el = document.getElementById("lightbox");
  if (!el) {
    el = document.createElement("div");
    el.id = "lightbox";
    el.className = "lightbox";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Artwork viewer");
    el.innerHTML = `
      <div class="lb-backdrop"></div>
      <button class="lb-close" aria-label="Close">&times;</button>
      <button class="lb-arrow lb-prev" aria-label="Previous">&#8592;</button>
      <button class="lb-arrow lb-next" aria-label="Next">&#8594;</button>
      <figure class="lb-frame">
        <div class="lb-image" id="lb-image"></div>
        <figcaption class="lb-caption" id="lb-caption"></figcaption>
      </figure>
    `;
    document.body.appendChild(el);

    el.querySelector(".lb-backdrop").addEventListener("click", closeLightbox);
    el.querySelector(".lb-close").addEventListener("click", closeLightbox);
    el.querySelector(".lb-prev").addEventListener("click", () => moveLightbox(-1));
    el.querySelector(".lb-next").addEventListener("click", () => moveLightbox(1));

    document.addEventListener("keydown", (e) => {
      if (!document.body.classList.contains("lb-open")) return;
      if (e.key === "ArrowLeft") moveLightbox(-1);
      if (e.key === "ArrowRight") moveLightbox(1);
      if (e.key === "Escape") closeLightbox();
    });
  }
  return el;
}

function openLightbox(items, index) {
  lightboxItems = items;
  lightboxIndex = index;
  document.body.classList.add("lb-open");
  updateLightbox();
  getLightbox().querySelector(".lb-close").focus();
}

function closeLightbox() {
  document.body.classList.remove("lb-open");
}

function moveLightbox(delta) {
  lightboxIndex = (lightboxIndex + delta + lightboxItems.length) % lightboxItems.length;
  updateLightbox();
}

function updateLightbox() {
  const item = lightboxItems[lightboxIndex];
  const lb = getLightbox();
  const img = lb.querySelector("#lb-image");
  const cap = lb.querySelector("#lb-caption");

  img.innerHTML = item.image
    ? `<img src="${item.image}" alt="${item.title}" />`
    : `<div class="lb-placeholder">${item.shortLabel}</div>`;

  cap.textContent = `${item.title} — ${item.medium}`;

  const total = lightboxItems.length;
  lb.querySelector(".lb-prev").style.display = total > 1 ? "" : "none";
  lb.querySelector(".lb-next").style.display = total > 1 ? "" : "none";
}

// ---- Cards ----

function renderCards(items) {
  if (items.length === 0) {
    return '<p class="lede">No artworks in this category yet.</p>';
  }

  return items
    .map(
      (item, i) => `
      <article class="art-card" data-index="${i}" tabindex="0" role="button" aria-label="View ${item.title}">
        <div class="art-thumb">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" />` : item.shortLabel}
        </div>
        <div class="art-meta">
          <h3>${item.title}</h3>
          <p>${item.medium}</p>
        </div>
      </article>
    `
    )
    .join("");
}

function attachCardListeners(gridEl, items) {
  gridEl.querySelectorAll(".art-card").forEach((card) => {
    const handler = () => {
      const index = parseInt(card.dataset.index, 10);
      openLightbox(items, index);
    };
    card.addEventListener("click", handler);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  });
}

export function renderGallery(galleryData) {
  const tabsEl = document.getElementById("gallery-tabs");
  const gridEl = document.getElementById("gallery-grid");
  if (!tabsEl || !gridEl) return;

  // Ensure lightbox is already in the DOM.
  getLightbox();

  let active = galleryData.defaultCategory;

  function rerender() {
    tabsEl.innerHTML = galleryData.categories
      .map((category) => {
        const activeClass = category.key === active ? "is-active" : "";
        return `<button class="tab-btn ${activeClass}" type="button" data-cat="${category.key}" role="tab" aria-selected="${category.key === active}">${category.label}</button>`;
      })
      .join("");

    const category = galleryData.categories.find((cat) => cat.key === active);
    const items = category ? category.items : [];
    gridEl.innerHTML = renderCards(items);
    attachCardListeners(gridEl, items);

    tabsEl.querySelectorAll("[data-cat]").forEach((button) => {
      button.addEventListener("click", () => {
        active = button.dataset.cat || active;
        rerender();
      });
    });
  }

  rerender();
}
