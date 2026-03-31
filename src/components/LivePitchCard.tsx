type Props = {
  currentNote: string | null;
  currentFrequency: number | null;
  isListening: boolean;
  onToggle: () => void;
};

export default function LivePitchCard({
  currentNote,
  currentFrequency,
  isListening,
  onToggle,
}: Props) {
  return (
    <section className="card">
      <h2>Live pitch</h2>

      <div className="live-note">{currentNote ?? '--'}</div>
      <div className="live-frequency">
        {currentFrequency ? `${currentFrequency} Hz` : 'No signal'}
      </div>

      <button className="primary-btn" onClick={onToggle}>
        {isListening ? 'Stop listening' : 'Start listening'}
      </button>
    </section>
  );
}