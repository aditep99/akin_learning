import { useCallback, useEffect, useRef } from "react";

function playTone(audioContext, startTime, frequency, duration, gainValue) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playSweep(audioContext, startTime, startFrequency, endFrequency, duration, gainValue) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(startFrequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    endFrequency,
    startTime + duration,
  );
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function useAudioFeedback() {
  const audioContextRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const playPop = useCallback(async () => {
    const audioContext = await ensureContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;
    playTone(audioContext, now, 640, 0.12, 0.08);
    playTone(audioContext, now + 0.02, 960, 0.1, 0.05);
  }, [ensureContext]);

  const playSuccess = useCallback(async () => {
    const audioContext = await ensureContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;
    playTone(audioContext, now, 520, 0.14, 0.06);
    playTone(audioContext, now + 0.12, 780, 0.16, 0.07);
    playTone(audioContext, now + 0.24, 1040, 0.18, 0.08);
  }, [ensureContext]);

  const playOops = useCallback(async () => {
    const audioContext = await ensureContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;
    playTone(audioContext, now, 540, 0.1, 0.05);
    playTone(audioContext, now + 0.08, 420, 0.16, 0.05);
  }, [ensureContext]);

  const playCelebration = useCallback(async () => {
    const audioContext = await ensureContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime + 0.04;
    playTone(audioContext, now, 720, 0.18, 0.16);
    playTone(audioContext, now + 0.16, 1080, 0.24, 0.18);

    playSweep(audioContext, now + 0.3, 620, 1640, 0.24, 0.15);
    playSweep(audioContext, now + 0.36, 760, 1960, 0.2, 0.13);
    playTone(audioContext, now + 0.4, 1320, 0.09, 0.11);
    playTone(audioContext, now + 0.44, 980, 0.11, 0.1);
    playTone(audioContext, now + 0.49, 1680, 0.08, 0.09);
    playTone(audioContext, now + 0.55, 1420, 0.09, 0.09);
  }, [ensureContext]);

  return {
    playCelebration,
    playOops,
    playPop,
    playSuccess,
  };
}
