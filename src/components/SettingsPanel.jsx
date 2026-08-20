import React from 'react';
import { TUNINGS, getNoteFrequency } from '../lib/fretboard';
import { playTone, initAudio } from '../lib/audioEngine';

export default function SettingsPanel({ settings, setSettings }) {
  const handleTuningChange = (e) => {
    setSettings({ ...settings, tuning: e.target.value });
  };

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

  const handleToneChange = (e) => {
    const newTone = e.target.value;
    setSettings({ ...settings, oscillatorType: newTone });
    initAudio();
    // Play an A4 (440Hz) tone to preview
    playTone(440, 0.5, newTone, settings.volume);
  };

  const notes = TUNINGS[settings.tuning].notes;
  // Display strings from High pitch (top) to Low pitch (bottom), matching standard guitar view
  const stringIndices = notes.map((_, i) => notes.length - 1 - i);

  return (
    <div className="settings-panel">
      <div className="setting-group">
        <label>Tuning</label>
        <select value={settings.tuning} onChange={handleTuningChange}>
          {Object.entries(TUNINGS).map(([key, val]) => (
            <option key={key} value={key}>{val.name}</option>
          ))}
        </select>
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
        <select 
          value={settings.noteFilter} 
          onChange={(e) => setSettings({...settings, noteFilter: e.target.value})}
        >
          <option value="all">All Notes</option>
          <option value="natural">Naturals Only</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Think Delay ({settings.thinkDelay}s)</label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          step="0.5" 
          value={settings.thinkDelay} 
          onChange={(e) => setSettings({...settings, thinkDelay: parseFloat(e.target.value)})} 
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
          onChange={(e) => setSettings({...settings, revealHold: parseFloat(e.target.value)})} 
        />
      </div>

      <div className="setting-group">
        <label>Tone</label>
        <select 
          value={settings.oscillatorType} 
          onChange={handleToneChange}
        >
          <option value="sine">Sine</option>
          <option value="triangle">Triangle</option>
          <option value="square">Square</option>
        </select>
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
            setSettings({...settings, volume: parseFloat(e.target.value)});
          }} 
        />
      </div>
    </div>
  );
}
