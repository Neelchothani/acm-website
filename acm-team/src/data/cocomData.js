import cocomJson from './cocomData.json';

export const COCOM_DEPT_META = {
  Research: {
    id: 'research',
    badge: 'DEPT 01',
    color: '#00D8FF',
    accentRgb: '0, 216, 255',
    description: 'Deep-tech exploratory papers, AI/ML models, and technical research publications.'
  },
  Events: {
    id: 'events',
    badge: 'DEPT 02',
    color: '#FF3BBF',
    accentRgb: '255, 59, 191',
    description: 'Hackathons, flagship symposiums, speaker sessions, and tech festivals.'
  },
  'Info-Tech': {
    id: 'infotech',
    badge: 'DEPT 03',
    color: '#38BDF8',
    accentRgb: '56, 189, 248',
    description: 'Chapter digital infrastructure, systems architecture, portals, and cloud services.'
  },
  Technical: {
    id: 'technical',
    badge: 'DEPT 04',
    color: '#818CF8',
    accentRgb: '129, 140, 248',
    description: 'Core engineering, competitive programming, platform development, and code reviews.'
  },
  Marketing: {
    id: 'marketing',
    badge: 'DEPT 05',
    color: '#F472B6',
    accentRgb: '244, 114, 182',
    description: 'Brand outreach, sponsorship partnerships, community growth, and campaign strategy.'
  },
  Publicity: {
    id: 'publicity',
    badge: 'DEPT 06',
    color: '#FB923C',
    accentRgb: '251, 146, 60',
    description: 'Social broadcasting, cross-college alliances, announcements, and audience engagement.'
  },
  Creatives: {
    id: 'creatives',
    badge: 'DEPT 07',
    color: '#C084FC',
    accentRgb: '192, 132, 252',
    description: 'Visual identity, cyberpunk UI/UX designs, motion graphics, and media assets.'
  },
  Operations: {
    id: 'operations',
    badge: 'DEPT 08',
    color: '#34D399',
    accentRgb: '52, 211, 153',
    description: 'Logistics management, resource allocation, venue operations, and event execution.'
  },
  Editorial: {
    id: 'editorial',
    badge: 'DEPT 09',
    color: '#FBBF24',
    accentRgb: '251, 191, 36',
    description: 'ACM chronicle magazines, newsletters, technical blogs, and literary curation.'
  }
};

const DEPT_ORDER = [
  'Info-Tech',
  'Technical',
  'Research',
  'Events',
  'Operations',
  'Publicity',
  'Creatives',
  'Marketing',
  'Editorial'
];

export const COCOM_DEPARTMENTS = DEPT_ORDER
  .filter((deptName) => Boolean(cocomJson[deptName]))
  .map((deptName) => {
    const meta = COCOM_DEPT_META[deptName] || {
      id: deptName.toLowerCase(),
      color: '#00D8FF',
      accentRgb: '0, 216, 255'
    };
    return {
      name: deptName,
      ...meta,
      members: cocomJson[deptName],
      count: cocomJson[deptName].length
    };
  });


// Flat list of members with all their associated departments
const memberMap = new Map();
Object.entries(cocomJson).forEach(([deptName, members]) => {
  members.forEach((name) => {
    const trimmed = name.trim();
    if (!memberMap.has(trimmed)) {
      memberMap.set(trimmed, {
        name: trimmed,
        departments: [deptName]
      });
    } else {
      memberMap.get(trimmed).departments.push(deptName);
    }
  });
});

export const ALL_COCOM_MEMBERS = Array.from(memberMap.values()).sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const COCOM_RAW = cocomJson;
