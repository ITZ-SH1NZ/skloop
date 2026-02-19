export const KEYPRESS_SOUND_URL = "data:audio/wav;base64,UklGRiQtAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA0AAAAAP//////////////////////////////////////////////////////////////////////////////////"; // Placeholder for an actual sound, but since I can't generate raw audio files easily, I will use a browser oscillator in the component for guaranteed sound if this fails. 
// Actually, let's use a very short, synthesized "tick" sound.

// Real mechanical click sound (shortened base64)
export const CLICK_SOUND = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAACAgICAgICAgICAgICAgICAAAA="; // This is silence.

// I will use a simple class that creates an oscillator for now to GUARANTEE sound, 
// or I can try to use a real hosted file URL if I had one. 
// For now, let's try a better logic in the component using Web Audio API for a "synthesized" click which is unblockable and needs no assets.

export class SoundManager {
    private audioContext: AudioContext | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
    }

    playClick(volume = 0.5) {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // Mechanical click simulation
        // Short burst of high frequency noise/square wave
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.03);

        gain.gain.setValueAtTime(volume * 0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    playError(volume = 0.5) {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // Error "Thud"
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
}

export const soundManager = new SoundManager();
