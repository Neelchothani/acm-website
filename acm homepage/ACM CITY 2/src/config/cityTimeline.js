export const CITY_STOPS = {
  welcome: {
    id: 'welcome',
    progress: 0.0,
    frame: 0,
    range: [0.0, 0.15],
    title: 'ACM METROPOLIS ENTRY',
    subtitle: 'Gateway to the Computational Frontier',
    description: 'Welcome to the ACM digital citadel, where computing history meets tomorrow\'s breakthroughs.',
    badge: 'SECTOR 01'
  },
  eventsResearch: {
    id: 'eventsResearch',
    progress: 300 / 839, // ~0.3576 (Hero Frame 300)
    frame: 300,
    range: [0.20, 0.45],
    title: 'RESEARCH & EVENTS BUILDINGS',
    subtitle: 'Building 06 Research & Building 07 Events',
    description: 'Home to Department 06 Research and Department 07 Events, peer-reviewed deep tech and global symposiums.',
    badge: 'SECTOR 02',
    actions: [
      { label: 'Explore Research', link: '#research' },
      { label: 'Upcoming Events', link: '#events' }
    ]
  },
  editorialContact: {
    id: 'editorialContact',
    progress: 570 / 839, // ~0.6794 (Hero Frame 570)
    frame: 570,
    range: [0.50, 0.75],
    title: 'CONNECT & EDITORIAL BUILDINGS',
    subtitle: 'Connect Hub & Editorial Digital Library',
    description: 'Connecting global computing professionals with published journals, research communications, and digital archives.',
    badge: 'SECTOR 03',
    actions: [
      { label: 'Connect Hub', link: '#connect' },
      { label: 'Editorial Library', link: '#editorial' }
    ]
  },
  acmPlanet: {
    id: 'acmPlanet',
    progress: 1.0,
    frame: 899,
    range: [0.85, 1.0],
    title: 'ACM CELESTIAL CORE & HEADQUARTERS',
    subtitle: 'Global Headquarters & Planetary Computing Core',
    description: 'Advancing computing as a science and a profession across the planet and beyond.',
    badge: 'CORE ZENITH',
    actions: [
      { label: 'Explore Headquarters', link: '#headquarters' },
      { label: 'Become a Member', link: '#membership' }
    ]
  }
};

export const DEPARTMENT_FRAMES = [300, 570, 899];
export const SNAP_FRAME_THRESHOLD = 100;

export const ENGINE_CONFIG = {
  videoPath: '/city.mp4',
  framesDir: '/frames',
  totalFrames: 900,
  scrollHeightVh: 750,
  targetFps: 60,
  departmentFrames: DEPARTMENT_FRAMES,
  snapFrameThreshold: SNAP_FRAME_THRESHOLD
};

