import Reveal from './Reveal';

export default function ContactBand() {
  return (
    <section className="contact" id="contact">
      <div className="container contact-inner">
        <Reveal>
          <div className="section-header-mono">
            <span>04</span>
            <span className="mono-dim">/</span>
            <span>CONTACT US</span>
          </div>
          <h2 className="section-title">Join Our Research Community</h2>
          <p className="contact-para">
            We&apos;re always looking for passionate researchers, students and
            collaborators. Whether you&apos;re just starting out or pushing
            boundaries, there&apos;s a place for you in the chapter.
          </p>
          <div className="hero-cta">
            <a
              className="btn btn-primary"
              href="https://djsacm-research.github.io/"
              target="_blank"
              rel="noreferrer"
            >
              Visit the chapter site
            </a>
            <a
              className="btn btn-ghost"
              href="#publications"
            >
              Browse all blogs
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
