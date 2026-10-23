# Low Sze Hao — portfolio

A static portfolio site built with [Astro](https://astro.build) and TypeScript, deployed to
GitHub Pages by GitHub Actions. No backend, no database, no paid hosting.

**Everything you need to change is in four places:**

| What | Where |
| --- | --- |
| Your name, email, LinkedIn, CV | `src/data/site.ts` |
| Your skills | `src/data/skills.ts` |
| Projects and case studies | `src/content/projects/*.md` |
| Screenshots | `src/assets/projects/` |

A checklist of the details still missing is in [`CHECKLIST.md`](CHECKLIST.md).

---

## Running it locally

Requires **Node 22.23.4 or newer**.

```bash
npm install
npm run dev
```

Then open **<http://localhost:4321/portfolio/>** — note the `/portfolio/` path. That is
deliberate: the local dev server uses the same base path a GitHub Pages *project site* uses,
so a hard-coded link that would break after deployment breaks on your machine first.

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type check, then build to `dist/` |
| `npm run check` | Type check only |
| `npm run preview` | Serve the built `dist/` exactly as it will be deployed |
| `npm run verify` | Check the built output (see [Quality checks](#quality-checks)) |

---

## Project structure

```
src/
  content.config.ts        the project schema, including the publication gate
  content/projects/*.md    one file per project — frontmatter + case study
  data/site.ts             your name, contact links, CV, availability
  data/skills.ts           the skills section
  assets/projects/         screenshots (optimised at build time)
  components/              UI pieces
  components/diagrams/     hand-drawn architecture diagrams
  layouts/                 the page shell
  pages/                   routes
  lib/url.ts               base-path-aware link helper — use it for every internal link
  styles/global.css        the whole design system
public/                    copied verbatim: favicon, og.png, .nojekyll, cv/
scripts/verify-build.mjs   post-build checks
.github/workflows/deploy.yml
```

---

## Editing your personal details

Open [`src/data/site.ts`](src/data/site.ts). Fields set to `null` are **not rendered at all**,
so the site never shows a dead link or an empty row:

```ts
cv: null,         // set to '/cv/Low-Sze-Hao-CV.pdf' and the Download CV button appears
```

Your phone number is deliberately not in this file. A number on a public page gets scraped; it
belongs on the PDF you send, which is where the CV template puts it.

### Adding your CV

The CV itself is a designed HTML template kept **outside this repository**, at
`G:\Portfolio Building\cv\Low-Sze-Hao-CV.html`, because it carries your phone number and this
repo is public. Open it in a browser, edit the HTML, then:

1. `Ctrl + P` → Destination **Save as PDF** → Paper **A4** → Margins **None**.
2. Save the PDF to `public/cv/Low-Sze-Hao-CV.pdf`.
3. Set `cv: '/cv/Low-Sze-Hao-CV.pdf'` in `src/data/site.ts`.

Two switches are marked `EDIT:` in that file — the phone number, and the photo (off by
default; see the note at the bottom of it).

The "Download CV" button appears in the hero. Until then it does not exist — the site will not
offer a download that 404s.

### Your employment history

`src/data/site.ts` exports an `experience` array, which the About page renders as a timeline
when it has entries. The wording there is kept deliberately close to the CV, so a recruiter
reading both does not find two different accounts of the same job — if you change one, change
the other.

---

## Adding or editing a project

Each project is one Markdown file in `src/content/projects/`. The frontmatter is validated
against a schema at build time, so a typo fails the build instead of producing a broken page.

```md
---
title: My Project
tagline: One line under the title.
summary: >-
  One or two sentences. Used on the card and as the page's meta description.
category: Personal engineering project
group: personal              # professional | personal — which Projects section it lands in
status: in-progress          # released | in-progress | experimental | draft
statusLabel: In progress — phase 3 of 6
order: 2                     # ascending; lower appears first
featured: true               # show on the home page
publication:
  approved: true             # false keeps it out of the build entirely
technologies:
  - C++
  - Unreal Engine 5.8
role: What you personally did.
cover: projects/my-project/screenshot.png   # optional, path under src/assets
coverAlt: Description of the screenshot.
diagram: flexxr-modules      # optional, used when there is no cover
links:
  - label: Repository
    href: https://github.com/...
    kind: source             # source | docs | store | demo | video | other
    note: Optional caveat shown under the link.
statusBreakdown:
  - label: Phase 1
    state: done              # done | in-progress | not-started | dropped
    note: What this covers.
---

## Overview

The case study body, in Markdown.
```

**Reordering** is the `order` field. **Hiding** a project is `publication.approved: false`.
**Removing** it is deleting the file. **Which section it appears under** on the Projects page
is `group` — a section with nothing in it is not rendered at all.

`tagline` is the one line shown on the card; `summary` is the page's meta description and is
not rendered as card copy. Keep the tagline short — it is what a recruiter actually reads.

**Linking between case studies:** use a relative link — `[Namestead](../namestead/)` — not
`/projects/namestead/`. Markdown cannot call the `url()` helper that `.astro` files use, so a
root-absolute link works on a user site and 404s on a project site. `npm run verify` fails the
build if you forget.

The case-study sections the layout expects — overview, problem and goals, your role, technical
implementation, challenges, testing, status and limitations, next steps — are just `##`
headings in the body. Use the ones that apply.

---

## Publication approval

This is the part worth understanding properly, because it is what keeps work you are not
allowed to publish off the internet.

`publication.approved: false` is **not** a CSS class that hides a card. Every page reads the
project collection through `getPublishedProjects()` in `src/lib/projects.ts`, which drops
unapproved entries before anything renders. The result:

- no page is generated for it,
- it appears on no list and in no sitemap,
- its Markdown lives in `src/`, which is never copied into `dist/`,
- `npm run verify` fails the build if any of that stops being true.

One project ships withheld — the employer VR training case study — and the reason is recorded
in the `blockedBy` field of the file itself.

### Publishing an approved case study

1. **Get the permission in writing** and keep it. For employer work that means the video, the
   screenshots, and what you may name — assume client names and internal system names are off
   limits until someone says otherwise.
2. Open the project's file in `src/content/projects/`.
3. Replace every `TODO` with something you can defend in an interview. Delete any TODO you
   cannot answer rather than guessing.
4. Add its media:
   - screenshots to `src/assets/projects/<project>/`, then set `cover:`
   - a video's YouTube id in `youtubeId:` (see below)
5. Set `publication.approved: true`.
6. `npm run build && npm run verify`, check it locally, then push.

### Restricted assets

Nothing restricted is in this repository, and nothing restricted should be added to it —
**this repository is public once you push it to GitHub Pages.** In particular:

- Do not commit video files. They are large, and GitHub rejects files over 100 MB.
- Do not commit a Google Drive link to unreleased company material.
- Do not put client names in frontmatter, commit messages or filenames.

`public/` is copied verbatim into the build. Anything you put there is published, whether or
not a page links to it.

---

## Screenshots and images

Put images in `src/assets/projects/<project>/` — **not** in `public/`. Astro resizes them,
converts to WebP and writes a `srcset` at build time, so a 1600px screenshot is not shipped to
fill a 300px card. (One of the included screenshots goes from 653 kB to 7 kB at card size.)

Reference a cover in frontmatter by its path under `src/assets`:

```yaml
cover: projects/namestead/panel-preview.png
```

Inside a case study body, use a normal Markdown image with a path relative to the file, and an
italic line underneath becomes the caption:

```md
![What the screenshot shows.](../../assets/projects/namestead/project-health.png)

*The caption, in smaller grey text.*
```

If a project has no honest screenshot, leave `cover` unset. The card falls back to its
architecture diagram, or to a labelled "Screenshot pending" placeholder. **Do not substitute
stock imagery** — a placeholder that admits it is one costs you nothing; a picture implying
you built something you did not costs you the interview.

---

## Video hosting

Video files do not belong in this repository. GitHub rejects anything over 100 MB, Pages has a
1 GB soft repository limit and a 100 GB/month bandwidth limit, and a multi-gigabyte capture is
not something a recruiter will wait for.

**Upload to YouTube as _Unlisted_, then put the video id in the project's `youtubeId` field.**

```yaml
youtubeId: dQw4w9WgXcQ        # the id only, not the full URL
youtubeTitle: Fire safety training module — guided mode
```

Notes:

- **Unlisted, not Private.** Private requires the viewer to sign in with an allow-listed
  Google account, which a recruiter will not do. Unlisted is not searchable or indexed but is
  viewable by anyone with the link — so treat an unlisted id on a public page as public, and
  only publish video you have permission to publish.
- The embed is **click to load**. Nothing is requested from YouTube until a viewer presses
  play, so the page carries no third-party script or cookie for people who never watch.
- **Cut it down before uploading.** Two to three minutes of the parts you want discussed beats
  a twenty-minute capture. A 1080p60 export at around 10 Mbps is roughly 150 MB per two
  minutes, which uploads in minutes rather than hours.
- Vimeo with a password works too, if you need access control; replace the `VideoEmbed`
  component's URLs. A Google Drive link is a poor substitute — it cannot be embedded cleanly
  and it exposes your Drive.

---

## Deployment to GitHub Pages

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
deploys on every push to `main`. It installs from the lockfile with `npm ci`, type checks,
builds, runs the verification script, and only then publishes — so a broken link or a leaked
draft stops the deployment rather than shipping.

### 1. Create the repository

You have two options, and **the repository name decides the URL**:

| Repository name | Published at | Base path |
| --- | --- | --- |
| `portfolio` (or any name) | `https://lowszehao.github.io/portfolio/` | `/portfolio/` |
| `LOWSZEHAO.github.io` | `https://lowszehao.github.io/` | `/` |

`astro.config.mjs` derives both from `GITHUB_REPOSITORY` inside Actions, so **either name
works with no edit**. If you pick a project-site name other than `portfolio`, update
`LOCAL_REPO_NAME` in `astro.config.mjs` so your local dev server matches — that only affects
localhost, never the deployment.

Create it on GitHub as a **public** repository (GitHub Pages needs a paid plan for private
ones).

### 2. Push the code

From this folder:

```bash
git init -b main
git add .
git commit -m "Add portfolio site"
git remote add origin https://github.com/LOWSZEHAO/portfolio.git
git push -u origin main
```

Replace the remote URL if you chose a different repository name.

### 3. Turn on Pages

In the repository on GitHub: **Settings → Pages → Build and deployment → Source**, and choose
**GitHub Actions**. Do not pick "Deploy from a branch" — that is the old method and it will not
work with this setup.

### 4. Watch the deployment

Open the **Actions** tab. The run is called *Deploy to GitHub Pages* and has two jobs, `build`
then `deploy`. A first run takes a couple of minutes.

### 5. Find the URL

When the `deploy` job finishes it prints the published URL, and it is also shown under
**Settings → Pages**. It will be one of the two URLs in the table above.

### After that

Every push to `main` rebuilds and redeploys automatically. You can also start a run by hand
from the Actions tab (*Run workflow*), which is useful after changing a repository setting.

---

## Quality checks

```bash
npm run build     # astro check (types) + astro build
npm run verify    # post-build checks against dist/
```

`npm run verify` fails if:

- a withheld project generated a page, leaked body text into the HTML, or reached the sitemap,
- an internal link does not resolve to a file that was actually built,
- an internal link is missing the base path (the classic "works on localhost only" bug),
- `.nojekyll`, `404.html`, `og.png`, `favicon.svg` or the sitemap is missing,
- a placeholder URL or a stray `TODO` reached a rendered page.

It also prints every external link, so you can confirm they still resolve. The same script
runs in CI before anything is published.

---

## Troubleshooting

**The site deploys but every stylesheet and link 404s.**
The base path is wrong. Check that the repository name on GitHub matches what
`astro.config.mjs` resolves to — the Actions log prints it, and `npm run verify` prints it
locally. The usual cause is a root-absolute `href="/projects/"` written by hand instead of
`url('/projects')`.

**A link works locally but 404s once deployed.**
Same cause. Every internal link must go through the `url()` helper in `src/lib/url.ts`.
`npm run verify` catches this.

**Images are missing after deployment.**
Images referenced from `src/assets` are fine. Anything you put in `public/` must be referenced
through `url('/...')`, not a bare `/...`.

**The build fails with "data does not match collection schema".**
A project's frontmatter has a field the schema rejects. The error names the file and the
field. A common one: a value containing a colon needs quoting in YAML —
`'VR headset (TODO: name it)'`.

**The build fails with "Cover image not found".**
`cover:` names a file that is not in `src/assets`. Add it, or remove the field so the card
falls back to its diagram.

**The workflow fails at `npm ci`.**
`package-lock.json` and `package.json` disagree. Run `npm install` locally and commit the
updated lockfile.

**Pages shows a Jekyll error.**
Settings → Pages → Source is still set to "Deploy from a branch". Change it to GitHub Actions.

---

## Design notes

Dark theme, one cyan accent used only for links, focus and status marks. System font stack, so
there is no web font to download. No CSS framework — `src/styles/global.css` is the entire
design system and is smaller than most framework resets. The only JavaScript that ships is the
click-to-load video embed; every page works with JavaScript disabled.

Accessibility: semantic landmarks, a skip link, visible focus rings, `prefers-reduced-motion`
honoured, and body text at 7.7:1 contrast or better against the background.
