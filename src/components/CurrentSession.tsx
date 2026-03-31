import type { PlayedNote } from '../types';

type Props = {
  notes: PlayedNote[];
  title: string;
  onTitleChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
  isListening: boolean;
};

export default function CurrentSession({
  notes,
  title,
  onTitleChange,
  onSave,
  onClear,
  isListening,
}: Props) {
  return (
    <section className="card">
      <h2>Current session</h2>

      <input
        className="text-input"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Session title"
      />

      <div className="session-actions">
        <button
          className="secondary-btn"
          onClick={onClear}
          disabled={isListening || notes.length === 0}
        >
          Clear
        </button>

        <button
          className="primary-btn"
          onClick={onSave}
          disabled={isListening || notes.length === 0}
        >
          Save notebook entry
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="muted">No notes captured yet.</p>
      ) : (
        <ul className="notes-list">
          {notes.map((note, index) => (
            <li key={`${note.time}-${index}`}>
              <span>{note.note}</span>
              <span>{note.frequency} Hz</span>
              <span>{(note.time / 1000).toFixed(2)}s</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}