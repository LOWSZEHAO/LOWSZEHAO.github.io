/*
 * Build an internal URL that respects Astro's configured `base`.
 *
 * GitHub Pages project sites are served from /<repo>/, so a hard-coded
 * href="/projects/" works on localhost and 404s once deployed. Every internal
 * link and asset path on this site goes through here instead.
 *
 *   url('/')                 -> '/portfolio/'
 *   url('/projects')         -> '/portfolio/projects/'
 *   url('/cv/cv.pdf')        -> '/portfolio/cv/cv.pdf'
 *   url('/#contact')         -> '/portfolio/#contact'
 *   url('#top')              -> '#top'            (same-page anchor, untouched)
 */
export function url(path = '/'): string {
  if (path.startsWith('#')) return path;

  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const [rawPath = '', hash] = path.split('#');

  let segment = rawPath.replace(/^\/+/, '');

  // Files keep their exact name; routes get a trailing slash to match
  // `trailingSlash: 'always'` and avoid a redirect hop.
  const isFile = /\.[a-z0-9]{2,5}$/i.test(segment);
  if (segment && !isFile && !segment.endsWith('/')) segment += '/';

  return `${base}/${segment}${hash ? `#${hash}` : ''}`;
}

/** Absolute URL, for canonical links and Open Graph tags. */
export function absoluteUrl(path: string, origin: string | URL): string {
  return new URL(url(path), origin).toString();
}

/** True for anything that leaves the site, so links can be marked up correctly. */
export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:');
}
