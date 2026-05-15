import { fetchJson } from "./lib/fetch-json.js";
import { renderHeader, renderFooter } from "./components/layout.js?v=4";
import { renderHome } from "./pages/home.js";
import { renderGallery } from "./pages/gallery.js";
import { renderBlog } from "./pages/blog.js";
import { renderLinks } from "./pages/links.js?v=2";
import { renderBlood } from "./pages/blood.js";

function setupHeaderShrinkOnScroll() {
  const headerRoot = document.getElementById("site-header");
  if (!headerRoot) return;

  const threshold = 72;
  const onScroll = () => {
    const shouldCompact = window.scrollY > threshold;
    headerRoot.classList.toggle("is-compact", shouldCompact);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

async function bootstrap() {
  const page = document.body.dataset.page;

  try {
    const site = await fetchJson("./content/site.json");
    renderHeader(site, page);
    setupHeaderShrinkOnScroll();
    renderFooter(site);

    if (page === "home") {
      renderHome(site);
      return;
    }

    if (page === "gallery") {
      const gallery = await fetchJson("./content/gallery.json");
      renderGallery(gallery);
      return;
    }

    if (page === "blog") {
      const blog = await fetchJson("./content/blog.json");
      renderBlog(blog);
      return;
    }

    if (page === "links") {
      const links = await fetchJson("./content/links.json");
      renderLinks(links);
      return;
    }

    if (page === "blood") {
      const blood = await fetchJson("./content/blood.json");
      await renderBlood(blood);
    }
  } catch (error) {
    // Keep failure visible in UI for easier content/debug troubleshooting.
    const wrapper = document.querySelector("main") || document.body;
    const message = document.createElement("p");
    message.className = "lede";
    message.textContent = `Error: ${error.message}`;
    wrapper.prepend(message);
    console.error(error);
  }
}

bootstrap();
