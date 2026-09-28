# DJSCE ACM Research - v2 "Planet Over the District"

A neon digital-city rebuild of the ACM Research page. Palette pulled from the
chapter's city flythrough video: deep navy night, neon cyan + magenta
signage, warm amber window light.

## Run

```bash
npm install
npm run dev
```

Production build: `npm run build && npm start`.

## Stack

- Next.js 16 (App Router) + TypeScript + React 19 (npm audit: 0 vulnerabilities)
- lenis - smooth scrolling
- GSAP + ScrollTrigger - scroll-driven motion (transform/opacity only),
  including the stack-spread that fans the Research Areas cards out on scroll
- Custom canvas planet mesh - the hero's live wireframe planet: ripple,
  pulsing cyan/magenta nodes, cursor tilt, scroll-fed spin (no WebGL, ~0 kB)
- AuroraGL (components/AuroraGL.tsx) - the hero + contact band's live aurora
  borealis on a raw WebGL fragment shader: domain-warped noise curtains
  (magenta fringe, cyan core, green-teal top) with a twinkling star field,
  subtle cursor drift, DPR-capped, paused off-screen, reduced-motion safe
- FooterWave (components/FooterWave.tsx) - the footer's live neon wavefield
- ACM DJSCE diamond logo - clean inline SVG recreation (components/Logo.tsx)
- Hover text-scramble (decrypt) on nav links and headings (components/Scramble.tsx)
- marked - renders each post's markdown on its own /blog/[slug] page
- Content-driven publications - see below

## Adding a publication (no code)

Drop one markdown file into `content/posts/`:

```md
---
title: "Post title"
date: "2026-01-15"
tag: "Short Tag"
area: "One of the five research areas"
motif: "mesh"
excerpt: "One line about the post."
url: "https://djsacm-research.github.io/blogs/the-post-slug"
cover: "/blog-images/<slug>/hero.jpg"   # optional - card cover image
medium: "https://medium.com/@author/post-slug-id"   # optional - Medium original, shown on card hover
---
```

The full article lives under the frontmatter as markdown (images in
public/blog-images/<slug>/). The Publications card grid takes each card's
cover from the frontmatter `cover` field, or - if omitted - the first image
in the post body, or a generated motif cover if the post has no image. Each post renders at /blog/<slug> on the site
itself. The list, count ("N ITEMS UNDER THIS FOLDER") and ordering (newest first)
update themselves. `motif` picks the animated card tile: prompt, scan,
mesh, path, frames, orbit, eq, pixel.

## Motion assets

- `public/assets/hero-city.mp4` - the chapter city flythrough, used in the
  hero and the contact band. `poster.webp` is only the pre-load frame.
- To swap or add clips, drop mp4 (H.264, muted, < ~2 MB) into
  `public/assets/` and update the `src` in `components/Hero.tsx` /
  `components/ContactBand.tsx`.
- See `ASSETS.md` for ready-to-paste Higgsfield prompts if the chapter
  wants fresh generated loops for the hero, area signs or blog cards.

## Stability budget (deliberate, do not regress)

- The vanta planet loads after first paint, only at >=768px, never on
  reduced-motion; pixel ratio capped at 1.5; the canvas pauses off-screen.
  three.js + vanta stay in a lazy chunk (~130 kB gz) that phones never
  download.
- Videos are muted loops with preload="none"/"metadata" and pause
  off-screen via IntersectionObserver.
- All CSS/GSAP motion is transform/opacity/stroke only. No layout thrash.
- prefers-reduced-motion: no smooth-scroll hijack, no video, no keyframes.
