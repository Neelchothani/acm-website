import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { getPosts, getPost } from '../../../lib/posts';
import { formatDate } from '../../../lib/format';
import Motif from '../../../components/Motif';

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  return { title: post ? `${post.title} - DJSCE ACM Research` : 'DJSCE ACM Research' };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const html = marked.parse(post.content, { async: false });

  return (
    <main className="article-page">
      <div className="article-neon" aria-hidden="true" />
      <div className="container article-wrap">
        <a href="/#publications" className="article-back mono-dim">
          &larr; ALL PUBLICATIONS
        </a>
        <div className="section-header-mono">
          <span>ACM RESEARCH</span>
          <span className="mono-dim">/</span>
          <span>{post.tag.toUpperCase()}</span>
        </div>
        <h1 className="article-title">{post.title}</h1>
        <p className="article-meta">
          <span className="article-date">{formatDate(post.date)}</span>
          <span className="mono-dim"> / </span>
          <span>{post.area}</span>
        </p>
        <div className="article-motif">
          <Motif kind={post.motif} />
        </div>
        <article
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <a href="/#publications" className="article-back mono-dim">
          &larr; ALL PUBLICATIONS
        </a>
      </div>
    </main>
  );
}
