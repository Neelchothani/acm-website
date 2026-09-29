export interface NetworkHub {
  id: string;
  name: string;
  city: string;
  country: string;
  location: [number, number]; // [lat, lon]
  role: string;
  tag: string;
  description: string;
  color: [number, number, number]; // RGB 0..1 for Cobe
  hexColor: string;
  size: number;
  isHome?: boolean;
}

export const GLOBAL_HUBS: NetworkHub[] = [
  {
    id: 'mumbai',
    name: 'ACM DJSCE',
    city: 'Mumbai',
    country: 'India',
    location: [19.1075, 72.8372],
    role: 'Flagship Student Chapter',
    tag: 'LOCAL CHAPTER',
    description: 'Premier engineering chapter driving hackathons, publications, technical initiatives & 120+ student leaders.',
    color: [0.0, 1.0, 0.95],
    hexColor: '#00F0FF',
    size: 0.08,
    isHome: true,
  },
  {
    id: 'newyork',
    name: 'ACM World HQ',
    city: 'New York',
    country: 'USA',
    location: [40.7128, -74.0060],
    role: 'Global Headquarters',
    tag: 'WORLD HQ',
    description: 'Association for Computing Machinery global headquarters. Founded in 1947, advancing computing as a science and profession.',
    color: [0.65, 0.45, 1.0],
    hexColor: '#A855F7',
    size: 0.055,
  },
  {
    id: 'sanfrancisco',
    name: 'Silicon Valley Hub',
    city: 'San Francisco',
    country: 'USA',
    location: [37.7749, -122.4194],
    role: 'ACM SIGGRAPH & CHI',
    tag: 'INNOVATION',
    description: 'Core research epicenter for human-computer interaction, graphics computing, and AI frontiers.',
    color: [0.35, 0.75, 1.0],
    hexColor: '#38BDF8',
    size: 0.05,
  },
  {
    id: 'london',
    name: 'ACM Europe Hub',
    city: 'London',
    country: 'UK',
    location: [51.5074, -0.1278],
    role: 'European Chapter Council',
    tag: 'EUROPE COUNCIL',
    description: 'Fosters computing research, academic symposiums, and cross-border tech initiatives across Europe.',
    color: [0.0, 0.85, 1.0],
    hexColor: '#06B6D4',
    size: 0.048,
  },
  {
    id: 'zurich',
    name: 'ETH Zurich ACM',
    city: 'Zurich',
    country: 'Switzerland',
    location: [47.3769, 8.5417],
    role: 'Continental Research Center',
    tag: 'RESEARCH',
    description: 'Pioneering systems architecture, distributed computing, cryptography, and theoretical computer science.',
    color: [0.2, 0.9, 0.6],
    hexColor: '#10B981',
    size: 0.045,
  },
  {
    id: 'tokyo',
    name: 'SIGGRAPH Asia',
    city: 'Tokyo',
    country: 'Japan',
    location: [35.6762, 139.6503],
    role: 'Asia-Pacific Tech Hub',
    tag: 'ASIA PACIFIC',
    description: 'Advanced robotics, computer vision, digital entertainment, and international computing symposia.',
    color: [1.0, 0.25, 0.75],
    hexColor: '#F43F5E',
    size: 0.05,
  },
  {
    id: 'singapore',
    name: 'NUS ACM Chapter',
    city: 'Singapore',
    country: 'Singapore',
    location: [1.3521, 103.8198],
    role: 'Southeast Asia Partner',
    tag: 'REGIONAL ALLIANCE',
    description: 'Top-tier Asian computing chapter partnering in student exchange, competitive programming, and ML.',
    color: [0.0, 0.95, 0.8],
    hexColor: '#14B8A6',
    size: 0.045,
  },
  {
    id: 'sydney',
    name: 'Sydney Computing Node',
    city: 'Sydney',
    country: 'Australia',
    location: [-33.8688, 151.2093],
    role: 'Oceania Research Hub',
    tag: 'OCEANIA',
    description: 'Connecting Australasian computing pioneers, quantum technology researchers, and student innovators.',
    color: [0.95, 0.75, 0.2],
    hexColor: '#F59E0B',
    size: 0.042,
  },
];

export interface NetworkArcData {
  from: [number, number];
  to: [number, number];
  color: [number, number, number];
}

export const NETWORK_ARCS: NetworkArcData[] = [
  { from: [19.1075, 72.8372], to: [40.7128, -74.0060], color: [0.0, 0.95, 1.0] }, // Mumbai -> New York
  { from: [19.1075, 72.8372], to: [51.5074, -0.1278], color: [0.0, 0.85, 1.0] },  // Mumbai -> London
  { from: [19.1075, 72.8372], to: [47.3769, 8.5417], color: [0.2, 0.9, 0.7] },   // Mumbai -> Zurich
  { from: [19.1075, 72.8372], to: [35.6762, 139.6503], color: [0.95, 0.3, 0.8] },// Mumbai -> Tokyo
  { from: [19.1075, 72.8372], to: [1.3521, 103.8198], color: [0.0, 0.95, 0.8] },  // Mumbai -> Singapore
  { from: [19.1075, 72.8372], to: [37.7749, -122.4194], color: [0.65, 0.45, 1.0] },// Mumbai -> SF
  { from: [19.1075, 72.8372], to: [-33.8688, 151.2093], color: [0.95, 0.7, 0.2] },// Mumbai -> Sydney
  { from: [40.7128, -74.0060], to: [51.5074, -0.1278], color: [0.4, 0.6, 1.0] }, // NY -> London
  { from: [37.7749, -122.4194], to: [35.6762, 139.6503], color: [0.7, 0.4, 0.9] }, // SF -> Tokyo
];
