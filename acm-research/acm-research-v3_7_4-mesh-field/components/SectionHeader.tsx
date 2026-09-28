import Scramble from './Scramble';
type Props = {
  index: string;
  kicker: string;
  title: string;
  meta?: string;
};

export default function SectionHeader({ index, kicker, title, meta }: Props) {
  return (
    <header className="section-header">
      <div className="section-header-mono">
        <span>{index}</span>
        <span className="mono-dim">/</span>
        <span>{kicker}</span>
        {meta ? <span className="section-header-meta">{meta}</span> : null}
      </div>
      <h2 className="section-title"><Scramble text={title} /></h2>
    </header>
  );
}
