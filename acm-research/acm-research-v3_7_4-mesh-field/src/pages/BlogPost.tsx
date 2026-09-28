import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { getPost } from '@/lib/posts';
import { formatDate } from '@/lib/format';
import Motif from '@/components/Motif';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : null;

  if (!post) {
    return (
      <main className="article-page">
        <div
          className="container article-wrap"
          style={{ textAlign: 'center', paddingTop: '8rem' }}
        >
          <h1 className="article-title">Article not found</h1>
          <Link
            to="/#publications"
            className="btn btn-primary"
            style={{ marginTop: '2rem', display: 'inline-block' }}
          >
            Back to Publications
          </Link>
        </div>
      </main>
    );
  }

  const html = marked.parse(post.content, { async: false }) as string;

  return (
    <main className="article-page">
      <div className="article-neon" aria-hidden="true" />
      <div className="container article-wrap">
        <Link to="/#publications" className="article-back mono-dim">
          &larr; ALL PUBLICATIONS
        </Link>
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
        <Link to="/#publications" className="article-back mono-dim">
          &larr; ALL PUBLICATIONS
        </Link>
      </div>
    </main>
  );
}
