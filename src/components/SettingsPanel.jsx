import React from 'react';
import { TUNINGS, getNoteFrequency } from '../lib/fretboard';
import { playTone, initAudio } from '../lib/audioEngine';

// Visual Helper for Tuning cards
const renderTuningVisual = (notes) => {
  return (
    <svg viewBox="0 0 100 80" className="card-visual-svg tuning-visual">
      {/* Peghead/Nut line */}
      <rect x="10" y="26" width="80" height="3" fill="#484852" rx="1.5" />
      {/* 6 vertical strings extending downwards */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const xPos = 18 + i * 12.8;
        // Low strings are thicker, high strings are thinner
        const thickness = 0.6 + (5 - i) * 0.4;
        return (
          <line
            key={i}
            x1={xPos}
            y1="29"
            x2={xPos}
            y2="75"
            stroke="#666"
            strokeWidth={thickness}
          />
        );
      })}
      {/* 6 note circular badges at the top */}
      {notes.map((noteWithOctave, i) => {
        const note = noteWithOctave.replace(/\d/, '');
        const xPos = 18 + i * 12.8;
        return (
          <g key={i}>
            <circle cx={xPos} cy="14" r="7.5" fill="#1e1e21" stroke="#484852" strokeWidth="1" />
            <text
              x={xPos}
              y="16.5"
              textAnchor="middle"
              fill="#e0e0e0"
              fontSize="7.5"
              fontWeight="bold"
              fontFamily="inherit"
            >
              {note}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Visual Helper for Note Filter cards (piano keyboard representation)
const renderFilterVisual = (type) => {
  const isAll = type === 'all';
  return (
    <svg viewBox="0 0 100 60" className="card-visual-svg filter-visual">
      {/* 7 White Keys */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const x = 8 + i * 12.5;
        return (
          <rect
            key={`w-${i}`}
            x={x}
            y="5"
            width="11.5"
            height="48"
            fill="#e0e0e0"
            rx="1.5"
          />
        );
      })}
      {/* 5 Black Keys */}
      {[0, 1, 3, 4, 5].map((i) => {
        const x = 16.5 + i * 12.5;
        const fill = isAll ? '#1a1a1a' : '#55555e';
        const opacity = isAll ? '1' : '0.25';
        return (
          <rect
            key={`b-${i}`}
            x={x}
            y="5"
            width="7.5"
            height="30"
            fill={fill}
            opacity={opacity}
            rx="1"
          />
        );
      })}
    </svg>
  );
};

const getShortTuningName = (key, fullName) => {
  if (key === 'halfStepDown') return 'Half Step';
  return fullName.split(' (')[0];
};

  // Visual Helper for Tone cards (waveform representation)
  const renderToneVisual = (type) => {
    const commonProps = {
      width: '100%',
      height: '100%',
      viewBox: '0 0 100 60',
      preserveAspectRatio: 'none',
      className: 'card-visual-svg tone-visual',
    };
    switch (type) {
      case 'sine':
        return (
          <svg {...commonProps}>
            <path d='M0 30 Q25 0 50 30 T100 30' fill='none' stroke='#e0e0e0' strokeWidth='2' />
          </svg>
        );
      case 'triangle':
        return (
          <svg {...commonProps}>
            <polygon points='0,50 30,10 70,10 100,50' fill='none' stroke='#e0e0e0' strokeWidth='2' />
          </svg>
        );
      case 'square':
        return (
          <svg {...commonProps}>
            <rect x='0' y='10' width='100' height='40' fill='none' stroke='#e0e0e0' strokeWidth='2' />
          </svg>
        );
      default:
        return null;
    }
  };

export default function SettingsPanel({ settings, setSettings }) {
  const handleStringToggle = (index) => {
    const isNowChecked = !settings.activeStrings[index];
    const newStrings = [...settings.activeStrings];
    newStrings[index] = isNowChecked;
    setSettings({ ...settings, activeStrings: newStrings });

    if (isNowChecked) {
      initAudio();
      const openNote = TUNINGS[settings.tuning].notes[index];
      const freq = getNoteFrequency(openNote);
      playTone(freq, 0.5, settings.oscillatorType, settings.volume);
    }
  };

  const handleFretRangeChange = (type, value) => {
    const val = parseInt(value, 10);
    setSettings({
      ...settings,
      fretRange: { ...settings.fretRange, [type]: val }
    });
  };

  const handleToneSelect = (type) => {
    setSettings({ ...settings, oscillatorType: type });
    initAudio();
    // Play a preview tone using the selected waveform
    playTone(440, 0.5, type, settings.volume);
  };

  const notes = TUNINGS[settings.tuning].notes;
  // Display strings from High pitch (top) to Low pitch (bottom), matching standard guitar view
  const stringIndices = notes.map((_, i) => notes.length - 1 - i);

  return (
    <div className="settings-panel">
      <div className="setting-group">
        <label>Tuning</label>
        <div className="card-selector-grid">
          {Object.entries(TUNINGS).map(([key, val]) => {
            const isActive = settings.tuning === key;
            const shortName = getShortTuningName(key, val.name);
            return (
              <div
                key={key}
                className={`selector-card ${isActive ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, tuning: key })}
              >
                <div className="card-visual-container">
                  {renderTuningVisual(val.notes)}
                </div>
                <div className="card-label">{shortName}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="string-selection-card">
        <div className="string-card-header">
          Active Strings (low to high)
        </div>
        <div className="string-selector-container">
          {stringIndices.map((idx) => {
            const note = notes[idx];
            const isChecked = settings.activeStrings[idx];
            let label = note.replace(/\d/, '');
            if (idx === notes.length - 1 && label === 'E') {
              label = 'e';
            }
            // Line thickness varies: low E (idx 0) is thickest (~5px), high e (idx 5) is thinnest (~1.5px)
            const lineThickness = 1.5 + (notes.length - 1 - idx) * 0.7;

            return (
              <div
                key={idx}
                className={`string-row ${isChecked ? 'active' : ''}`}
                onClick={() => handleStringToggle(idx)}
              >
                <div className="string-label">{label}</div>
                <div className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                  {isChecked && <div className="checkbox-dot" />}
                </div>
                <div className="string-divider" />
                <div className="string-line-wrapper">
                  <div
                    className={`string-line ${isChecked ? 'active' : 'inactive'}`}
                    style={{ height: `${lineThickness}px` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="setting-group">
        <label>Fret Range ({settings.fretRange.min} - {settings.fretRange.max})</label>
        <div className="range-inputs">
          <input
            type="number"
            min="0"
            max={settings.fretRange.max}
            value={settings.fretRange.min}
            onChange={(e) => handleFretRangeChange('min', e.target.value)}
          />
          <span>to</span>
          <input
            type="number"
            min={settings.fretRange.min}
            max="24"
            value={settings.fretRange.max}
            onChange={(e) => handleFretRangeChange('max', e.target.value)}
          />
        </div>
      </div>

      <div className="setting-group">
        <label>Note Filter</label>
        <div className="note-filter-grid">
          <div
            className={`selector-card ${settings.noteFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSettings({ ...settings, noteFilter: 'all' })}
          >
            <div className="card-visual-container">
              {renderFilterVisual('all')}
            </div>
            <div className="card-label">All Notes</div>
          </div>
          <div
            className={`selector-card ${settings.noteFilter === 'natural' ? 'active' : ''}`}
            onClick={() => setSettings({ ...settings, noteFilter: 'natural' })}
          >
            <div className="card-visual-container">
              {renderFilterVisual('natural')}
            </div>
            <div className="card-label">Naturals Only</div>
          </div>
        </div>
      </div>

      <div className="setting-group">
        <label>Think Delay ({settings.thinkDelay}s)</label>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={settings.thinkDelay}
          onChange={(e) => setSettings({ ...settings, thinkDelay: parseFloat(e.target.value) })}
        />
      </div>

      <div className="setting-group">
        <label>Reveal Hold ({settings.revealHold}s)</label>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={settings.revealHold}
          onChange={(e) => setSettings({ ...settings, revealHold: parseFloat(e.target.value) })}
        />
      </div>

      <div className="setting-group">
        <label>Tone</label>
        <div className="card-selector-grid">
          {['sine', 'triangle', 'square'].map((type) => {
            const isActive = settings.oscillatorType === type;
            return (
              <div
                key={type}
                className={`selector-card ${isActive ? 'active' : ''}`}
                onClick={() => handleToneSelect(type)}
              >
                <div className="card-visual-container">
                  {renderToneVisual(type)}
                </div>
                <div className="card-label">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="setting-group">
        <label>Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.volume}
          onChange={(e) => {
            setSettings({ ...settings, volume: parseFloat(e.target.value) });
          }}
        />
      </div>
    </div>
  );
}
