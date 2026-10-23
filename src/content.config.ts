import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * ---------------------------------------------------------------------------
 *  Publication approval
 * ---------------------------------------------------------------------------
 *  Some of this portfolio describes work that is not mine to publish yet:
 *  employer-owned material needs written permission, and a commercial plugin's
 *  source stays closed. Rather than hiding those with CSS - which still ships
 *  the text to anyone who opens view-source - approval is a build-time gate.
 *
 *  `getPublishedProjects()` in src/lib/projects.ts is the only way pages read
 *  this collection, and it drops every entry whose `publication.approved` is
 *  false. A dropped entry generates no page, appears in no list, and reaches
 *  no sitemap. Its Markdown lives in src/, which is never copied into dist/.
 *
 *  To publish a drafted project: set `publication.approved: true`, add any
 *  media it needs under public/, and rebuild. See README -> Publishing an
 *  approved case study.
 */
const publicationSchema = z.object({
  /** false keeps this project out of the built site entirely. */
  approved: z.boolean(),
  /** Private note to self on what approval is waiting for. Never rendered. */
  blockedBy: z.string().optional(),
});

/** Where a link points, so the UI can label and order links consistently. */
const linkSchema = z.object({
  label: z.string(),
  href: z.url(),
  kind: z.enum(['source', 'docs', 'store', 'demo', 'video', 'other']).default('other'),
  /** Set when a link needs a caveat, e.g. source is public for review only. */
  note: z.string().optional(),
});

/**
 * One row of the honest status breakdown on a case study: what is built, what
 * is partly built, what was deliberately left out. Keeps "in progress" from
 * being a single vague badge.
 */
const statusRowSchema = z.object({
  label: z.string(),
  state: z.enum(['done', 'in-progress', 'not-started', 'dropped']),
  note: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One line under the title. Plain language, no buzzwords. */
    tagline: z.string(),
    /** Used for <meta name="description"> and the card body. 1-2 sentences. */
    summary: z.string(),
    category: z.string(),

    /**
     * Which section of the Projects page this belongs in. `professional` is
     * work done for an employer; `personal` is my own, including the
     * commercial plugin.
     */
    group: z.enum(['professional', 'personal']),

    /** Drives the status badge. `released` is the only "finished" value. */
    status: z.enum(['released', 'in-progress', 'experimental', 'draft']),
    /** The precise human wording, e.g. "In progress - Phase 3 of 6". */
    statusLabel: z.string(),

    /** Ascending. Lower numbers appear first. */
    order: z.number().int(),
    featured: z.boolean().default(false),

    publication: publicationSchema,

    /** Only technologies actually used - verified from the repo, not planned. */
    technologies: z.array(z.string()).min(1),
    /** What I personally did. The first question an interviewer asks. */
    role: z.string(),

    links: z.array(linkSchema).default([]),
    statusBreakdown: z.array(statusRowSchema).default([]),

    /**
     * Cover image, as a path under src/assets - e.g.
     * 'projects/namestead/panel-preview.png'. Images live in src/assets rather
     * than public/ so Astro resizes them, emits WebP, and writes a srcset: a
     * 1600px screenshot is not shipped to fill a 300px card.
     *
     * Left unset on purpose where no honest screenshot exists yet. The card
     * then falls back to `diagram`, and failing that to a labelled
     * placeholder, rather than to a stock image pretending to be my work.
     */
    cover: z.string().optional(),
    coverAlt: z.string().optional(),

    /**
     * A named architecture diagram to use as the card visual when there is no
     * screenshot. Each one is drawn from the project's own documentation, so
     * it carries real information instead of decorating the card.
     * Add a new name here and a matching branch in ProjectVisual.astro.
     */
    diagram: z.enum(['flexxr-modules', 'namestead-pipeline', 'uplink-loop']).optional(),

    /**
     * Embedded demo videos. Only ever set these alongside
     * `publication.approved: true`, and only for video you are permitted to
     * publish - an unlisted YouTube video on a public page is public.
     *
     * Nothing is requested from YouTube until a viewer presses play: the
     * poster frame is served from this site, and the iframe is created on
     * click. So `poster` should be a local still under src/assets; without
     * one the component falls back to YouTube's thumbnail CDN, which is a
     * third-party request on page load.
     */
    videos: z
      .array(
        z.object({
          /** The id only, e.g. `L2fUpbcsDbw` - not a full URL. */
          id: z.string(),
          title: z.string(),
          /** One or two lines on what this clip actually shows. */
          description: z.string().optional(),
          /** Path under src/assets, e.g. 'projects/vr-training/foo.jpg'. */
          poster: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { projects };
