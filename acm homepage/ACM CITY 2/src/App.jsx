import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ImageSequenceEngine } from './engine/ImageSequenceEngine.js';
import { ScrollController } from './engine/ScrollController.js';
import { CityCanvas } from './components/CityCanvas.jsx';
import { CloudTransition } from './components/CloudTransition.jsx';
import { ENGINE_CONFIG } from './config/cityTimeline.js';
import './App.css';

const BUILDINGS = {
  research: { id: 'research', title: 'Research Building 06', streetFrame: 300, focalOrigin: '28% 52%' },
  events: { id: 'events', title: 'Events Building 07', streetFrame: 300, focalOrigin: '72% 52%' },
  connect: { id: 'connect', title: 'Connect Satellite Hub', streetFrame: 570, focalOrigin: '28% 52%' },
  editorial: { id: 'editorial', title: 'Editorial Digital Library', streetFrame: 570, focalOrigin: '72% 52%' },
  headquarters: { id: 'headquarters', title: 'ACM Headquarters & Celestial Core', streetFrame: 899, focalOrigin: '50% 48%' }
};

export function App() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const scrollControllerRef = useRef(null);

  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    stage: 'loading',
    progress: 0,
    error: null
  });

  const [currentCityFrame, setCurrentCityFrame] = useState(0);
  const [viewMode, setViewMode] = useState('city'); // 'city' | 'entering' | 'inside'
  const [activeBuildingId, setActiveBuildingId] = useState(null);

  const [cloudState, setCloudState] = useState({
    isCovering: false,
    isExiting: false,
    buildingId: null,
    title: ''
  });

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
      scrollControllerRef.current?.destroy();
    };
  }, []);

  // Enter a Building with volumetric cloud sweep from both sides (~780ms)
  const handleEnterBuilding = useCallback((buildingId) => {
    const building = BUILDINGS[buildingId];
    if (cloudState.isCovering || cloudState.isExiting || !building) return;

    const targetY = scrollControllerRef.current?.getScrollYForFrame(building.streetFrame) ?? window.scrollY;
    savedScrollYRef.current = targetY;
    window.scrollTo(0, targetY);

    if (engineRef.current) {
      engineRef.current.requestFrame(building.streetFrame);
    }

    setActiveBuildingId(buildingId);
    setViewMode('entering');
    setCloudState({
      isCovering: true,
      isExiting: false,
      buildingId,
      title: building.title
    });

    // Clouds surge in from left & right, completely cloaking the screen at ~780ms
    setTimeout(() => {
      setViewMode('inside');
      window.parent.postMessage({ type: 'navigate', section: buildingId }, '*');
    }, 780);
  }, [cloudState.isCovering, cloudState.isExiting]);

  // Exit Current Building back to City Street: clouds part back outward
  const handleExitBuilding = useCallback(() => {
    setViewMode('city');
    setActiveBuildingId(null);
    setCloudState((prev) => ({
      ...prev,
      isCovering: false,
      isExiting: true
    }));

    if (engineRef.current && currentCityFrame >= 0) {
      engineRef.current.requestFrame(currentCityFrame);
    }

    // After clouds part back outward to the sides (750ms), reset state
    setTimeout(() => {
      setCloudState({
        isCovering: false,
        isExiting: false,
        buildingId: null,
        title: ''
      });
    }, 750);
  }, [currentCityFrame]);

  // Listen for 'reset' message from root shell (user returned from a section)
  useEffect(() => {
    const handleParentMessage = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'reset') {
        handleExitBuilding();
      }
    };
    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, [handleExitBuilding]);

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

      <CityCanvas
        canvasRef={canvasRef}
        style={{
          transform: cloudState.isCovering ? 'scale(1.06)' : 'scale(1)',
          filter: cloudState.isCovering ? 'blur(4px) brightness(1.1)' : 'none',
          transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.8s ease-out',
          willChange: 'transform, filter',
        }}
      />

      {/* Volumetric Cloud Sweep Transition */}
      <CloudTransition
        isCovering={cloudState.isCovering}
        isExiting={cloudState.isExiting}
        buildingTitle={cloudState.title}
      />

      {/* Sector 02 Click Targets: Frame ~300 */}
      {isSector02InView && !cloudState.isCovering && !cloudState.isExiting && (
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
      {isSector03InView && !cloudState.isCovering && !cloudState.isExiting && (
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
      {isCoreInView && !cloudState.isCovering && !cloudState.isExiting && (
        <div
          className="building-click-zone center-click-zone"
          onClick={() => handleEnterBuilding('headquarters')}
          title="ACM Headquarters & Celestial Core"
        />
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
