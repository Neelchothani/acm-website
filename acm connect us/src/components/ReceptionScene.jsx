import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ReceptionScene({ isHidden, onCheckIn }) {
  return (
    <div
      className={`intro-scene ${isHidden ? 'hide' : ''}`}
      id="introScene"
      style={isHidden ? { display: 'none' } : undefined}
    >
      {/* Top Floating Action Header */}
      <div className="scene-top-controls">
        <div className="scene-badge">
          <span className="status-dot"></span>
          <span>Digital Concierge • Reception Desk</span>
        </div>
        <button
          className="skip-btn"
          onClick={onCheckIn}
          title="Directly access the check-in form"
        >
          <span>Quick Check-In</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="scene-inner">
        {/* Top Pan: Reception & City Skyline */}
        <div className="scene-top">
          <div aria-hidden="true" className="skyline">
            <svg preserveAspectRatio="xMidYMax slice" viewBox="0 0 1200 500">
<defs>
<linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#0d1230" stopOpacity="0"></stop>
<stop offset="100%" stopColor="#0d1230" stopOpacity="1"></stop>
</linearGradient>
</defs>
<g fill="#141b40">
<rect height="320" width="70" x="40" y="180"></rect>
<rect height="380" width="55" x="130" y="120"></rect>
<rect height="280" width="90" x="205" y="220"></rect>
<rect height="410" width="60" x="320" y="90"></rect>
<rect height="340" width="80" x="400" y="160"></rect>
<rect height="440" width="50" x="510" y="60"></rect>
<rect height="300" width="100" x="590" y="200"></rect>
<rect height="370" width="65" x="720" y="130"></rect>
<rect height="270" width="85" x="810" y="230"></rect>
<rect height="420" width="55" x="920" y="80"></rect>
<rect height="330" width="90" x="1000" y="170"></rect>
<rect height="400" width="60" x="1110" y="100"></rect>
</g>
<g fill="#33e7ff" opacity="0.5">
<rect height="10" width="6" x="55" y="200"></rect>
<rect height="10" width="6" x="70" y="230"></rect>
<rect height="10" width="6" x="150" y="150"></rect>
<rect height="10" width="6" x="330" y="120"></rect>
<rect height="10" width="6" x="420" y="190"></rect>
<rect height="10" width="6" x="530" y="100"></rect>
<rect height="10" width="6" x="610" y="240"></rect>
<rect height="10" width="6" x="735" y="160"></rect>
<rect height="10" width="6" x="825" y="260"></rect>
<rect height="10" width="6" x="935" y="120"></rect>
<rect height="10" width="6" x="1020" y="200"></rect>
</g>
<g fill="#b14bff" opacity="0.45">
<rect height="10" width="6" x="95" y="260"></rect>
<rect height="10" width="6" x="220" y="270"></rect>
<rect height="10" width="6" x="440" y="240"></rect>
<rect height="10" width="6" x="650" y="250"></rect>
<rect height="10" width="6" x="860" y="300"></rect>
<rect height="10" width="6" x="1050" y="230"></rect>
<rect height="10" width="6" x="1140" y="150"></rect>
</g>
<rect fill="url(#fade)" height="500" width="1200" x="0" y="0"></rect>
</svg>
          </div>

          <div aria-hidden="false" className="desk-layer">
            <svg preserveAspectRatio="xMidYMax meet" viewBox="0 -560 1600 900">
<defs>
<linearGradient id="marble" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#1a2150"></stop>
<stop offset="100%" stopColor="#0a0e24"></stop>
</linearGradient>
<linearGradient id="counterTop" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#242b5e"></stop>
<stop offset="100%" stopColor="#171d47"></stop>
</linearGradient>
<linearGradient id="edge" x1="0" x2="1" y1="0" y2="0">
<stop offset="0%" stopColor="#b14bff" stopOpacity="0.95"></stop>
<stop offset="50%" stopColor="#33e7ff" stopOpacity="0.9"></stop>
<stop offset="100%" stopColor="#b14bff" stopOpacity="0.95"></stop>
</linearGradient>
<linearGradient id="alienBody" x1="0" x2="1" y1="0" y2="1">
<stop offset="0%" stopColor="#d7f3e8"></stop>
<stop offset="30%" stopColor="#6fd0c4"></stop>
<stop offset="65%" stopColor="#2f8f95"></stop>
<stop offset="100%" stopColor="#123f52"></stop>
</linearGradient>
<linearGradient id="alienShade" x1="0" x2="1" y1="0" y2="0">
<stop offset="0%" stopColor="#000000" stopOpacity="0.3"></stop>
<stop offset="45%" stopColor="#000000" stopOpacity="0"></stop>
<stop offset="100%" stopColor="#000000" stopOpacity="0.35"></stop>
</linearGradient>
<linearGradient id="butlerShell" x1="0" x2="1" y1="0" y2="1">
<stop offset="0%" stopColor="#f7fdff"></stop>
<stop offset="38%" stopColor="#d6e2ea"></stop>
<stop offset="72%" stopColor="#8c9cac"></stop>
<stop offset="100%" stopColor="#39465c"></stop>
</linearGradient>
<linearGradient id="butlerArm" x1="0" x2="1" y1="0" y2="0">
<stop offset="0%" stopColor="#526176"></stop>
<stop offset="45%" stopColor="#e7f1f5"></stop>
<stop offset="100%" stopColor="#7c8b9c"></stop>
</linearGradient>
<linearGradient id="butlerDark" x1="0" x2="1" y1="0" y2="1">
<stop offset="0%" stopColor="#27334c"></stop>
<stop offset="100%" stopColor="#080d1f"></stop>
</linearGradient>
<radialGradient cx="50%" cy="45%" id="butlerHalo" r="55%">
<stop offset="0%" stopColor="#33e7ff" stopOpacity="0.32"></stop>
<stop offset="55%" stopColor="#b14bff" stopOpacity="0.12"></stop>
<stop offset="100%" stopColor="#33e7ff" stopOpacity="0"></stop>
</radialGradient>
<filter height="260%" id="cyanGlow" width="260%" x="-80%" y="-80%">
<feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
<feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
</filter>
<radialGradient cx="50%" cy="50%" id="glow" r="50%">
<stop offset="0%" stopColor="#33e7ff" stopOpacity="1"></stop>
<stop offset="100%" stopColor="#33e7ff" stopOpacity="0"></stop>
</radialGradient>
<radialGradient cx="50%" cy="50%" id="headGlow" r="50%">
<stop offset="0%" stopColor="#33e7ff" stopOpacity="0.28"></stop>
<stop offset="100%" stopColor="#33e7ff" stopOpacity="0"></stop>
</radialGradient>
<radialGradient cx="35%" cy="30%" id="eyeShine" r="60%">
<stop offset="0%" stopColor="#5fefff" stopOpacity="0.9"></stop>
<stop offset="35%" stopColor="#0b0f1e" stopOpacity="1"></stop>
<stop offset="100%" stopColor="#0b0f1e" stopOpacity="1"></stop>
</radialGradient>
<linearGradient id="pillarBody" x1="0" x2="1" y1="0" y2="0">
<stop offset="0%" stopColor="#171d47"></stop>
<stop offset="50%" stopColor="#232a5c"></stop>
<stop offset="100%" stopColor="#171d47"></stop>
</linearGradient>
<radialGradient cx="35%" cy="30%" id="eyeOrb" r="65%">
<stop offset="0%" stopColor="#fff9d8"></stop>
<stop offset="45%" stopColor="#ffcf3c"></stop>
<stop offset="100%" stopColor="#8a6a10"></stop>
</radialGradient>
</defs>
<ellipse cx="600" cy="180" fill="url(#glow)" opacity="0.3" rx="340" ry="90"></ellipse>
{/*  */}
<g id="windowGroup">
<defs>
<clipPath id="windowClip">
<rect height="750" rx="8" width="1440" x="80" y="-560"></rect>
</clipPath>
<linearGradient id="windowFrameGrad" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#3a4380"></stop>
<stop offset="100%" stopColor="#1a2050"></stop>
</linearGradient>
</defs>
{/*  */}
<rect fill="url(#windowFrameGrad)" height="776" opacity="0.9" rx="10" stroke="#33e7ff" strokeWidth="1.5" width="1466" x="67" y="-573"></rect>
<rect fill="none" height="776" opacity="0.35" rx="10" stroke="#b14bff" strokeWidth="1" width="1466" x="67" y="-573"></rect>
          <g clipPath="url(#windowClip)">
            <image
              height="750"
              width="1440"
              x="80"
              y="-560"
              href="/city-window.png"
              preserveAspectRatio="xMidYMid slice"
            />
<rect fill="url(#glow)" height="750" opacity="0.08" width="1440" x="80" y="-560"></rect>
<rect fill="#0d1230" height="750" opacity="0.12" width="960" x="120" y="-560"></rect>
</g>
{/*  */}
<defs>
<linearGradient id="hotelFrameGrad" x1="0" x2="1" y1="0" y2="0">
<stop offset="0%" stopColor="#111735"></stop>
<stop offset="22%" stopColor="#2a3268"></stop>
<stop offset="50%" stopColor="#151a40"></stop>
<stop offset="78%" stopColor="#2a3268"></stop>
<stop offset="100%" stopColor="#111735"></stop>
</linearGradient>
<linearGradient id="curtainPurple" x1="0" x2="1" y1="0" y2="0">
<stop offset="0%" stopColor="#32105f"></stop>
<stop offset="22%" stopColor="#7d21c8"></stop>
<stop offset="45%" stopColor="#c44cff"></stop>
<stop offset="62%" stopColor="#7219bd"></stop>
<stop offset="82%" stopColor="#a936ed"></stop>
<stop offset="100%" stopColor="#250b4d"></stop>
</linearGradient>
<linearGradient id="curtainEdgeGlow" x1="0" x2="1" y1="0" y2="0">
<stop offset="0%" stopColor="#a735ff" stopOpacity="0"></stop>
<stop offset="50%" stopColor="#e16cff" stopOpacity="1"></stop>
<stop offset="100%" stopColor="#a735ff" stopOpacity="0"></stop>
</linearGradient>
<filter height="140%" id="purpleGlow" width="220%" x="-60%" y="-20%">
<feGaussianBlur result="blur" stdDeviation="5"></feGaussianBlur>
<feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
</filter>
</defs>
{/*  */}
<rect fill="#090b22" height="780" opacity="0.9" rx="12" width="185" x="55" y="-582"></rect>
<rect fill="#090b22" height="780" opacity="0.9" rx="12" width="185" x="1360" y="-582"></rect>
{/*  */}
<rect fill="none" height="750" rx="8" stroke="#0b1030" strokeWidth="6" width="1440" x="80" y="-560"></rect>
<rect fill="none" height="750" opacity="0.5" rx="8" stroke="#33e7ff" strokeWidth="1" width="1440" x="80" y="-560"></rect>
{/*  */}
<line opacity="0.85" stroke="#0b1030" strokeWidth="5" x1="800" x2="800" y1="-560" y2="190"></line>
<line opacity="0.6" stroke="#0b1030" strokeWidth="3" x1="440" x2="440" y1="-560" y2="190"></line>
<line opacity="0.6" stroke="#0b1030" strokeWidth="3" x1="1160" x2="1160" y1="-560" y2="190"></line>
<line opacity="0.85" stroke="#0b1030" strokeWidth="5" x1="80" x2="1520" y1="-185" y2="-185"></line>
<line opacity="0.6" stroke="#0b1030" strokeWidth="5" x1="80" x2="1520" y1="190" y2="190"></line>
{/*  */}
<ellipse cx="800" cy="190" fill="url(#glow)" opacity="0.15" rx="540" ry="40"></ellipse>
{/*  */}
{/*  */}
<g id="hotelWindowFrame">
<rect fill="url(#hotelFrameGrad)" height="32" rx="7" stroke="#4b5797" strokeWidth="2" width="1490" x="55" y="-585"></rect>
<rect fill="#b84cff" filter="url(#purpleGlow)" height="4" opacity="0.85" rx="2" width="1490" x="55" y="-585"></rect>
<rect fill="url(#hotelFrameGrad)" height="775" rx="7" stroke="#4b5797" strokeWidth="2" width="30" x="55" y="-575"></rect>
<rect fill="url(#hotelFrameGrad)" height="775" rx="7" stroke="#4b5797" strokeWidth="2" width="30" x="1515" y="-575"></rect>
<rect fill="url(#hotelFrameGrad)" height="22" rx="5" stroke="#4b5797" strokeWidth="2" width="1490" x="55" y="182"></rect>
<rect fill="#33e7ff" height="4" opacity="0.38" width="1470" x="65" y="187"></rect>
</g>
{/*  */}
<g id="neonCurtains">
{/*  */}
<path d="M8 -580 C35 -525 30 -455 42 -390 C54 -325 38 -250 50 -180 C61 -110 43 -35 54 35 C62 88 58 145 48 198 L142 198 C128 135 131 76 126 20 C120 -55 137 -125 127 -195 C117 -270 135 -340 124 -410 C114 -480 122 -535 142 -580 Z" fill="url(#curtainPurple)" opacity="0.97"></path>
<path d="M28 -575 C55 -480 47 -390 61 -300 C75 -205 55 -120 70 -30 C78 30 70 105 68 195
           M67 -575 C90 -470 76 -375 91 -285 C105 -195 87 -105 101 -15 C110 45 98 120 96 195
           M108 -575 C122 -470 105 -370 118 -275 C128 -185 113 -95 123 -5 C129 55 119 130 120 195" fill="none" stroke="#df73ff" strokeOpacity="0.5" strokeWidth="6"></path>
<path d="M126 -575 C112 -430 139 -300 126 -165 C117 -70 138 65 124 195" fill="none" filter="url(#purpleGlow)" stroke="url(#curtainEdgeGlow)" strokeWidth="7"></path>
{/*  */}
<path d="M1458 -580 C1478 -525 1486 -480 1476 -410 C1465 -340 1483 -270 1473 -195 C1463 -125 1480 -55 1474 20 C1469 76 1472 135 1458 198 L1552 198 C1542 145 1538 88 1546 35 C1557 -35 1539 -110 1550 -180 C1562 -250 1546 -325 1558 -390 C1570 -455 1565 -525 1592 -580 Z" fill="url(#curtainPurple)" opacity="0.97"></path>
<path d="M1492 -575 C1505 -470 1488 -370 1501 -275 C1511 -185 1495 -95 1505 -5 C1511 55 1501 130 1500 195
           M1533 -575 C1548 -470 1535 -375 1549 -285 C1563 -195 1545 -105 1559 -15 C1568 45 1560 120 1564 195
           M1572 -575 C1586 -480 1578 -390 1592 -300 C1606 -205 1590 -120 1604 -30 C1612 30 1604 105 1608 195" fill="none" stroke="#df73ff" strokeOpacity="0.5" strokeWidth="6"></path>
<path d="M1474 -575 C1488 -430 1461 -300 1474 -165 C1483 -70 1462 65 1476 195" fill="none" filter="url(#purpleGlow)" stroke="url(#curtainEdgeGlow)" strokeWidth="7"></path>
</g>
</g>
      <g id="butlerGroup" onClick={onCheckIn} style={{ cursor: 'pointer' }} transform="translate(800,0)">
        {/* futuristic hotel-service robot butler */}
        {/* soft cyan halo behind the head */}
        <path d="M-27 -66 Q0 -72 27 -66" fill="none" filter="url(#cyanGlow)" opacity="0.9" stroke="#33e7ff" strokeWidth="2.2"></path>
        <rect fill="#b14bff" filter="url(#purpleGlow)" height="2" opacity="0.75" rx="1" width="36" x="-18" y="-45"></rect>
        <ellipse cx="0" cy="-48" fill="url(#butlerHalo)" opacity="0.55" rx="78" ry="94"></ellipse>
        {/* serious dark face visor with restrained service indicators */}
        <rect fill="url(#butlerShell)" height="132" rx="43" stroke="#d9f8ff" strokeWidth="2.5" width="96" x="-48" y="-122"></rect>
<rect fill="#070b18" height="92" opacity="0.98" rx="35" stroke="#33e7ff" strokeWidth="1.6" width="80" x="-40" y="-105"></rect>





{/*  */}
<rect fill="#151d3c" height="15" rx="7" stroke="#33e7ff" strokeWidth="1.5" width="24" x="-12" y="-139"></rect>
<circle cx="0" cy="-132" fill="#b14bff" filter="url(#purpleGlow)" r="3"></circle>
{/*  */}
<rect fill="url(#butlerDark)" height="38" rx="12" stroke="#33e7ff" strokeWidth="1.5" width="36" x="-18" y="7"></rect>
{/*  */}
<path d="M-69 43 Q-57 30 -38 31 L38 31 Q57 30 69 43 L83 218 Q78 254 48 260 L-48 260 Q-78 254 -83 218 Z" fill="url(#butlerShell)" stroke="#d9f8ff" strokeWidth="2.2"></path>
<path d="M-69 44 Q0 61 69 44 L74 92 Q0 108 -74 92 Z" fill="#151d3c" opacity="0.8"></path>
{/*  */}
<path d="M-37 45 L-8 89 L-28 142 L-57 61 Z" fill="#11182f" stroke="#33e7ff" strokeWidth="1.4"></path>
<path d="M37 45 L8 89 L28 142 L57 61 Z" fill="#11182f" stroke="#b14bff" strokeWidth="1.4"></path>
<path d="M0 86 L0 243" stroke="#26345f" strokeWidth="2"></path>
{/*  */}
<path d="M-30 78 L-4 88 L-26 103 L-43 91 Z" fill="#b14bff" filter="url(#purpleGlow)" opacity="0.9"></path>
<path d="M30 78 L4 88 L26 103 L43 91 Z" fill="#33e7ff" filter="url(#cyanGlow)" opacity="0.9"></path>
<circle cx="0" cy="91" fill="#0b1030" r="7" stroke="#d9f8ff" strokeWidth="1.5"></circle>
{/*  */}
<circle cx="0" cy="155" fill="#0a1027" r="35" stroke="#33e7ff" strokeWidth="2"></circle>
<circle cx="0" cy="155" fill="none" opacity="0.85" r="27" stroke="#b14bff" strokeWidth="1.5"></circle>
<path d="M-17 155 L-7 155 L-2 143 L7 168 L13 155 L18 155" fill="none" stroke="#33e7ff" strokeWidth="2"></path>
<text fill="#8eefff" fontFamily="Rajdhani, sans-serif" fontSize="8" letterSpacing="1.5" textAnchor="middle" x="0" y="191">CITY SERVICE</text>
{/*  */}
<ellipse cx="-78" cy="58" fill="url(#butlerShell)" rx="27" ry="35" stroke="#d9f8ff" strokeWidth="2"></ellipse>
<ellipse cx="78" cy="58" fill="url(#butlerShell)" rx="27" ry="35" stroke="#d9f8ff" strokeWidth="2"></ellipse>
{/*  */}
<path d="M-91 77 Q-111 112 -108 153 L-101 207" fill="none" stroke="url(#butlerArm)" strokeLinecap="round" strokeWidth="27"></path>
<path d="M91 77 Q111 112 108 153 L101 207" fill="none" stroke="url(#butlerArm)" strokeLinecap="round" strokeWidth="27"></path>
<path d="M-100 113 L-115 116 M100 113 L115 116" opacity="0.75" stroke="#33e7ff" strokeWidth="3"></path>
<circle cx="-105" cy="155" fill="#151d3c" r="13" stroke="#b14bff" strokeWidth="2"></circle>
<circle cx="105" cy="155" fill="#151d3c" r="13" stroke="#33e7ff" strokeWidth="2"></circle>
{/*  */}
<path d="M-101 205 Q-119 218 -119 241 Q-118 255 -105 259 Q-91 255 -91 240 L-92 216" fill="url(#butlerDark)" stroke="#d9f8ff" strokeWidth="1.8"></path>
<path d="M101 205 Q119 218 119 241 Q118 255 105 259 Q91 255 91 240 L92 216" fill="url(#butlerDark)" stroke="#d9f8ff" strokeWidth="1.8"></path>
<path d="M-111 235 L-96 235 M111 235 L96 235" opacity="0.7" stroke="#33e7ff" strokeWidth="2"></path>
{/*  */}
<path d="M-55 212 Q0 224 55 212" fill="none" stroke="#26345f" strokeWidth="2"></path>
<path d="M-54 224 Q0 236 54 224" fill="none" opacity="0.5" stroke="#b14bff" strokeWidth="1.3"></path>
</g>
<rect fill="url(#marble)" height="150" width="1600" x="0" y="190"></rect>
<path d="M0 190 L1200 190 L1150 175 L50 175 Z" fill="url(#counterTop)"></path>
<rect fill="url(#edge)" height="5" opacity="0.9" width="1600" x="0" y="188"></rect>
<path d="M50 175 L1550 175" opacity="0.6" stroke="url(#edge)" strokeWidth="2"></path>
<g opacity="0.6" stroke="#2a2f5c" strokeWidth="1.5">
<line x1="200" x2="200" y1="195" y2="340"></line>
<line x1="560" x2="560" y1="195" y2="340"></line>
<line x1="1040" x2="1040" y1="195" y2="340"></line>
<line x1="1400" x2="1400" y1="195" y2="340"></line>
</g>
<rect fill="#0b1030" height="26" opacity="0.85" rx="4" stroke="#33e7ff" strokeWidth="1" width="160" x="720" y="205"></rect>
<text fill="#33e7ff" fontFamily="Rajdhani, sans-serif" fontSize="12" letterSpacing="2" textAnchor="middle" x="800" y="222">FRONT DESK</text>
</svg>
          </div>
        </div>

        {/* Bottom Pan: Neon Runway Carpet */}
        <div className="scene-bottom">
          <div aria-hidden="true" className="carpet-layer">
            <svg preserveAspectRatio="xMidYMin slice" viewBox="0 0 1600 900">
<defs>
<linearGradient id="carpetBase" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#1b1044"></stop>
<stop offset="100%" stopColor="#0d0824"></stop>
</linearGradient>
<linearGradient id="carpetPath" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#4a1f8f"></stop>
<stop offset="100%" stopColor="#22104f"></stop>
</linearGradient>
<linearGradient id="floorPanel" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#101b45"></stop>
<stop offset="100%" stopColor="#080d25"></stop>
</linearGradient>
<filter height="200%" id="floorGlow" width="200%" x="-50%" y="-50%">
<feGaussianBlur result="blur" stdDeviation="4"></feGaussianBlur>
<feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
</filter>
</defs>
<rect fill="url(#carpetBase)" height="900" width="1600" x="0" y="0"></rect>
{/*  */}
<g fill="url(#floorPanel)" opacity="0.9" stroke="#243064" strokeWidth="2">
<path d="M0 0 H520 L430 900 H0 Z"></path>
<path d="M1080 0 H1600 V900 H1170 Z"></path>
<path d="M520 0 H680 L590 900 H430 Z"></path>
<path d="M920 0 H1080 L1170 900 H1010 Z"></path>
</g>
{/*  */}
<g fill="none" opacity="0.75" stroke="#26366f" strokeWidth="2">
<path d="M0 170 H505"></path><path d="M0 360 H485"></path><path d="M0 575 H465"></path><path d="M0 790 H445"></path>
<path d="M1095 170 H1600"></path><path d="M1115 360 H1600"></path><path d="M1135 575 H1600"></path><path d="M1155 790 H1600"></path>
<path d="M190 0 L95 900"></path><path d="M370 0 L300 900"></path>
<path d="M1410 0 L1505 900"></path><path d="M1230 0 L1300 900"></path>
</g>
{/*  */}
<polygon fill="url(#carpetPath)" points="680,0 920,0 1280,900 320,900"></polygon>
<polygon fill="none" opacity="0.55" points="680,0 920,0 1280,900 320,900" stroke="#b14bff" strokeWidth="4"></polygon>
{/*  */}
<g fill="none" filter="url(#floorGlow)" strokeLinecap="round">
<path d="M680 0 L560 300 L625 390 L500 560 L585 650 L450 900" opacity="0.9" stroke="#33e7ff" strokeWidth="4"></path>
<path d="M920 0 L1040 300 L975 390 L1100 560 L1015 650 L1150 900" opacity="0.85" stroke="#b14bff" strokeWidth="4"></path>
<path d="M745 0 L700 250 L755 320 L680 455 L735 525 L670 650 L720 715 L650 900" opacity="0.55" stroke="#33e7ff" strokeWidth="2"></path>
<path d="M855 0 L900 250 L845 320 L920 455 L865 525 L930 650 L880 715 L950 900" opacity="0.55" stroke="#d35cff" strokeWidth="2"></path>
</g>
{/*  */}
<g fill="none" opacity="0.7" strokeWidth="3">
<path d="M650 115 L950 115 L965 155 L635 155 Z" stroke="#33e7ff"></path>
<path d="M600 255 L1000 255 L1018 300 L582 300 Z" stroke="#b14bff"></path>
<path d="M535 430 L1065 430 L1088 485 L512 485 Z" stroke="#33e7ff"></path>
<path d="M455 640 L1145 640 L1170 705 L430 705 Z" stroke="#b14bff"></path>
</g>
{/*  */}
<g fill="#33e7ff" filter="url(#floorGlow)">
<circle cx="800" cy="120" r="5"></circle><circle cx="800" cy="280" r="6"></circle><circle cx="800" cy="455" r="7"></circle><circle cx="800" cy="665" r="8"></circle>
</g>
<g fill="none" opacity="0.7" stroke="#33e7ff" strokeWidth="2">
<circle cx="800" cy="120" r="13"></circle><circle cx="800" cy="280" r="16"></circle><circle cx="800" cy="455" r="20"></circle><circle cx="800" cy="665" r="25"></circle>
</g>
{/*  */}
<g opacity="0.35" stroke="#b14bff" strokeWidth="2">
<line x1="620" x2="980" y1="135" y2="135"></line>
<line x1="550" x2="1050" y1="270" y2="270"></line>
<line x1="460" x2="1140" y1="430" y2="430"></line>
<line x1="320" x2="880" y1="540" y2="540"></line>
<line x1="260" x2="940" y1="700" y2="700"></line>
</g>
{/*  */}
<g fill="#33e7ff" opacity="0.12" stroke="#33e7ff" strokeWidth="1">
<path d="M55 55 H165 V145 H45 Z"></path><path d="M1050 55 H1160 L1170 145 H1040 Z"></path>
<path d="M25 300 H130 L120 390 H15 Z"></path><path d="M1090 300 H1195 L1205 390 H1080 Z"></path>
<path d="M0 555 H105 L95 650 H0 Z"></path><path d="M1110 555 H1215 L1225 650 H1105 Z"></path>
</g>
{/*  */}
<g fill="none" opacity="0.5" stroke="#b14bff" strokeWidth="3">
<path d="M70 180 H155 V225 H210"></path><path d="M1530 180 H1445 V225 H1390"></path>
<path d="M35 735 H145 V690 H205"></path><path d="M1565 735 H1455 V690 H1395"></path>
</g>
</svg>
          </div>
        </div>
      </div>

      {/* Tap Hint */}
      <div className="tap-hint">
        <div className="hint-pill">
          <Sparkles size={16} />
          <span>TAP THE RECEPTIONIST TO CHECK IN</span>
        </div>
      </div>
    </div>
  );
}
