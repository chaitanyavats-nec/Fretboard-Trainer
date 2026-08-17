import React, { useState, useEffect } from 'react';
import ExerciseRunner from './components/ExerciseRunner';
import SettingsPanel from './components/SettingsPanel';
import { initAudio } from './lib/audioEngine';
import './index.css';

const DEFAULT_SETTINGS = {
  tuning: 'standard',
  activeStrings: [true, true, true, true, true, true],
  fretRange: { min: 0, max: 12 },
  noteFilter: 'all', // 'all' or 'natural'
  thinkDelay: 3,
  revealHold: 2,
  oscillatorType: 'sine',
  volume: 0.5,
};

function App() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('fretboardTrainerSettings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'settings', 'exercise'

  useEffect(() => {
    localStorage.setItem('fretboardTrainerSettings', JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="app-container">
      {currentScreen === 'home' && (
        <div className="screen-home">
          <div className="hero">
            <h1>Fretboard Trainer</h1>
            <p className="subtitle">Master your instrument visually.</p>
          </div>
          <button className="btn primary giant-btn" onClick={() => {
            initAudio();
            setCurrentScreen('settings');
          }}>
            Start
          </button>
        </div>
      )}

      {currentScreen === 'settings' && (
        <div className="screen-settings">
          <header className="mobile-header">
            <button className="btn text-btn" onClick={() => setCurrentScreen('home')}>&larr; Home</button>
            <h2>Configuration</h2>
            <div style={{width: '60px'}}></div> {/* spacer for centering */}
          </header>
          
          <div className="scrollable-content">
            <SettingsPanel settings={settings} setSettings={setSettings} />
          </div>

          <div className="sticky-bottom">
            <button className="btn primary giant-btn full-width" onClick={() => {
              initAudio();
              setCurrentScreen('exercise');
            }}>
              Start Training
            </button>
          </div>
        </div>
      )}

      {currentScreen === 'exercise' && (
        <div className="screen-exercise">
          <header className="mobile-header">
            <button className="btn text-btn" onClick={() => setCurrentScreen('settings')}>&larr; Settings</button>
            <h2>Training</h2>
            <div style={{width: '60px'}}></div>
          </header>
          
          <div className="exercise-content">
            <ExerciseRunner settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
