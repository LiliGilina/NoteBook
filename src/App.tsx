import { useEffect, useState } from 'react';
import './App.css';
import LivePitchCard from './components/LivePitchCard';
import CurrentSession from './components/CurrentSession';
import NotebookList from './components/NotebookList';
import { usePitchDetector } from './hooks/usePitchDetector';
import { deleteSession, getSessions, saveSession } from './lib/db';
import { detectKey } from './lib/keyDetection';
import type { SessionEntry } from './types';

export default function App() {
  const {
    isListening,
    currentFrequency,
    currentNote,
    capturedNotes,
    start,
    stop,
    clearCapturedNotes,
  } = usePitchDetector();

  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [title, setTitle] = useState('');

  const loadSessions = async () => {
    const data = await getSessions();
    setSessions(data);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleToggle = async () => {
    if (isListening) {
      await stop();
    } else {
      await start();
    }
  };

  const handleSave = async () => {
    if (capturedNotes.length === 0) return;

    const detectedKey = detectKey(capturedNotes);

    const entry: SessionEntry = {
      id: crypto.randomUUID(),
      title: title.trim() || `Session ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      notes: capturedNotes,
      detectedKey: detectedKey ?? undefined,
    };

    await saveSession(entry);
    setTitle('');
    clearCapturedNotes();
    await loadSessions();
  };

  const handleDelete = async (id: string) => {
    await deleteSession(id);
    await loadSessions();
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-top">
          <div className="brand">
            <div className="brand-mark">
              <span>♫</span>
            </div>

            <div className="brand-copy">
              <small>Hum, sing, play, and have fun</small>
              <h1>NoteBook</h1>
            </div>
          </div>

          <div className="hero-pill">
            <span className="hero-pill-dot" />
            Live pitch detection
          </div>
        </div>

        <p>
          Capture your melody into a clean notebook,
          and keep everything stored locally in your browser.
        </p>
      </header>

      <div className="grid">
        <LivePitchCard
          currentNote={currentNote}
          currentFrequency={currentFrequency}
          isListening={isListening}
          onToggle={handleToggle}
        />

        <CurrentSession
          notes={capturedNotes}
          title={title}
          onTitleChange={setTitle}
          onSave={handleSave}
          onClear={clearCapturedNotes}
          isListening={isListening}
        />
      </div>

      <NotebookList sessions={sessions} onDelete={handleDelete} />
    </div>
  );
}