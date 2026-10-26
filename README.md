# Low Sze Hao — portfolio

Personal portfolio site, built with Astro and TypeScript and deployed to GitHub Pages.
Live at <https://lowszehao.github.io/>.

## Running it

Needs Node 22.23.4 or newer.

```bash
npm install
npm run dev
```

`npm run build` type checks and builds to `dist/`, and `npm run verify` runs the post-build
checks. Every push to `main` builds and deploys automatically.

## Where the content lives

- `src/data/site.ts` — name, contact links, experience
- `src/data/skills.ts` — the skills section
- `src/content/projects/*.md` — one file per project, frontmatter plus the case study
- `src/assets/projects/` — images, optimised at build time
- `src/styles/global.css` — the design system

Internal links go through the `url()` helper in `src/lib/url.ts` so they keep working at
whatever base path the site is served from.
