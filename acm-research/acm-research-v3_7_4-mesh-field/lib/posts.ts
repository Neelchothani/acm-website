export type Post = {
  slug: string;
  title: string;
  date: string;
  tag: string;
  area: string;
  motif: string;
  excerpt: string;
  url: string;
  cover: string;
  medium: string;
};

export type FullPost = Post & { content: string };

function parsePostMarkdown(filename: string, raw: string): FullPost {
  let title = '';
  let date = '';
  let tag = '';
  let area = '';
  let motif = 'mesh';
  let excerpt = '';
  let url = '#';
  let cover = '';
  let medium = '';
  let content = raw;

  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 3);
    if (end !== -1) {
      const frontmatter = raw.slice(3, end);
      content = raw.slice(end + 4).trim();
      const lines = frontmatter.split('\n');
      for (const line of lines) {
        const colon = line.indexOf(':');
        if (colon !== -1) {
          const key = line.slice(0, colon).trim();
          let val = line.slice(colon + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (key === 'title') title = val;
          else if (key === 'date') date = val;
          else if (key === 'tag') tag = val;
          else if (key === 'area') area = val;
          else if (key === 'motif') motif = val;
          else if (key === 'excerpt') excerpt = val;
          else if (key === 'url') url = val;
          else if (key === 'cover') cover = val;
          else if (key === 'medium') medium = val;
        }
      }
    }
  }

  const slug = filename.replace(/^.*[\\/]/, '').replace(/\.md$/, '');
  const m = content.match(/!\[[^\]]*\]\((\/[^)\s]+)[^)]*\)/);
  const firstImg = m ? m[1] : '';

  return {
    slug,
    title,
    date,
    tag,
    area,
    motif,
    excerpt,
    url,
    cover: cover.startsWith('/') ? cover : firstImg,
    medium,
    content,
  };
}

// Vite glob import for all markdown files
const postModules = import.meta.glob('/content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const POSTS: FullPost[] = Object.entries(postModules)
  .map(([filepath, raw]) => parsePostMarkdown(filepath, raw))
  .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

export function getPosts(): Post[] {
  return POSTS.map(({ content, ...rest }) => rest);
}

export function getPost(slug: string): FullPost | null {
  return POSTS.find((p) => p.slug === slug) || null;
}
