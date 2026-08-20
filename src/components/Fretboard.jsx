import React from 'react';
import { TUNINGS, getNoteName } from '../lib/fretboard';

export default function Fretboard({ tuning, fretRange, revealedNoteName, activeStrings }) {
  const strings = TUNINGS[tuning].notes;
  const numStrings = strings.length;

  const minFret = fretRange.min;
  const maxFret = fretRange.max;
  const numFrets = minFret === 0 ? maxFret : maxFret - minFret + 1;

  const width = 300;
  const height = numFrets * 60 + (minFret === 0 ? 30 : 0);

  const marginX = 24;
  const usableWidth = width - 2 * marginX;
  const stringSpacing = usableWidth / (numStrings - 1);

  const marginTop = minFret === 0 ? 30 : 20;
  const marginBottom = 20;
  const usableHeight = height - marginTop - marginBottom;
  const fretSpacing = usableHeight / (numFrets || 1);

  const markers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

  const getRevealedNotes = () => {
    if (!revealedNoteName) return [];
    const notes = [];
    strings.forEach((openNote, stringIndex) => {
      if (activeStrings && !activeStrings[stringIndex]) return;
      for (let fret = minFret; fret <= maxFret; fret++) {
        const name = getNoteName(openNote, fret);
        if (name === revealedNoteName) {
          const x = marginX + stringIndex * stringSpacing;
          const y = fret === 0
            ? marginTop - 12
            : marginTop + (minFret === 0 ? (fret - 1) : (fret - minFret)) * fretSpacing + fretSpacing / 2;
          notes.push({ stringIndex, fret, noteName: name, x, y });
        }
      }
    });
    return notes;
  };

  const revealedNotes = getRevealedNotes();

  return (
    <div className="fretboard-container">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="fretboard-svg">
        

        {/* Fret Wires */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => {
          const wireNum = minFret === 0 ? i : minFret - 1 + i;
          const y = marginTop + i * fretSpacing;
          return (
            <line
              key={`fretline-${i}`}
              x1={marginX - 5} y1={y}
              x2={width - marginX + 5} y2={y}
              stroke="#3a3a3a"
              strokeWidth={wireNum === 0 ? 6 : 1.5}
            />
          );
        })}

        {/* Fret Numbers & Markers */}
        {Array.from({ length: numFrets }).map((_, i) => {
          const fretSpaceNum = minFret === 0 ? i + 1 : minFret + i;
          if (fretSpaceNum > maxFret) return null;

          const cy = marginTop + i * fretSpacing + fretSpacing / 2;
          const cx = width / 2;
          const isMarker = markers.includes(fretSpaceNum);
          const isOctave = fretSpaceNum % 12 === 0;

          return (
            <g key={`fret-space-${i}`}>
              {/* Highlighted Fret Numbers */}
              <text
                x={6} y={cy}
                fill={isOctave ? "#60a5fa" : (isMarker ? "#a0c4e8" : "#444444")}
                fontSize={isMarker ? (isOctave ? "14" : "13") : "11"}
                fontWeight={isMarker ? "700" : "400"}
                textAnchor="start"
                dominantBaseline="middle"
                style={{ transition: 'fill 0.2s ease' }}
              >
                {fretSpaceNum}
              </text>

              {/* Fret Markers */}
              {isMarker && (
                isOctave ? (
                  <g>
                    <circle cx={cx - stringSpacing * 0.75} cy={cy} r="5" fill="#a0c4e8" />
                    <circle cx={cx + stringSpacing * 0.75} cy={cy} r="5" fill="#a0c4e8" />
                  </g>
                ) : (
                  <circle cx={cx} cy={cy} r="5" fill="#a0c4e8" />
                )
              )}
            </g>
          );
        })}

        {/* Strings */}
        {strings.map((_, i) => {
          const x = marginX + i * stringSpacing;
          const stringThickness = 1 + (numStrings - i) * 0.4;
          return (
            <line
              key={`string-${i}`}
              x1={x} y1={minFret === 0 ? marginTop - 24 : marginTop}
              x2={x} y2={marginTop + numFrets * fretSpacing}
              stroke="#666"
              strokeWidth={stringThickness}
            />
          );
        })}

        {/* Connecting Lines */}
        {revealedNotes.map((note, i) => {
          if (i === 0) return null;
          const prev = revealedNotes[i - 1];
          const delay = note.stringIndex * 0.12;
          return (
            <line
              key={`line-${i}`}
              x1={prev.x} y1={prev.y}
              x2={note.x} y2={note.y}
              stroke="rgba(160, 196, 232, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="connecting-line"
              style={{ animationDelay: `${delay}s` }}
            />
          );
        })}

        {/* Revealed Notes */}
        {revealedNotes.map((note, idx) => {
          const delay = note.stringIndex * 0.12;
          return (
            <g
              key={`note-${idx}`}
              className="revealed-note"
              transform={`translate(${note.x}, ${note.y})`}
            >
              <circle
                cx="0" cy="0" r="14"
                fill="#a0c4e8"
                className="note-circle"
                style={{ animationDelay: `${delay}s` }}
              />
              <text
                x="0" y="1"
                fill="#111"
                fontSize="12" fontWeight="700"
                textAnchor="middle" dominantBaseline="middle"
                style={{ animationDelay: `${delay}s` }}
              >
                {note.noteName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
