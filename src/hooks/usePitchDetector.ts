import { useEffect, useRef, useState } from 'react';
import type { PlayedNote } from '../types';
import { autoCorrelate } from '../lib/autocorrelation';
import { frequencyToNote } from '../lib/noteUtils';

export function usePitchDetector() {
  const [isListening, setIsListening] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [capturedNotes, setCapturedNotes] = useState<PlayedNote[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const lastDetectedRef = useRef<string | null>(null);
  const stableCountRef = useRef(0);
  const lastSavedAtRef = useRef(0);

  const analyze = () => {
    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;

    if (!analyser || !audioContext) return;

    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);

    const frequency = autoCorrelate(data, audioContext.sampleRate);

    if (frequency > 0) {
      const noteData = frequencyToNote(frequency);

      if (noteData) {
        setCurrentFrequency(noteData.frequency);
        setCurrentNote(noteData.note);

        if (lastDetectedRef.current === noteData.note) {
          stableCountRef.current += 1;
        } else {
          lastDetectedRef.current = noteData.note;
          stableCountRef.current = 1;
        }

        const now = Date.now();
        const enoughStable = stableCountRef.current >= 6;
        const enoughTimePassed = now - lastSavedAtRef.current > 350;

        if (enoughStable && enoughTimePassed) {
          const noteEntry: PlayedNote = {
            note: noteData.note,
            frequency: noteData.frequency,
            time: now - startedAtRef.current,
          };

          setCapturedNotes((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.note === noteEntry.note && now - lastSavedAtRef.current < 900) {
              return prev;
            }
            return [...prev, noteEntry];
          });

          lastSavedAtRef.current = now;
        }
      }
    } else {
      setCurrentFrequency(null);
      setCurrentNote(null);
      lastDetectedRef.current = null;
      stableCountRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(analyze);
  };

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    streamRef.current = stream;
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    startedAtRef.current = Date.now();
    lastSavedAtRef.current = 0;
    lastDetectedRef.current = null;
    stableCountRef.current = 0;

    setCapturedNotes([]);
    setIsListening(true);

    rafRef.current = requestAnimationFrame(analyze);
  };

  const stop = async () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    await audioContextRef.current?.close();

    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    rafRef.current = null;

    setIsListening(false);
    setCurrentFrequency(null);
    setCurrentNote(null);
    lastDetectedRef.current = null;
    stableCountRef.current = 0;
  };

  const clearCapturedNotes = () => {
    setCapturedNotes([]);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  return {
    isListening,
    currentFrequency,
    currentNote,
    capturedNotes,
    start,
    stop,
    clearCapturedNotes,
  };
}