import React from 'react';
import ProfileCard from './ProfileCard.jsx';
import { TEAM, MASKS, PHOTO_SRC } from '../data/teamData.js';

export default function TeamPhoto({
  photoRef,
  frameRef,
  cardRef,
  active,
  pinned,
  displayedMember,
  hitsRef,
  onPhotoMouseMove,
  onPhotoMouseLeave,
  onPhotoClick,
  onHitFocus,
  onHitBlur,
  onHitKeyDown,
  onCardMouseEnter,
  onCardMouseLeave
}) {
  const currentMember = displayedMember || (active > -1 ? TEAM[active] : null);

  return (
    <div
      className={`photo ${active > -1 ? 'is-on' : ''}`}
      id="photo"
      ref={photoRef}
      onMouseMove={onPhotoMouseMove}
      onMouseLeave={onPhotoMouseLeave}
      onClick={onPhotoClick}
    >
      <div className="frame" id="frame" ref={frameRef}>
        <img id="photoImg" src={PHOTO_SRC} alt="ACM Team group" />

        {MASKS.map((m, i) => (
          <div
            key={i}
            className={`tint ${active === i ? 'is-on' : ''}`}
            style={{
              left: `${m.l}%`,
              top: `${m.t}%`,
              width: `${m.w}%`,
              height: `${m.h}%`,
              backgroundImage: `url("${PHOTO_SRC}")`,
              backgroundSize: `${(100 / m.w * 100).toFixed(3)}% ${(100 / m.h * 100).toFixed(3)}%`,
              backgroundPosition: `${m.w >= 100 ? 0 : (m.l / (100 - m.w) * 100).toFixed(3)}% ${m.h >= 100 ? 0 : (m.t / (100 - m.h) * 100).toFixed(3)}%`,
              WebkitMaskImage: `url("${m.src}")`,
              maskImage: `url("${m.src}")`,
              zIndex: 10 + TEAM[i].z
            }}
          />
        ))}
      </div>

      {TEAM.map((p, i) => (
        <button
          key={i}
          ref={(el) => { if (hitsRef) hitsRef.current[i] = el; }}
          className="hit"
          type="button"
          aria-label={`${p.name} — ${p.role}`}
          data-n={i + 1}
          style={{
            left: `${p.hit.l}%`,
            top: `${p.hit.t}%`,
            width: `${p.hit.w}%`,
            height: `${p.hit.h}%`,
            zIndex: 100 + p.z
          }}
          onFocus={() => onHitFocus(i)}
          onBlur={onHitBlur}
          onKeyDown={(e) => onHitKeyDown(e, i)}
        />
      ))}

      <ProfileCard
        ref={cardRef}
        member={currentMember}
        isActive={active > -1}
        isPinned={pinned === active}
        onMouseEnter={onCardMouseEnter}
        onMouseLeave={onCardMouseLeave}
      />
    </div>
  );
}
