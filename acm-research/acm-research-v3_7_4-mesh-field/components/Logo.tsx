export default function Logo({ height = 54 }: { height?: number }) {
  // The exact ACM DJSCE mark Deep sent, served unmodified.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/acm-logo.png"
      height={height}
      alt="ACM DJSCE"
      className="brand-logo"
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}
