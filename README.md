# Silence Valley

Modular static personal art website with separate pages for intro, gallery, Blood story series, blog, and links.

## Pages

- `index.html`: landing / self introduction
- `gallery.html`: gallery with category tabs
- `blood.html`: Blood story series with tabs and markdown-driven blobs
- `blog.html`: short articles
- `links.html`: curated external links

## Content-first architecture

Update content without touching rendering logic:

- `content/site.json`: site name, intro text, footer text
- `content/gallery.json`: categories and artworks
- `content/blood.json`: Blood tabs and markdown item sources
- `content/blog.json`: blog entries
- `content/links.json`: links list

## Blood Markdown Blob Template

Each Blood item is sourced from a markdown file referenced in `content/blood.json`.

Use this frontmatter + markdown layout:

```md
---
title: Example Item Title
cover: ./data/header.png
tag: Concept
summary: One sentence shown on the card.
sortOrder: 10
thumbnailPosition: 50% 40%
---

# Example Item Title

![Optional hero image](./data/header.png)

Main paragraph text.

## Section Heading

- Bullet one
- Bullet two

> Optional quote or highlight
```

Frontmatter field notes:

- `title`: card and overlay title
- `cover`: card thumbnail image path
- `tag`: small card label and overlay meta
- `summary`: short card description
- `sortOrder`: order inside the tab (lower appears first)
- `thumbnailPosition`: CSS object-position for thumbnail crop (for example `70% 35%`)

## Run locally

1. Use any static server. Example:
   - `python3 -m http.server 4173`
2. Open `http://localhost:4173`

## Extend

- Add a page file and corresponding renderer in `assets/js/pages/`
- Register page renderer in `assets/js/main.js`
- Keep shared layout in `assets/js/components/layout.js`
