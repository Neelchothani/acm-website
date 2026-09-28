import React, { useState } from 'react';
import ReceptionScene from './components/ReceptionScene';
import CheckInForm from './components/CheckInForm';
import InteractiveBackground from './components/InteractiveBackground';

export default function App() {
  const [isSceneHidden, setIsSceneHidden] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleCheckIn = () => {
    setIsSceneHidden(true);
    // Smooth transition delay matching CSS fade
    setTimeout(() => {
      setIsFormVisible(true);
    }, 250);
  };

  const handleBackToLobby = () => {
    setIsFormVisible(false);
    setTimeout(() => {
      setIsSceneHidden(false);
    }, 200);
  };

  return (
    <div className="page">
      <InteractiveBackground />
      <ReceptionScene
        isHidden={isSceneHidden}
        onCheckIn={handleCheckIn}
      />
      <CheckInForm
        isVisible={isFormVisible}
        onBackToLobby={handleBackToLobby}
      />
    </div>
  );
}
