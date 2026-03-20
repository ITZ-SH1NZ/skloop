"use client";

// Procedural Web Audio SFX Generator
// Zero-dependency, synthetic waveforms for UI feedback.

let audioCtx: AudioContext | null = null;

const initAudio = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if browser suspended it (requires user interaction)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

const playTone = (
    freq1: number, 
    freq2: number, 
    type: OscillatorType, 
    duration: number, 
    vol: number = 0.1,
    delay: number = 0
) => {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    
    // Frequency slide
    osc.frequency.setValueAtTime(freq1, ctx.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freq2, 1), ctx.currentTime + delay + duration);
    
    // Volume envelope (click mitigation)
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
};

export const sfx = {
    // Light UI interactions
    hover: () => playTone(300, 400, 'sine', 0.05, 0.02),
    pop: () => playTone(600, 800, 'sine', 0.1, 0.06),
    
    // Transaction success
    coin: () => {
        playTone(987, 1318, 'square', 0.15, 0.05); // B5 to E6
        playTone(1318, 1760, 'sine', 0.3, 0.06, 0.1); // E6 to A6 (delayed)
    },
    
    // Heavy graphical slams
    thud: () => playTone(150, 40, 'square', 0.3, 0.15),
    
    // Mascot physical interactions
    squish: () => {
        playTone(400, 200, 'triangle', 0.15, 0.07);
        playTone(200, 600, 'sine', 0.15, 0.07, 0.1);
    },
    
    // Generic subtle error
    error: () => {
        playTone(200, 150, 'sawtooth', 0.2, 0.04);
        playTone(150, 100, 'sawtooth', 0.2, 0.04, 0.15);
    }
};
