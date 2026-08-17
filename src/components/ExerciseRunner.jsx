import React, { useState, useEffect, useRef } from 'react';
import Fretboard from './Fretboard';
import { playTone, initAudio } from '../lib/audioEngine';
import { TUNINGS, getFrequency, getNoteName, isNatural } from '../lib/fretboard';

const STATE_STOPPED = 'STOPPED';
const STATE_THINK = 'THINK';
const STATE_REVEAL = 'REVEAL';

export default function ExerciseRunner({ settings }) {
  const [exerciseState, setExerciseState] = useState(STATE_STOPPED);
  const [currentNote, setCurrentNote] = useState(null);
  
  const [pausedState, setPausedState] = useState(null);
  const [showControls, setShowControls] = useState(true);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(null);
  const phaseRef = useRef(null); 
  
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // Auto-hide controls when running
  useEffect(() => {
    let hideTimer;
    if (showControls && exerciseState !== STATE_STOPPED) {
      hideTimer = setTimeout(() => setShowControls(false), 2500);
    } else if (exerciseState === STATE_STOPPED) {
      setShowControls(true);
    }
    return () => clearTimeout(hideTimer);
  }, [showControls, exerciseState]);

  const generateNote = () => {
    const activeStringIndices = settingsRef.current.activeStrings
      .map((active, idx) => active ? idx : -1)
      .filter(idx => idx !== -1);
      
    if (activeStringIndices.length === 0) return null;

    let attempts = 0;
    while (attempts < 50) {
      const stringIndex = activeStringIndices[Math.floor(Math.random() * activeStringIndices.length)];
      const openNote = TUNINGS[settingsRef.current.tuning].notes[stringIndex];
      const fret = Math.floor(Math.random() * (settingsRef.current.fretRange.max - settingsRef.current.fretRange.min + 1)) + settingsRef.current.fretRange.min;
      
      const noteName = getNoteName(openNote, fret);
      
      if (settingsRef.current.noteFilter === 'natural' && !isNatural(noteName)) {
        attempts++;
        continue;
      }
      
      if (currentNote && currentNote.stringIndex === stringIndex && currentNote.fret === fret) {
        attempts++;
        continue;
      }
      
      return { stringIndex, fret, noteName, openNote };
    }
    return null; 
  };

  const scheduleNextPhase = (phase, delayMs) => {
    clearTimeout(timerRef.current);
    startTimeRef.current = Date.now();
    remainingTimeRef.current = delayMs;
    phaseRef.current = phase;

    timerRef.current = setTimeout(() => {
      if (phase === STATE_REVEAL) {
        setExerciseState(STATE_REVEAL);
        scheduleNextPhase('NEXT_NOTE', settingsRef.current.revealHold * 1000);
      } else if (phase === 'NEXT_NOTE') {
        startNewNote();
      }
    }, delayMs);
  };

  const startNewNote = () => {
    const newNote = generateNote();
    if (!newNote) {
      setExerciseState(STATE_STOPPED);
      setPausedState(null);
      alert("Could not generate a note. Please check your settings.");
      return;
    }
    
    setCurrentNote(newNote);
    setExerciseState(STATE_THINK);
    setPausedState(null);
    
    const freq = getFrequency(newNote.openNote, newNote.fret);
    initAudio();
    playTone(freq, 0.5, settingsRef.current.oscillatorType, settingsRef.current.volume);
    
    scheduleNextPhase(STATE_REVEAL, settingsRef.current.thinkDelay * 1000);
  };

  const togglePlayPause = (e) => {
    e.stopPropagation();
    initAudio(); 
    
    if (exerciseState === STATE_STOPPED) {
      if (pausedState && currentNote && remainingTimeRef.current > 0) {
        setExerciseState(pausedState);
        scheduleNextPhase(phaseRef.current, remainingTimeRef.current);
        setPausedState(null);
      } else {
        startNewNote();
      }
    } else {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      setPausedState(exerciseState);
      setExerciseState(STATE_STOPPED);
    }
  };

  const skip = (e) => {
    e.stopPropagation();
    initAudio();
    startNewNote();
  };

  const handleScreenTap = () => {
    setShowControls(true);
  };

  return (
    <div className="exercise-runner" onClick={handleScreenTap}>
      
      {/* The overlay is only active when thinking */}
      {(exerciseState === STATE_THINK || pausedState === STATE_THINK) && currentNote && (
        <div className="note-overlay">
          <div className="large-note">{currentNote.noteName}</div>
        </div>
      )}

      <div className={`floating-controls ${showControls ? 'visible' : 'hidden'}`}>
        <button onClick={togglePlayPause} className={`btn ${exerciseState === STATE_STOPPED ? 'primary' : ''}`}>
          {exerciseState === STATE_STOPPED ? (pausedState ? 'Resume' : 'Play') : 'Pause'}
        </button>
        <button onClick={skip} className="btn">Skip / Next</button>
      </div>

      <div className="fretboard-wrapper">
        <Fretboard 
          tuning={settings.tuning} 
          fretRange={settings.fretRange} 
          activeStrings={settings.activeStrings}
          revealedNoteName={(exerciseState === STATE_REVEAL || pausedState === STATE_REVEAL) && currentNote ? currentNote.noteName : null} 
        />
      </div>

    </div>
  );
}
