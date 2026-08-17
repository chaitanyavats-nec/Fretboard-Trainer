const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const TUNINGS = {
  standard: { name: 'Standard (E A D G B E)', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  dropD: { name: 'Drop D (D A D G B E)', notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  halfStepDown: { name: 'Half Step Down (Eb Ab Db Gb Bb Eb)', notes: ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] },
  openG: { name: 'Open G (D G D G B D)', notes: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
  dadgad: { name: 'DADGAD (D A D G A D)', notes: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
};

export function getNoteFrequency(noteWithOctave) {
  const noteMatch = noteWithOctave.match(/^([A-G]#?)(\d+)$/);
  if (!noteMatch) return 440;
  
  const note = noteMatch[1];
  const octave = parseInt(noteMatch[2], 10);
  
  const noteIndex = NOTES.indexOf(note);
  const a4Index = NOTES.indexOf('A');
  
  const halfStepsFromA4 = (noteIndex - a4Index) + (octave - 4) * 12;
  return 440 * Math.pow(2, halfStepsFromA4 / 12);
}

export function getFrequency(openNote, fret) {
  const openFreq = getNoteFrequency(openNote);
  return openFreq * Math.pow(2, fret / 12);
}

export function getNoteName(openNote, fret) {
  const noteMatch = openNote.match(/^([A-G]#?)(\d+)$/);
  if (!noteMatch) return '';
  
  const note = noteMatch[1];
  const openIndex = NOTES.indexOf(note);
  const targetIndex = (openIndex + fret) % 12;
  return NOTES[targetIndex];
}

export function isNatural(noteName) {
  return !noteName.includes('#');
}
