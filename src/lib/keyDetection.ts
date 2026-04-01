import type { PlayedNote } from '../types';

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const NOTE_TO_PC: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function rotate<T>(arr: T[], shift: number): T[] {
  const n = arr.length;
  return arr.map((_, i) => arr[(i - shift + n) % n]);
}

function mean(values: number[]) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function correlation(a: number[], b: number[]) {
  const meanA = mean(a);
  const meanB = mean(b);

  let numerator = 0;
  let denomA = 0;
  let denomB = 0;

  for (let i = 0; i < a.length; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    numerator += da * db;
    denomA += da * da;
    denomB += db * db;
  }

  const denom = Math.sqrt(denomA * denomB);
  if (denom === 0) return -1;

  return numerator / denom;
}

function normalizeNoteName(note: string): string {
  return note.replace(/[0-9]/g, '');
}

function buildPitchClassHistogram(notes: PlayedNote[]): number[] {
  const histogram = new Array(12).fill(0);

  for (const item of notes) {
    const normalized = normalizeNoteName(item.note);
    const pc = NOTE_TO_PC[normalized];
    if (pc !== undefined) {
      histogram[pc] += 1;
    }
  }

  return histogram;
}

export function detectKey(notes: PlayedNote[]): string | null {
  if (!notes.length) return null;

  const histogram = buildPitchClassHistogram(notes);
  const totalNotes = histogram.reduce((sum, n) => sum + n, 0);

  if (totalNotes < 4) return 'Not enough notes';

  let bestScore = -Infinity;
  let bestKey = '';
  let bestMode = '';

  for (let tonic = 0; tonic < 12; tonic++) {
    const majorScore = correlation(histogram, rotate(MAJOR_PROFILE, tonic));
    if (majorScore > bestScore) {
      bestScore = majorScore;
      bestKey = PITCH_CLASSES[tonic];
      bestMode = 'major';
    }

    const minorScore = correlation(histogram, rotate(MINOR_PROFILE, tonic));
    if (minorScore > bestScore) {
      bestScore = minorScore;
      bestKey = PITCH_CLASSES[tonic];
      bestMode = 'minor';
    }
  }

  return `${bestKey} ${bestMode}`;
}