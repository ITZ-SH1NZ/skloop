export const KEYPRESS_SOUND_URL = "data:audio/wav;base64,UklGRiQtAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA0AAAAAP//////////////////////////////////////////////////////////////////////////////////"; 

export class SoundManager {
    private audioContext: AudioContext | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            this.setupUnlockListeners();
        }
    }

    private setupUnlockListeners() {
        const unlock = () => {
            if (this.audioContext) {
                this.audioContext.resume().catch(() => {});
            } else {
                this.initContext();
            }
            window.removeEventListener('mousedown', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('mousedown', unlock);
        window.addEventListener('keydown', unlock);
        window.addEventListener('touchstart', unlock);
    }

    private initContext() {
        if (this.audioContext) return;
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
        }
    }

    private async ensureContext(): Promise<boolean> {
        this.initContext();
        if (!this.audioContext) return false;
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                return false;
            }
        }
        return this.audioContext.state === 'running';
    }

    async playClick(volume = 0.5) {
        if (!await this.ensureContext()) return;
        const ctx = this.audioContext!;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    async playMetalSnap(volume = 0.5) {
        if (!await this.ensureContext()) return;
        const ctx = this.audioContext!;

        const frequencies = [800, 1200, 2400];
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = i === 2 ? 'sawtooth' : 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        });
    }

    async playRocketLaunch(volume = 0.5) {
        if (!await this.ensureContext()) return;
        const ctx = this.audioContext!;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(50, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 1.5);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start();
    }

    async playError(volume = 0.5) {
        if (!await this.ensureContext()) return;
        const ctx = this.audioContext!;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }

    async playVictory(volume = 0.5) {
        if (!await this.ensureContext()) return;
        const ctx = this.audioContext!;

        // Notes for a major chord progression emphasizing the end: C - E - G - C maj
        const sequence = [
            { freq: 523.25, time: 0, duration: 0.15 }, // C5
            { freq: 659.25, time: 0.15, duration: 0.15 }, // E5
            { freq: 783.99, time: 0.3, duration: 0.15 }, // G5
            { freq: 1046.50, time: 0.45, duration: 1.5 }  // C6 (Sustained)
        ];

        const then = ctx.currentTime;
        
        sequence.forEach(({ freq, time, duration }) => {
            const osc = ctx.createOscillator();
            const osc2 = ctx.createOscillator(); // Sub-oscillator for warmth
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc2.type = 'sine';
            
            osc.frequency.setValueAtTime(freq, then + time);
            osc2.frequency.setValueAtTime(freq / 2, then + time); // One octave down
            
            gain.gain.setValueAtTime(0, then + time);
            gain.gain.linearRampToValueAtTime(volume * 0.15, then + time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, then + time + duration);
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(then + time);
            osc2.start(then + time);
            osc.stop(then + time + duration);
            osc2.stop(then + time + duration);
        });
    }

    async playGameOver(volume = 0.5) {
        if (!await this.ensureContext()) return;
        const ctx = this.audioContext!;

        // Womp womp womp woooooooomp (Descending minor)
        const sequence = [
            { freq: 329.63, time: 0, duration: 0.3 }, // E4
            { freq: 311.13, time: 0.3, duration: 0.3 }, // Eb4
            { freq: 293.66, time: 0.6, duration: 0.3 }, // D4
            { freq: 277.18, time: 0.9, duration: 2.0 }  // Db4 (Drops)
        ];

        const then = ctx.currentTime;
        
        sequence.forEach(({ freq, time, duration }, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sawtooth'; // Harsh synth sound for failure
            
            osc.frequency.setValueAtTime(freq, then + time);
            
            if (i === sequence.length - 1) {
                // Pitch bend down on the last note for the "death/deflating" feel
                osc.frequency.exponentialRampToValueAtTime(freq / 4, then + time + duration);
            }
            
            gain.gain.setValueAtTime(0, then + time);
            gain.gain.linearRampToValueAtTime(volume * 0.2, then + time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, then + time + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(then + time);
            osc.stop(then + time + duration);
        });
    }
}

export const soundManager = new SoundManager();
