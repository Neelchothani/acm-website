import React from 'react';

const ICON = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45z"/>
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.81 1.18 1.85 1.18 3.11 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.05.78 2.13v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/>
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 3.2V17h16V8.2l-8 5.5-8-5.5zM19.6 7H4.4l7.6 5.2L19.6 7z"/>
    </svg>
  )
};

const ProfileCard = React.forwardRef(function ProfileCard({
  member,
  isActive,
  isPinned,
  onMouseEnter,
  onMouseLeave
}, ref) {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [member?.photo]);

  if (!member) {
    return (
      <div
        ref={ref}
        className="card"
        role="dialog"
        aria-live="polite"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <img className="shot" alt="" decoding="async" hidden />
        <div className="pad">
          <h2></h2>
          <p className="role"></p>
          <p className="bio" hidden></p>
          <div className="links" hidden></div>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { type: 'linkedin', url: member.linkedin, label: 'LinkedIn' },
    { type: 'github', url: member.github, label: 'GitHub' },
    { type: 'email', url: member.email, label: 'Email' }
  ].filter(l => Boolean(l.url));

  const hasPhoto = Boolean(member.photo && !imgError);

  return (
    <div
      ref={ref}
      className={`card ${isActive ? 'is-on' : ''} ${isPinned ? 'is-pinned' : ''}`}
      role="dialog"
      aria-live="polite"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img
        className="shot"
        alt={member.name || ''}
        decoding="async"
        src={member.photo || ''}
        hidden={!hasPhoto}
        onError={() => setImgError(true)}
      />
      <div className="pad">
        <h2>{member.name}</h2>
        <p className="role">{member.role}</p>
        <p className="bio" hidden={!member.bio}>{member.bio}</p>
        <div className="links" hidden={socialLinks.length === 0}>
          {socialLinks.map((item) => (
            <a
              key={item.type}
              href={item.type === 'email' ? `mailto:${item.url}` : item.url}
              aria-label={`${item.label} — ${member.name}`}
              title={item.label}
              target={item.type !== 'email' ? '_blank' : undefined}
              rel={item.type !== 'email' ? 'noopener' : undefined}
            >
              {ICON[item.type]}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProfileCard;
