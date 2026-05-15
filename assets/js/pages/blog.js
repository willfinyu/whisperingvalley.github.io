const PAGE_SIZE = 5;
const PREVIEW_LEN = 500;

// ---- Modal ----

let modalPosts = [];
let modalIndex = 0;

function getBlogModal() {
  let el = document.getElementById("blog-modal");
  if (!el) {
    el = document.createElement("div");
    el.id = "blog-modal";
    el.className = "blog-modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Article reader");
    el.innerHTML = `
      <div class="bm-backdrop"></div>
      <button class="lb-close bm-close" aria-label="Close">&times;</button>
      <button class="lb-arrow lb-prev bm-prev" aria-label="Previous">&#8592;</button>
      <button class="lb-arrow lb-next bm-next" aria-label="Next">&#8594;</button>
      <div class="bm-frame">
        <h2 class="bm-title" id="bm-title"></h2>
        <time class="bm-time" id="bm-time"></time>
        <div class="bm-body" id="bm-body"></div>
      </div>
    `;
    document.body.appendChild(el);

    el.querySelector(".bm-backdrop").addEventListener("click", closeBlogModal);
    el.querySelector(".bm-close").addEventListener("click", closeBlogModal);
    el.querySelector(".bm-prev").addEventListener("click", () => moveBlogModal(-1));
    el.querySelector(".bm-next").addEventListener("click", () => moveBlogModal(1));

    document.addEventListener("keydown", (e) => {
      if (!document.body.classList.contains("bm-open")) return;
      if (e.key === "ArrowLeft") moveBlogModal(-1);
      if (e.key === "ArrowRight") moveBlogModal(1);
      if (e.key === "Escape") closeBlogModal();
    });
  }
  return el;
}

function openBlogModal(posts, index) {
  modalPosts = posts;
  modalIndex = index;
  document.body.classList.add("bm-open");
  updateBlogModal();
  getBlogModal().querySelector(".bm-close").focus();
}

function closeBlogModal() {
  document.body.classList.remove("bm-open");
}

function moveBlogModal(delta) {
  modalIndex = (modalIndex + delta + modalPosts.length) % modalPosts.length;
  updateBlogModal();
  getBlogModal().querySelector(".bm-frame").scrollTop = 0;
}

function updateBlogModal() {
  const post = modalPosts[modalIndex];
  const modal = getBlogModal();
  modal.querySelector("#bm-title").textContent = post.title;
  modal.querySelector("#bm-time").textContent = formatDate(post.date);
  modal.querySelector("#bm-time").setAttribute("datetime", post.date);
  modal.querySelector("#bm-body").textContent = post.body;

  const total = modalPosts.length;
  modal.querySelector(".bm-prev").style.display = total > 1 ? "" : "none";
  modal.querySelector(".bm-next").style.display = total > 1 ? "" : "none";
}

// ---- Calendar ----

function buildCalendar(allPosts, onDaySelect) {
  const wrapper = document.getElementById("blog-calendar");
  if (!wrapper) return;

  const dateSet = new Set(allPosts.map((p) => p.date));
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0-indexed
  let selected = null;

  function render() {
    const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    let cells = "";
    // Day-of-week headers
    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((d) => {
      cells += `<span class="cal-dow">${d}</span>`;
    });
    // Empty offset
    for (let i = 0; i < firstDay; i++) {
      cells += `<span></span>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const hasPosts = dateSet.has(iso);
      const isSelected = iso === selected;
      cells += `<button
        class="cal-day${hasPosts ? " has-post" : ""}${isSelected ? " is-selected" : ""}"
        data-date="${iso}"
        type="button"
        aria-pressed="${isSelected}"
        ${!hasPosts ? "aria-disabled=\"true\"" : ""}
      >${d}</button>`;
    }

    wrapper.innerHTML = `
      <div class="cal-header">
        <button class="cal-nav" type="button" id="cal-prev" aria-label="Previous month">&#8249;</button>
        <span class="cal-month">${monthLabel}</span>
        <button class="cal-nav" type="button" id="cal-next" aria-label="Next month">&#8250;</button>
      </div>
      ${selected ? `<button class="cal-clear" type="button">Clear filter</button>` : ""}
      <div class="cal-grid">${cells}</div>
    `;

    wrapper.querySelector("#cal-prev").addEventListener("click", () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      render();
    });
    wrapper.querySelector("#cal-next").addEventListener("click", () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    });

    const clearBtn = wrapper.querySelector(".cal-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        selected = null;
        render();
        onDaySelect(null);
      });
    }

    wrapper.querySelectorAll(".cal-day.has-post").forEach((btn) => {
      btn.addEventListener("click", () => {
        selected = btn.dataset.date;
        render();
        onDaySelect(selected);
      });
    });
  }

  render();
}

// ---- Helpers ----

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("default", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function paginate(posts, page) {
  const start = (page - 1) * PAGE_SIZE;
  return posts.slice(start, start + PAGE_SIZE);
}

function renderPagination(total, current, onPage) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return "";

  let btns = "";
  for (let i = 1; i <= pages; i++) {
    btns += `<button class="page-btn${i === current ? " is-active" : ""}" data-page="${i}" type="button">${i}</button>`;
  }
  return `<div class="pagination">${btns}</div>`;
}

// ---- Main renderer ----

export function renderBlog(blogData) {
  const listEl = document.getElementById("blog-list");
  if (!listEl) return;

  // Ensure modal DOM is ready.
  getBlogModal();

  const allPosts = blogData.posts;
  let filteredPosts = allPosts;
  let currentPage = 1;

  function redraw() {
    const visible = paginate(filteredPosts, currentPage);
    const pageHTML = renderPagination(filteredPosts.length, currentPage, setPage);

    if (filteredPosts.length === 0) {
      listEl.innerHTML = `<p class="lede" style="padding:1rem">No articles on this date.</p>${pageHTML}`;
      return;
    }

    listEl.innerHTML =
      visible
        .map((post, i) => {
          const globalIndex = (currentPage - 1) * PAGE_SIZE + i;
          const preview =
            post.body.length > PREVIEW_LEN
              ? post.body.slice(0, PREVIEW_LEN).trimEnd() + "\u2026"
              : post.body;
          const needsMore = post.body.length > PREVIEW_LEN;
          return `
          <article class="entry reveal" data-index="${globalIndex}">
            <h2 class="entry-title" role="button" tabindex="0">${post.title}</h2>
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <p class="entry-preview">${preview}</p>
            ${needsMore ? `<button class="read-more" type="button" data-index="${globalIndex}">Read more</button>` : ""}
          </article>
        `;
        })
        .join("") + pageHTML;

    // Wire title clicks
    listEl.querySelectorAll(".entry").forEach((card) => {
      const idx = parseInt(card.dataset.index, 10);
      const openHandler = () => openBlogModal(filteredPosts, idx);

      card.querySelector(".entry-title").addEventListener("click", openHandler);
      card.querySelector(".entry-title").addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openHandler(); }
      });

      const rmBtn = card.querySelector(".read-more");
      if (rmBtn) rmBtn.addEventListener("click", openHandler);
    });

    // Wire pagination
    listEl.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.dataset.page, 10);
        redraw();
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setPage(n) {
    currentPage = n;
    redraw();
  }

  // Calendar integration
  buildCalendar(allPosts, (date) => {
    filteredPosts = date ? allPosts.filter((p) => p.date === date) : allPosts;
    currentPage = 1;
    redraw();
  });

  redraw();
}
