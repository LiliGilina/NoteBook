const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function frequencyToMidi(frequency: number) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

export function midiToNoteName(midi: number) {
  const name = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function frequencyToNote(frequency: number) {
  if (!frequency || frequency <= 0) return null;

  const midi = frequencyToMidi(frequency);
  return {
    midi,
    note: midiToNoteName(midi),
    frequency: Number(frequency.toFixed(2)),
  };
}