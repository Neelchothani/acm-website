import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ImageSequenceEngine } from './engine/ImageSequenceEngine.js';
import { BuildingEntryEngine } from './engine/BuildingEntryEngine.js';
import { ScrollController } from './engine/ScrollController.js';
import { CityCanvas } from './components/CityCanvas.jsx';
import { ENGINE_CONFIG } from './config/cityTimeline.js';
import './App.css';

const BUILDINGS = {
  research: { id: 'research', title: 'Research Building 06', streetFrame: 300, framesDir: '/frames_research' },
  events: { id: 'events', title: 'Events Building 07', streetFrame: 300, framesDir: '/frames_events' },
  connect: { id: 'connect', title: 'Connect Satellite Hub', streetFrame: 570, framesDir: '/frames_connect' },
  editorial: { id: 'editorial', title: 'Editorial Digital Library', streetFrame: 570, framesDir: '/frames_editorial' },
  headquarters: { id: 'headquarters', title: 'ACM Headquarters & Celestial Core', streetFrame: 839, framesDir: '/frames_headquarters' }
};

export function App() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const buildingEnginesRef = useRef({});
  const scrollControllerRef = useRef(null);

  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    stage: 'loading',
    progress: 0,
    error: null
  });

  const [currentCityFrame, setCurrentCityFrame] = useState(0);
  const [viewMode, setViewMode] = useState('city'); // 'city' | 'entering' | 'inside' | 'exiting'
  const [activeBuildingId, setActiveBuildingId] = useState(null);

  const savedScrollYRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    // 1. City Frame Engine
    const engine = new ImageSequenceEngine({
      totalFrames: ENGINE_CONFIG.totalFrames,
      framesDir: ENGINE_CONFIG.framesDir,
      onProgress: ({ progress }) => {
        if (!isMounted) return;
        const pct = Math.round(progress * 100);
        setLoadingState((prev) => ({ ...prev, progress: pct }));
        // Report real progress to parent root shell
        window.parent.postMessage({ type: 'loadingProgress', progress: pct }, '*');
      },
      onError: (err) => {
        if (!isMounted) return;
        setLoadingState((prev) => ({ ...prev, isLoading: false, error: err.message }));
      }
    });

    engine.setCanvas(canvasRef.current);
    engineRef.current = engine;

    // 2. Initialize all 4 Building Entry Engines
    const engines = {};
    Object.values(BUILDINGS).forEach((b) => {
      const bEngine = new BuildingEntryEngine({
        totalFrames: 240,
        framesDir: b.framesDir
      });
      bEngine.setCanvas(canvasRef.current);
      engines[b.id] = bEngine;
    });
    buildingEnginesRef.current = engines;

    // Initialize City Frames
    engine.init().then((success) => {
      if (!isMounted || !success) return;

      setLoadingState({ isLoading: false, stage: 'ready', progress: 100, error: null });
      // Notify parent root shell that city frames initial buffer is loaded and ready
      window.parent.postMessage({ type: 'loadingProgress', progress: 100 }, '*');
      window.parent.postMessage({ type: 'cityReady' }, '*');
      engine.requestFrame(0);

      const sc = new ScrollController({
        totalFrames: ENGINE_CONFIG.totalFrames,
        snapTargets: ENGINE_CONFIG.departmentFrames,
        snapThreshold: ENGINE_CONFIG.snapFrameThreshold,
        onFrameChange: (frame) => {
          if (!isMounted) return;
          setCurrentCityFrame(frame);
          if (viewMode === 'city') {
            engine.requestFrame(frame);
          }
        }
      });

      scrollControllerRef.current = sc;
      sc.init();
    });

    return () => {
      isMounted = false;
      engineRef.current?.destroy();
      Object.values(buildingEnginesRef.current).forEach((e) => e.destroy());
      scrollControllerRef.current?.destroy();
    };
  }, []);

  // Enter a Building
  const handleEnterBuilding = useCallback((buildingId) => {
    const building = BUILDINGS[buildingId];
    const bEngine = buildingEnginesRef.current[buildingId];
    if (viewMode !== 'city' || !building || !bEngine) return;

    const targetY = scrollControllerRef.current?.getScrollYForFrame(building.streetFrame) ?? window.scrollY;
    savedScrollYRef.current = targetY;
    window.scrollTo(0, targetY);

    const cityBitmap = engineRef.current?.getBitmap(building.streetFrame) || engineRef.current?.getBitmap(currentCityFrame);

    setActiveBuildingId(buildingId);
    setViewMode('entering');

    bEngine.playForward({
      duration: 4500,
      cityBitmap,
      onComplete: () => {
        setViewMode('inside');
        // Signal the root shell to navigate to the section page
        // The zoom animation has played — now transition the root to the section iframe
        window.parent.postMessage({ type: 'navigate', section: buildingId }, '*');
      }
    });
  }, [viewMode, currentCityFrame]);

  // Exit Current Building back to City Street (internal — used for scroll/key exit)
  const handleExitBuilding = useCallback(() => {
    if (viewMode !== 'inside' || !activeBuildingId) return;

    const building = BUILDINGS[activeBuildingId];
    const bEngine = buildingEnginesRef.current[activeBuildingId];
    if (!building || !bEngine) return;

    const cityBitmap = engineRef.current?.getBitmap(building.streetFrame);
    setViewMode('exiting');

    bEngine.playReverse({
      duration: 3500,
      cityBitmap,
      onComplete: () => {
        const returnY = savedScrollYRef.current || scrollControllerRef.current?.getScrollYForFrame(building.streetFrame) || 0;
        window.scrollTo(0, returnY);
        setViewMode('city');
        setActiveBuildingId(null);
        engineRef.current?.requestFrame(building.streetFrame);
      }
    });
  }, [viewMode, activeBuildingId]);

  // Listen for 'reset' message from root shell (user returned from a section)
  useEffect(() => {
    const handleParentMessage = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'reset') {
        // If we're in 'inside' view, play the exit animation back to city
        if (viewMode === 'inside' && activeBuildingId) {
          handleExitBuilding();
        } else if (viewMode === 'entering') {
          // Mid-animation: just reset state
          setViewMode('city');
          setActiveBuildingId(null);
          if (engineRef.current && currentCityFrame >= 0) {
            engineRef.current.requestFrame(currentCityFrame);
          }
        }
      }
    };
    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, [viewMode, activeBuildingId, handleExitBuilding, currentCityFrame]);

  // Prevent scroll drift while inside or transitioning
  useEffect(() => {
    if (viewMode === 'city') return;

    const lockScroll = () => {
      if (savedScrollYRef.current) {
        window.scrollTo(0, savedScrollYRef.current);
      }
    };

    window.addEventListener('scroll', lockScroll, { passive: true });
    return () => window.removeEventListener('scroll', lockScroll);
  }, [viewMode]);

  // Scroll in any direction / gesture / Escape to exit building back to street
  useEffect(() => {
    if (viewMode !== 'inside') return;

    let touchStartY = null;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 6 || Math.abs(e.deltaX) > 6) {
        handleExitBuilding();
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (touchStartY === null || e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      if (Math.abs(currentY - touchStartY) > 30) {
        touchStartY = null;
        handleExitBuilding();
      }
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'Escape' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'PageUp' ||
        e.key === 'PageDown' ||
        e.key === ' '
      ) {
        handleExitBuilding();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode, handleExitBuilding]);

  // Active view zone detections on street level
  const isSector02InView = viewMode === 'city' && currentCityFrame >= 200 && currentCityFrame <= 400; // Research & Events
  const isSector03InView = viewMode === 'city' && currentCityFrame >= 470 && currentCityFrame <= 670; // Connect & Editorial
  const isCoreInView = viewMode === 'city' && currentCityFrame >= 720; // ACM Headquarters & Celestial Core

  return (
    <div className={`acm-app mode-${viewMode}`}>
      {loadingState.isLoading && window.self === window.top && (
        <div className="loading-screen">
          <div className="loading-card">
            <div className="loading-logo-glow"></div>
            <h1 className="loading-title">ACM CITY</h1>
            <p className="loading-subtitle">Initializing cinematic stream...</p>
            <div className="loading-bar-track">
              <div
                className="loading-bar-fill"
                style={{ width: `${Math.max(5, loadingState.progress)}%` }}
              />
            </div>
            <div className="loading-meta">
              <span>STREAM</span>
              <span>{loadingState.progress}%</span>
            </div>
          </div>
        </div>
      )}

      {loadingState.error && (
        <div className="error-screen">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h2>Load Error</h2>
            <p>{loadingState.error}</p>
          </div>
        </div>
      )}

      <CityCanvas canvasRef={canvasRef} />

      {/* Sector 02 Click Targets: Frame ~300 */}
      {isSector02InView && (
        <>
          {/* Research Building (Left Side) */}
          <div
            className="building-click-zone left-side-click-zone"
            onClick={() => handleEnterBuilding('research')}
            title="Research Building 06"
          />
          {/* Events Building (Right Side) */}
          <div
            className="building-click-zone right-side-click-zone"
            onClick={() => handleEnterBuilding('events')}
            title="Events Building 07"
          />
        </>
      )}

      {/* Sector 03 Click Targets: Frame ~570 */}
      {isSector03InView && (
        <>
          {/* Connect Building (Left Side) */}
          <div
            className="building-click-zone left-side-click-zone"
            onClick={() => handleEnterBuilding('connect')}
            title="Connect Hub"
          />
          {/* Editorial Building (Right Side) */}
          <div
            className="building-click-zone right-side-click-zone"
            onClick={() => handleEnterBuilding('editorial')}
            title="Editorial Building"
          />
        </>
      )}

      {/* Sector 04 Click Target: Frame ~839 (Headquarters & Celestial Core) */}
      {isCoreInView && (
        <div
          className="building-click-zone center-click-zone"
          onClick={() => handleEnterBuilding('headquarters')}
          title="ACM Headquarters & Celestial Core"
        />
      )}

      {/* Interior HUD (Exit control) when inside any building */}
      {viewMode === 'inside' && (
        <div className="interior-hud">
          <button className="interior-exit-btn" onClick={handleExitBuilding}>
            <span className="btn-icon">←</span>
            <span>RETURN TO STREET</span>
          </button>
        </div>
      )}

      {/* Main scroll track for city navigation */}
      <div
        className="scroll-track"
        style={{ height: `${ENGINE_CONFIG.scrollHeightVh}vh` }}
      />
    </div>
  );
}

export default App;
