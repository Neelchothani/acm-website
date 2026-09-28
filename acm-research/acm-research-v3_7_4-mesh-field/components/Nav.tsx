'use client';

import { scrollToHash } from './motion';
import Logo from './Logo';
import Scramble from './Scramble';

export default function Nav() {
  const go = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToHash(hash);
  };
  return (
    <nav className="site-nav">
      <a
        href="#top"
        className="nav-brand"
        onClick={go('#top')}
        aria-label="Back to top"
      >
        <Logo height={54} />
        <span className="nav-brand-word">Research</span>
      </a>
      <div className="nav-links">
        <a href="#areas" onClick={go('#areas')}>
          <Scramble text="Research Areas" />
        </a>
        <a href="#publications" onClick={go('#publications')}>
          <Scramble text="Publications" />
        </a>
      </div>
    </nav>
  );
}
