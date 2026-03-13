'use client';

import { useCallback, useRef } from 'react';

type FeedbackType = 'pop' | 'click' | 'success' | 'error' | 'hover';

interface FeedbackOptions {
  haptic?: boolean;
  audio?: boolean;
}

export function useFeedback() {
  const audioContext = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!audioContext.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext.current = new AudioContextClass();
      }
    }
    
    // Resume context if suspended (browser auto-play policy)
    if (audioContext.current?.state === 'suspended') {
      audioContext.current.resume();
    }
    return audioContext.current;
  }, []);

  const playSynthesizedSound = useCallback((type: FeedbackType) => {
    const ctx = initAudio();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'pop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
        gainNode.gain.setValueAtTime(0.3, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      
      case 'click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        gainNode.gain.setValueAtTime(0.1, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'hover':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        gainNode.gain.setValueAtTime(0.05, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'success':
        // Major third interval
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.2, t + 0.05);
        gainNode.gain.setValueAtTime(0.2, t + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.setValueAtTime(100, t + 0.1);
        gainNode.gain.setValueAtTime(0.2, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
    }
  }, [initAudio]);

  const triggerHaptic = useCallback((type: FeedbackType) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      switch (type) {
        case 'pop':
        case 'click':
        case 'hover':
          navigator.vibrate(10); // Very brief light tap
          break;
        case 'success':
          navigator.vibrate([10, 50, 10, 50, 50]); // Happy double tap
          break;
        case 'error':
          navigator.vibrate([50, 50, 50, 50, 50]); // Shake
          break;
      }
    }
  }, []);

  const trigger = useCallback((type: FeedbackType, options: FeedbackOptions = { haptic: true, audio: true }) => {
    // We could read a user preference from context/localStorage here
    const hapticsEnabled = options.haptic !== false;
    const audioEnabled = options.audio !== false;

    if (hapticsEnabled) triggerHaptic(type);
    if (audioEnabled) playSynthesizedSound(type);
  }, [triggerHaptic, playSynthesizedSound]);

  return { trigger, initAudio };
}
