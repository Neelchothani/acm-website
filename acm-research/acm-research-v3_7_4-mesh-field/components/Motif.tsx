export default function Motif({ kind }: { kind: string }) {
  switch (kind) {
    case 'prompt':
      return (
        <div className="motif motif-prompt" aria-hidden="true">
          <span className="mp-line" />
          <span className="mp-line mp-line-2" />
          <span className="mp-cursor" />
        </div>
      );
    case 'scan':
      return (
        <div className="motif motif-scan" aria-hidden="true">
          <span className="ms-corner ms-tl" />
          <span className="ms-corner ms-tr" />
          <span className="ms-corner ms-bl" />
          <span className="ms-corner ms-br" />
          <span className="ms-line" />
        </div>
      );
    case 'mesh':
      return (
        <svg viewBox="0 0 96 64" className="motif motif-mesh" aria-hidden="true">
          <path d="M16 32 L48 14 L80 32 L48 50 Z" />
          <path d="M16 32 L48 32 M80 32 L48 32 M48 14 L48 50" />
          <circle cx="16" cy="32" r="3.5" className="mm-node" />
          <circle cx="48" cy="14" r="3.5" className="mm-node mm-n2" />
          <circle cx="80" cy="32" r="3.5" className="mm-node mm-n3" />
          <circle cx="48" cy="50" r="3.5" className="mm-node mm-n4" />
        </svg>
      );
    case 'path':
      return (
        <svg viewBox="0 0 96 64" className="motif motif-path" aria-hidden="true">
          <path
            className="mpath"
            d="M6 52 L24 30 L36 44 L52 20 L66 36 L90 12"
            pathLength={100}
          />
          <circle className="mpath-dot" r="3.5">
            <animateMotion
              dur="3.2s"
              repeatCount="indefinite"
              path="M6 52 L24 30 L36 44 L52 20 L66 36 L90 12"
            />
          </circle>
        </svg>
      );
    case 'frames':
      return (
        <div className="motif motif-frames" aria-hidden="true">
          <span className="mf-frame" />
          <span className="mf-frame mf-2" />
          <span className="mf-frame mf-3" />
        </div>
      );
    case 'orbit':
      return (
        <div className="motif motif-orbit" aria-hidden="true">
          <span className="mo-core" />
          <span className="mo-dot mo-d1" />
          <span className="mo-dot mo-d2" />
        </div>
      );
    case 'eq':
      return (
        <div className="motif motif-eq" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      );
    case 'pixel':
      return (
        <div className="motif motif-pixel" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 5) * 0.28}s` }} />
          ))}
        </div>
      );
    default:
      return (
        <div className="motif motif-orbit" aria-hidden="true">
          <span className="mo-core" />
          <span className="mo-dot mo-d1" />
        </div>
      );
  }
}
