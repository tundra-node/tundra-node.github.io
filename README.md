# TundraOS

Elias Zeiner's personal website, built as a desktop operating system that runs in the browser. It's a portfolio, a blog, and a homelab-nerd homage all in one: the whole site is a draggable, resizable OS.

Live at [tundra-node.github.io](https://tundra-node.github.io/).

## What it is

- **The site is the OS.** Every page is a full-screen desktop with a taskbar, app icons, and windows. Move to `/about/` and you're looking at the about window on your desktop, not a separate page layout.
- **A real terminal.** Type `help` on the homepage for a command list. There's a virtual filesystem with `ls`, `cd`, `pwd`, and `cat`, built from the site's own content collections. `ls` then `cd projects` to browse what I've built.
- **A live desktop.** Windows drag by their title bars, stretch from the bottom-right corner, and layer with proper focus. The taskbar clock runs, the theme toggles dark/light, and the wallpaper is a network graph of my homelab that drifts and reacts to your cursor.
- **Everything's real.** Projects, blog posts, and guides are all content collections. RSS, sitemap, JSON-LD, and SEO are handled the old-fashioned way, inside the windows.

## Sections

- `/` — desktop with terminal, about, projects, blog, guides, contact
- `/about/` — who I am and what I do
- `/projects/` — privacy tools, homelab configs, open source
- `/blog/` — notes and posts
- `/guides/` — how-tos for I2P, self-hosting, and privacy tools
- `/rss.xml` — feed

## Tech

- [Astro](https://astro.build) 7 with MDX, content collections, RSS, and sitemap
- Vanilla JS for the window manager, wallpaper canvas, and terminal
- Dark/light Nord themes, stored in `localStorage`, no framework
- Deployed to GitHub Pages via GitHub Actions on push to `main`

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # static build to dist/
npm run preview   # preview the build
```

## Built as a Stardust mission

This project was built and submitted through Hack Club's Stardust program: a personal site, a web OS, and a second round of customization all in one.