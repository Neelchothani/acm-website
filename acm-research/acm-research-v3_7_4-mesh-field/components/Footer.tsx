import { scrollToHash } from './motion';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-base">
        <span>DJSCE ACM Research</span>
        <span>
          Empowering innovation through rigorous research and collaborative
          discovery.
        </span>
        <a
          href="#top"
          className="footer-top"
          onClick={(e) => {
            e.preventDefault();
            scrollToHash('#top');
          }}
        >
          Back to top
        </a>
      </div>
    </footer>
  );
}
