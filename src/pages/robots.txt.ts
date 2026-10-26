import type { APIRoute } from 'astro';

/*
 * Crawlers only read robots.txt at the domain root, so this file does its job
 * when the site is deployed as a user site (lowszehao.github.io). On a project
 * site (lowszehao.github.io/portfolio/) it is served but never fetched, which
 * is harmless - the sitemap is also advertised from each page's <head> via
 * <link rel="sitemap">, and that is what Search Console reads.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(
    `${import.meta.env.BASE_URL.replace(/\/+$/, '')}/sitemap-index.xml`,
    site ?? 'https://lowszehao.github.io',
  );

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap.href}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
