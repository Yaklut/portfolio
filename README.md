# Refa Defanda Witanto — Portfolio

Personal portfolio website of **Refa Defanda Witanto**, an International Relations undergraduate at Universitas Brawijaya building a second track in data analytics, business intelligence, and research.

**Live site:** https://yaklut.github.io/portfolio/

The site is a single-page, hand-written HTML/CSS/JavaScript project. There is no framework, no build step, and no package manager: the files in this repository are exactly what GitHub Pages serves.

## What is on the site

| Section | What it shows |
|---|---|
| Hero | Name, academic status, value proposition, and the main calls to action (projects, resume, contact) |
| About | The International Relations → data/research story, plus an Experience entry (Research Fellow, Veritas Institute of Politics) |
| Expertise & Skills | What I do, and the tools and methods behind it |
| Featured Projects | Two dashboard projects (Kimia Farma, Bank Muamalat) with context, tools, key figures, dashboard screenshots, and GitHub links |
| Education | Degree, GPA, and academic honors |
| Research & Publications | Six SINTA-indexed papers, with tier, author position, and my role on each, filterable by tier and first authorship |
| Certifications | Eleven certificates grouped by domain, each viewable in an in-page lightbox |
| Timeline, Resume, Contact | Key dates, a downloadable CV, and direct contact links |

Two longer project write-ups live in [`case-studies/`](case-studies/).

## Features

- Responsive layout, designed per breakpoint (not just scaled down) from phones to large desktop screens
- Sticky navigation with active-section tracking, a reading-progress line, and a mobile menu
- `Ctrl/Cmd + K` command palette to jump between sections
- Scroll-reveal and entrance animations, all skipped when the visitor has `prefers-reduced-motion` enabled
- Accessible lightbox for certificates and dashboard screenshots (focus trap, `Esc` to close, focus returns to the trigger)
- Tabbed evidence panels on project cards that follow the WAI-ARIA tabs pattern
- Self-hosted fonts, inline SVG icons, lazy-loaded images, and no third-party JavaScript apart from a privacy-friendly page-view counter ([GoatCounter](https://www.goatcounter.com/))

## Tech stack

- **HTML5** — semantic landmarks, one `<h1>`, one `<h2>` per section
- **CSS3** — design tokens as CSS custom properties, `clamp()`-based fluid type, grid and flexbox
- **Vanilla JavaScript** — small, single-purpose files, loaded with `defer`
- **GitHub Pages** — hosting (project site served from the `portfolio` repository)

## Project structure

```
portfolio/
├── index.html                  Main single-page site
├── 404.html                    Custom "page not found" page
├── sitemap.xml                 Sitemap for search engines
├── favicon.ico
├── CURRENT_STATE.md            Running log of completed work, decisions, and next steps
├── case-studies/               Longer write-ups of the two dashboard projects
└── assets/
    ├── css/
    │   ├── styles.css          Design tokens, base styles, components, @font-face
    │   ├── redesign.css        Section-level styling (loaded after styles.css)
    │   ├── motion.css          Transitions and animation states
    │   └── expressive.css      Cursor and scroll-linked effects
    ├── js/
    │   ├── main.js             Initialises every module below (loaded last)
    │   ├── nav.js              Navbar scroll state, mobile menu, active link
    │   ├── reveal.js           Scroll-triggered reveals (IntersectionObserver)
    │   ├── modal.js            Certificate and screenshot lightbox
    │   ├── media-tabs.js       Tabbed screenshots on project cards
    │   ├── publications-filter.js
    │   ├── command-palette.js  Ctrl/Cmd + K jump menu
    │   ├── scroll-progress.js
    │   ├── stat-count.js       Count-up for hero figures
    │   ├── marquee.js          Scrolling tools strip
    │   ├── motion.js
    │   └── expressive.js
    ├── fonts/                  Self-hosted fonts and their licences
    ├── images/                 Profile photo, project screenshots, certificates, logos, icons
    └── documents/              CV (PDF)
```

CSS files are loaded in the order listed above, so later files can refine earlier ones.

## Run it locally

No installation is needed. Either open `index.html` directly in a browser, or serve the folder (this also matches how GitHub Pages behaves):

```bash
# from the repository root
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

The repository is published with GitHub Pages (**Settings → Pages → Deploy from a branch → `main` / root**). Every push to `main` updates the live site within a minute or two.

Because this is a *project* site, it is served under `/portfolio/` rather than at the domain root. Pages that need absolute paths (such as `404.html`) already account for this.

## Design system

The visual direction ("Structured Clarity") uses Signal Blue as the primary accent and Credential Gold reserved for distinctions, with Schibsted Grotesk for headings, Public Sans for body text, and IBM Plex Mono for code only. Colour pairs were checked against WCAG 2.1 AA contrast.

## Credits

- **Fonts:** Schibsted Grotesk, Public Sans, and IBM Plex Mono, all under the SIL Open Font License 1.1 (see [`assets/fonts/LICENSES.txt`](assets/fonts/LICENSES.txt)).
- **Icons:** [Lucide](https://lucide.dev/) line icons (ISC licence), used as inline SVG.

## Content notice

The text, photographs, certificates, CV, and project write-ups on this site are personal material. Please do not reuse them without permission.
