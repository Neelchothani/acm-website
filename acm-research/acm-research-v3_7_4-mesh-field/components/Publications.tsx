import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/lib/posts';
import { formatDate } from '@/lib/format';
import SectionHeader from './SectionHeader';
import Motif from './Motif';
import { prefersReducedMotion } from './motion';

const PAGE = 9;

function shortArea(area: string) {
  return area.split(' & ')[0] || area;
}

function BootCard({
  post,
  index,
  featured,
}: {
  post: Post;
  index: number;
  featured?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setBooted(true);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setBooted(true), (index % PAGE) * 85);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [index]);

  const open = () => navigate(`/blog/${post.slug}`);

  return (
    <div
      ref={ref}
      className={`boot-card${featured ? ' boot-featured' : ''}${booted ? ' booted' : ''}`}
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <svg
        className="boot-trace"
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          x="0.6"
          y="0.6"
          width="98.8"
          height="98.8"
          rx="2.5"
          pathLength={100}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="boot-flick">
        <span className="boot-cover">
          {post.cover ? (
            <img
              src={post.cover}
              alt=""
              style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            />
          ) : (
            <span className="boot-cover-fallback">
              <Motif kind={post.motif} />
            </span>
          )}
          <span className="boot-hover-panel">
            <span className="boot-hover-excerpt">{post.excerpt}</span>
            {post.medium && (
              <a
                className="boot-medium"
                href={post.medium}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Read on Medium
              </a>
            )}
          </span>
        </span>
        <span className="boot-body">
          <span className="boot-meta">
            <span className="boot-date">{formatDate(post.date)}</span>
            <span className="boot-area">{shortArea(post.area)}</span>
          </span>
          <span className="boot-title">{post.title}</span>
          <span className="boot-read">Read the post</span>
        </span>
      </span>
    </div>
  );
}

export default function Publications({ posts }: { posts: Post[] }) {
  const areas = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((p) => p.area).filter(Boolean)))],
    [posts]
  );
  const [area, setArea] = useState('All');
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(
    () => (area === 'All' ? posts : posts.filter((p) => p.area === area)),
    [posts, area]
  );
  const featured = filtered[0];
  const rest = filtered.slice(1, 1 + visible);
  const remaining = filtered.length - 1 - rest.length;

  return (
    <section className="publications" id="publications">
      <div className="container">
        <SectionHeader
          index="03"
          kicker="ACM RESEARCH"
          title="Publications"
          meta={`${posts.length} ITEMS UNDER THIS FOLDER.`}
        />
        <div className="boot-filters">
          {areas.map((a) => (
            <button
              key={a}
              className={`boot-chip${a === area ? ' active' : ''}`}
              onClick={() => {
                setArea(a);
                setVisible(PAGE);
              }}
            >
              {a === 'All' ? 'All' : shortArea(a)}
            </button>
          ))}
        </div>
        {featured && (
          <BootCard key={`${area}-${featured.slug}`} post={featured} index={0} featured />
        )}
        <div className="boot-grid">
          {rest.map((p, i) => (
            <BootCard key={`${area}-${p.slug}`} post={p} index={i + 1} />
          ))}
        </div>
        {remaining > 0 && (
          <button
            className="btn btn-ghost boot-more"
            onClick={() => setVisible((v) => v + PAGE)}
          >
            Load more ({remaining} remaining)
          </button>
        )}
        <p className="pub-note">
          New publications land here automatically - each one is a single file
          in the content folder.
        </p>
      </div>
    </section>
  );
}
