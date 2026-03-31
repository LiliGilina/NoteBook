import type { SessionEntry } from '../types';

type Props = {
  sessions: SessionEntry[];
  onDelete: (id: string) => void;
};

export default function NotebookList({ sessions, onDelete }: Props) {
  return (
    <section className="card">
      <h2>Notebook</h2>

      {sessions.length === 0 ? (
        <p className="muted">No saved notebook entries.</p>
      ) : (
        <div className="notebook-list">
          {sessions.map((session) => (
            <article key={session.id} className="session-card">
              <div className="session-header">
                <div>
                  <h3>{session.title}</h3>
                  <p className="muted">
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  className="danger-btn"
                  onClick={() => onDelete(session.id)}
                >
                  Delete
                </button>
              </div>

              <ul className="notes-list">
                {session.notes.map((note, index) => (
                  <li key={`${session.id}-${note.time}-${index}`}>
                    <span>{note.note}</span>
                    <span>{note.frequency} Hz</span>
                    <span>{(note.time / 1000).toFixed(2)}s</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}