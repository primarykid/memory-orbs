import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

export interface UseVoiceRecorderResult {
  state: RecordingState;
  start: () => Promise<void>;
  stop: () => Promise<string | null>; // returns transcribed text or null
  cancel: () => Promise<void>;
  durationMs: number;
}

/**
 * Thin wrapper around expo-av recording.
 * Transcription via Whisper is wired up when the Supabase Edge Function is ready.
 * Until then, stop() returns null and the caller falls back to text input.
 */
export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [state, setState] = useState<RecordingState>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setState('error');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setState('recording');

      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);
    } catch {
      setState('error');
    }
  }, []);

  const stop = useCallback(async (): Promise<string | null> => {
    clearTimer();
    if (!recordingRef.current) return null;

    try {
      setState('processing');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setDurationMs(0);

      if (!uri) {
        setState('idle');
        return null;
      }

      // TODO: send `uri` to Supabase Edge Function → Whisper → return transcript
      setState('idle');
      return null; // placeholder until Whisper is wired
    } catch {
      setState('error');
      return null;
    }
  }, []);

  const cancel = useCallback(async () => {
    clearTimer();
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        /* ignore */
      }
      recordingRef.current = null;
    }
    setDurationMs(0);
    setState('idle');
  }, []);

  return { state, start, stop, cancel, durationMs };
}
