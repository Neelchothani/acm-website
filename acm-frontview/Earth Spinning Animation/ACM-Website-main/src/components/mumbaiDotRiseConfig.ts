// ============================================================================
// ACM DJSCE — MUMBAI "DOT RISE" 3D GLOBE MARKER CONFIGURATION
// ============================================================================
// Edit any property in `MUMBAI_DOT_RISE_CONFIG` below to tune location, text,
// font, sampling density, particle size, float height, camera-facing angles,
// timings, globe rotation slow-down, and brand colors.
// ============================================================================

export const MUMBAI_DOT_RISE_CONFIG = {
  /** DJSCE, Vile Parle West, Mumbai, India (West Coast) */
  location: {
    lat: 19.107,
    lon: 72.837,
    a11yLabel: "DJSCE ACM, Mumbai",
  },

  /** Primary floating particle text and underneath subtitle */
  text: "ACM",
  subtitle: "DJSCE · MUMBAI",

  /** Typography configuration for offscreen canvas sampling */
  font: {
    family: "Orbitron",
    weight: 900,
    canvasFontSizePx: 106,
    fallback: "sans-serif",
  },

  /** Offscreen grid sampling settings for building the "ACM" dot target shape */
  sampling: {
    canvasWidth: 390,
    canvasHeight: 132,
    gridStepDesktop: 5,
    gridStepMobile: 7,
    maxParticlesDesktop: 450,
    maxParticlesMobile: 220,
    alphaThreshold: 115,
  },

  /** 3D spatial dimensions (expressed as fractions of the globe radius) */
  spatial: {
    /** Height above Mumbai's surface where the "ACM" plane floats */
    floatHeightRadiusFraction: 0.27,
    /** Width of the assembled "ACM" word relative to the globe radius */
    letterWidthRadiusFraction: 0.46,
    /** Height of the assembled "ACM" word relative to the globe radius */
    letterHeightRadiusFraction: 0.16,
    /** Quadratic Bézier control point overshoot above the target letter position */
    bezierOvershootRadiusFraction: 0.12,
    /** Angular radius around Mumbai on the globe surface from which dots lift off */
    sourcePatchAngularRadiusRad: 0.09,
    /** Point size in pixels for the Three.js particle shader */
    particleSizeDesktop: 7.8,
    particleSizeMobile: 6.2,
  },

  /** Camera-facing angle hysteresis (angle between Mumbai surface normal and camera) */
  facingAngles: {
    /** Start rising when Mumbai is within 35° of facing the camera */
    startRiseAngleDeg: 35,
    /** Trigger fall when Mumbai rotates beyond 50° from the camera */
    endFallAngleDeg: 50,
  },

  /** Animation timings (in seconds) */
  timings: {
    /** Continuous surface ring ripple loop duration */
    surfaceRipplePeriodSec: 2.4,
    /** Total duration for the dots to rise and assemble into "ACM" */
    riseDurationSec: 1.65,
    /** Total duration for the dots to fall back to the globe surface */
    fallDurationSec: 1.2,
    /** Maximum stagger delay across particles (radial + random) during rise */
    riseStaggerMaxSec: 0.48,
    /** Maximum stagger delay across particles during fall */
    fallStaggerMaxSec: 0.35,
    /** Fraction of rise completion when the subtitle & underline fade in */
    subtitleRevealThreshold: 0.76,
    /** Twinkle speed for holding particles */
    twinkleSpeedRadPerSec: 3.8,
  },

  /** Globe rotation speed & slow-down when "ACM" is holding in view */
  rotation: {
    /** Normal free-spin angular speed (radians/sec) */
    normalSpeedRadPerSec: 0.26,
    /** Multiplier applied while the "ACM" letters are risen (0.24 = 24% speed) */
    holdSpeedMultiplier: 0.24,
    /** Initial phi angle on page load so Mumbai rotates into view right away */
    initialPhiRad: 3.22,
  },

  /** Brand colors matching the ACM DJSCE site title */
  colors: {
    /** Left-to-right gradient across "ACM": cyan -> blue -> purple */
    gradientStartHex: "#5ee7ff",
    gradientMidHex: "#6aa8ff",
    gradientEndHex: "#b48cff",
    /** Always-on surface dot & ripple rings */
    surfaceDotCoreHex: "#ffffff",
    surfaceRippleHex: "#5ee7ff",
    /** Holographic projection cone from Mumbai to the floating letters */
    lightConeHex: "#5ee7ff",
    /** Globe dark land masking color so surface dots appear to leave the globe */
    surfaceMaskHex: "#060e20",
  },
} as const;
