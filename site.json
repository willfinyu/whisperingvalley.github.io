import { parseFrontmatter, markdownToHtml } from "../lib/markdown.js";

const tabCache = new Map();
let overlayItems = [];
let overlayIndex = 0;

function sanitizeObjectPosition(value) {
  if (!value) return "center center";
  const safe = String(value).trim();
  if (!safe) return "center center";
  // Allow common object-position tokens and percentages only.
  if (!/^[a-z0-9.%\-\s]+$/i.test(safe)) return "center center";
  return safe;
}

function summaryFromMarkdown(markdownBody) {
  const lines = markdownBody
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .filter((line) => !line.startsWith("!["))
    .filter((line) => !line.startsWith("- "))
    .filter((line) => !line.startsWith(">"));

  const first = lines[0] || "";
  return first.length > 140 ? `${first.slice(0, 140).trimEnd()}...` : first;
}

function parseSortOrder(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getBloodOverlay() {
  let overlay = document.getElementById("blood-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "blood-overlay";
    overlay.className = "blood-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Blood story item viewer");
    overlay.innerHTML = `
      <div class="bo-backdrop"></div>
      <button class="lb-close bo-close" aria-label="Close">&times;</button>
      <button class="lb-arrow lb-prev bo-prev" aria-label="Previous">&#8592;</button>
      <button class="lb-arrow lb-next bo-next" aria-label="Next">&#8594;</button>
      <article class="bo-panel">
        <header class="bo-head">
          <h2 id="bo-title"></h2>
          <p id="bo-meta"></p>
        </header>
        <div id="bo-content" class="bo-content"></div>
      </article>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".bo-backdrop").addEventListener("click", closeOverlay);
    overlay.querySelector(".bo-close").addEventListener("click", closeOverlay);
    overlay.querySelector(".bo-prev").addEventListener("click", () => moveOverlay(-1));
    overlay.querySelector(".bo-next").addEventListener("click", () => moveOverlay(1));

    document.addEventListener("keydown", (event) => {
      if (!document.body.classList.contains("bo-open")) return;
      if (event.key === "ArrowLeft") moveOverlay(-1);
      if (event.key === "ArrowRight") moveOverlay(1);
      if (event.key === "Escape") closeOverlay();
    });
  }
  return overlay;
}

function openOverlay(items, index) {
  overlayItems = items;
  overlayIndex = index;
  document.body.classList.add("bo-open");
  renderOverlay();
  getBloodOverlay().querySelector(".bo-close").focus();
}

function closeOverlay() {
  document.body.classList.remove("bo-open");
}

function moveOverlay(delta) {
  overlayIndex = (overlayIndex + delta + overlayItems.length) % overlayItems.length;
  renderOverlay();
  const panel = getBloodOverlay().querySelector(".bo-panel");
  panel.scrollTop = 0;
}

function renderOverlay() {
  const item = overlayItems[overlayIndex];
  const overlay = getBloodOverlay();

  overlay.querySelector("#bo-title").textContent = item.title;
  const metaLine = [item.meta.tabLabel, item.meta.tag].filter(Boolean).join(" / ");
  overlay.querySelector("#bo-meta").textContent = metaLine;
  overlay.querySelector("#bo-content").innerHTML = item.html;

  const total = overlayItems.length;
  overlay.querySelector(".bo-prev").style.display = total > 1 ? "" : "none";
  overlay.querySelector(".bo-next").style.display = total > 1 ? "" : "none";
}

function readCardCover(meta, html) {
  if (meta.cover) return meta.cover;
  const match = html.match(/<img src="([^"]+)"/);
  return match ? match[1] : "";
}

async function loadTabItems(tab, tabLabel) {
  if (tabCache.has(tab.key)) return tabCache.get(tab.key);

  const loaded = await Promise.all(
    tab.items.map(async (item, index) => {
      const response = await fetch(item.md);
      if (!response.ok) {
        throw new Error(`Failed to load ${item.md}: ${response.status}`);
      }

      const raw = await response.text();
      const { meta, body } = parseFrontmatter(raw);
      const html = markdownToHtml(body);
      const title = meta.title || `Item ${index + 1}`;
      const cover = readCardCover(meta, html);
      const summary = meta.summary || summaryFromMarkdown(body);
      const sortOrder = parseSortOrder(meta.sortOrder, index + 1);
      const thumbnailPosition = sanitizeObjectPosition(meta.thumbnailPosition);
      const tag = meta.tag || "";

      return {
        md: item.md,
        meta: { ...meta, tabLabel },
        title,
        cover,
        summary,
        sortOrder,
        thumbnailPosition,
        tag,
        html,
      };
    })
  );

  loaded.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.title.localeCompare(b.title);
  });

  tabCache.set(tab.key, loaded);
  return loaded;
}

function renderCards(items) {
  if (!items.length) {
    return '<p class="lede">No items in this tab yet.</p>';
  }

  return items
    .map(
      (item, index) => `
        <article class="blood-card" data-index="${index}" tabindex="0" role="button" aria-label="Open ${item.title}">
          <div class="blood-thumb">
            ${
              item.cover
                ? `<img src="${item.cover}" alt="${item.title}" style="object-position: ${item.thumbnailPosition};" />`
                : `<span class="blood-fallback">Blood</span>`
            }
          </div>
          <div class="blood-meta">
            ${item.tag ? `<p class="blood-tag">${item.tag}</p>` : ""}
            <h3>${item.title}</h3>
            ${item.summary ? `<p class="blood-summary">${item.summary}</p>` : ""}
          </div>
        </article>
      `
    )
    .join("");
}

function attachCardEvents(gridEl, items) {
  gridEl.querySelectorAll(".blood-card").forEach((card) => {
    const open = () => {
      const index = Number(card.dataset.index || 0);
      openOverlay(items, index);
    };

    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

export async function renderBlood(bloodData) {
  const tabsEl = document.getElementById("blood-tabs");
  const gridEl = document.getElementById("blood-grid");
  if (!tabsEl || !gridEl) return;

  getBloodOverlay();
  let active = bloodData.defaultTab;

  async function rerender() {
    tabsEl.innerHTML = bloodData.tabs
      .map((tab) => {
        const activeClass = tab.key === active ? "is-active" : "";
        return `<button class="tab-btn ${activeClass}" type="button" data-key="${tab.key}" role="tab" aria-selected="${tab.key === active}">${tab.label}</button>`;
      })
      .join("");

    const current = bloodData.tabs.find((tab) => tab.key === active);
    if (!current) {
      gridEl.innerHTML = '<p class="lede">Tab not found.</p>';
      return;
    }

    const items = await loadTabItems(current, current.label);
    gridEl.innerHTML = renderCards(items);
    attachCardEvents(gridEl, items);

    tabsEl.querySelectorAll("[data-key]").forEach((button) => {
      button.addEventListener("click", async () => {
        active = button.dataset.key || active;
        await rerender();
      });
    });
  }

  await rerender();
}
