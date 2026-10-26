import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/**
 * The only way pages are allowed to read the projects collection.
 *
 * Entries whose `publication.approved` is false are dropped here, which is
 * what keeps unapproved work out of the build rather than merely out of sight:
 * no page is generated, no card is rendered, nothing reaches the sitemap, and
 * the Markdown source is never copied into dist/.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const all = await getCollection('projects', ({ data }) => data.publication.approved === true);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getPublishedProjects()).filter((p) => p.data.featured);
}

const SECTIONS = [
  { key: 'professional' as const, title: 'Professional work' },
  { key: 'personal' as const, title: 'Personal projects' },
];

/** Published projects split into the two sections the Projects page shows. */
export async function getGroupedProjects() {
  const all = await getPublishedProjects();

  return SECTIONS.map((section) => ({
    ...section,
    projects: all.filter((p) => p.data.group === section.key),
  })).filter((section) => section.projects.length > 0);
}

/** Link kinds, ordered so the most useful link to an interviewer comes first. */
const LINK_ORDER = ['demo', 'video', 'docs', 'store', 'source', 'other'] as const;

export function sortLinks(links: Project['data']['links']): Project['data']['links'] {
  return [...links].sort(
    (a, b) => LINK_ORDER.indexOf(a.kind as never) - LINK_ORDER.indexOf(b.kind as never),
  );
}

export const STATUS_LABELS: Record<Project['data']['status'], string> = {
  released: 'Released',
  'in-progress': 'In progress',
  experimental: 'Experimental',
  draft: 'Draft',
};

export const BREAKDOWN_LABELS = {
  done: 'Done',
  'in-progress': 'In progress',
  'not-started': 'Not started',
  dropped: 'Dropped',
} as const;
