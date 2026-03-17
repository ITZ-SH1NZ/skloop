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
}

export const soundManager = new SoundManager();
