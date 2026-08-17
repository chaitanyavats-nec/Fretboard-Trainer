import React from 'react';
import { TUNINGS } from '../lib/fretboard';
import { playTone, initAudio } from '../lib/audioEngine';

export default function SettingsPanel({ settings, setSettings }) {
  const handleTuningChange = (e) => {
    setSettings({ ...settings, tuning: e.target.value });
  };

  const handleStringToggle = (index) => {
    const newStrings = [...settings.activeStrings];
    newStrings[index] = !newStrings[index];
    setSettings({ ...settings, activeStrings: newStrings });
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

      <div className="setting-group">
        <label>Active Strings (Low to High)</label>
        <div className="string-toggles">
          {TUNINGS[settings.tuning].notes.map((note, idx) => (
            <label key={idx} className="string-toggle">
              <input
                type="checkbox"
                checked={settings.activeStrings[idx]}
                onChange={() => handleStringToggle(idx)}
              />
              {note.replace(/\d/, '')}
            </label>
          ))}
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
