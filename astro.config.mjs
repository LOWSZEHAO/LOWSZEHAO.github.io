// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/*
 * ---------------------------------------------------------------------------
 *  Deployment target
 * ---------------------------------------------------------------------------
 *  GitHub Pages serves two different shapes of site, and Astro has to be told
 *  which one, or every stylesheet, image and internal link resolves to the
 *  wrong path:
 *
 *    user site      repo named  LOWSZEHAO.github.io   ->  https://lowszehao.github.io/
 *    project site   any other repo name              ->  https://lowszehao.github.io/<repo>/
 *
 *  In GitHub Actions both are derived from GITHUB_REPOSITORY, so a clean
 *  checkout of either repo name deploys correctly with no edit here.
 *
 *  Locally there is no GITHUB_REPOSITORY, so the fallbacks below apply.
 *  LOCAL_REPO_NAME is set to the real repository name so `npm run dev` serves
 *  at the same base path as production - change it if you rename the repo,
 *  and `npm run verify` will catch any link that assumed the old one.
 *
 *  To override (custom domain, Netlify, Cloudflare Pages, a different repo
 *  name you want to preview locally) set SITE_URL and/or SITE_BASE in the
 *  environment. See README -> Deployment.
 */

/** Your GitHub account name. Change this if the account ever changes. */
const GITHUB_OWNER = 'LOWSZEHAO';

/** Must match the real repository name, or local dev and production differ. */
const LOCAL_REPO_NAME = 'LOWSZEHAO.github.io';

// "owner/repo" in GitHub Actions; empty everywhere else.
const [actionsOwner, actionsRepo] = (process.env.GITHUB_REPOSITORY ?? '').split('/');

const owner = actionsOwner || GITHUB_OWNER;
const repo = actionsRepo || LOCAL_REPO_NAME;

/** The repo name that makes this a root-served user site. */
const userSiteRepo = `${owner.toLowerCase()}.github.io`;
const isUserSite = repo.toLowerCase() === userSiteRepo;

const site = process.env.SITE_URL || `https://${userSiteRepo}`;
const base = process.env.SITE_BASE || (isUserSite ? '/' : `/${repo}/`);

/*
 * A note for future content edits:
 *
 * Markdown cannot call the `url()` helper that every .astro file uses, so a
 * case study must NOT link to another page as `/projects/namestead/` - that
 * works on a user site and 404s on a project site. Use a relative link
 * instead (`../namestead/`), which is correct under any base path.
 *
 * `npm run verify` fails the build on a root-absolute link that is missing the
 * base path, so this is enforced rather than merely documented.
 */

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
