/**
 * Chicken Sound Manager
 * Handles infrequent and random chicken sound playback
 */

// List of chicken sounds (using Web Audio API for now, can be replaced with actual files)
const CHICKEN_SOUNDS = [
	'cluck',
	'bawk',
	'chirp',
	'squawk'
] as const;

type ChickenSound = typeof CHICKEN_SOUNDS[number];

class ChickenSoundManager {
	private audioContext: AudioContext | null = null;
	private isEnabled = true;
	private nextSoundTimeout: number | null = null;
	private minInterval = 20000; // Minimum 20 seconds between sounds
	private maxInterval = 60000; // Maximum 60 seconds between sounds

	constructor() {
		// Initialize on first user interaction (browser requirement)
		if (typeof window !== 'undefined') {
			document.addEventListener('click', () => this.init(), { once: true });
			document.addEventListener('keydown', () => this.init(), { once: true });
		}
	}

	private init() {
		if (!this.audioContext && typeof window !== 'undefined') {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			this.scheduleNextSound();
		}
	}

	/**
	 * Generate a simple chicken-like sound using Web Audio API
	 */
	private playGeneratedSound(type: ChickenSound) {
		if (!this.audioContext || !this.isEnabled) return;

		const ctx = this.audioContext;
		const now = ctx.currentTime;

		// Create oscillator and gain nodes
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		// Different sound characteristics for each type
		switch (type) {
			case 'cluck':
				// Short, percussive cluck
				osc.frequency.setValueAtTime(800, now);
				osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
				gain.gain.setValueAtTime(0.15, now);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
				osc.start(now);
				osc.stop(now + 0.1);
				break;

			case 'bawk':
				// Longer, more dramatic bawk
				osc.frequency.setValueAtTime(600, now);
				osc.frequency.linearRampToValueAtTime(300, now + 0.15);
				gain.gain.setValueAtTime(0.2, now);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
				osc.start(now);
				osc.stop(now + 0.2);
				break;

			case 'chirp':
				// High-pitched chirp
				osc.frequency.setValueAtTime(1200, now);
				osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
				gain.gain.setValueAtTime(0.1, now);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
				osc.start(now);
				osc.stop(now + 0.08);
				break;

			case 'squawk':
				// Mid-range squawk with some variation
				osc.type = 'sawtooth';
				osc.frequency.setValueAtTime(500, now);
				osc.frequency.linearRampToValueAtTime(700, now + 0.05);
				osc.frequency.linearRampToValueAtTime(400, now + 0.15);
				gain.gain.setValueAtTime(0.15, now);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
				osc.start(now);
				osc.stop(now + 0.15);
				break;
		}
	}

	/**
	 * Play a random chicken sound
	 */
	playRandomSound() {
		if (!this.isEnabled) return;

		const randomSound = CHICKEN_SOUNDS[Math.floor(Math.random() * CHICKEN_SOUNDS.length)];
		this.playGeneratedSound(randomSound);
	}

	/**
	 * Schedule the next random sound
	 */
	private scheduleNextSound() {
		if (!this.isEnabled) return;

		// Random interval between min and max
		const interval = this.minInterval + Math.random() * (this.maxInterval - this.minInterval);

		this.nextSoundTimeout = window.setTimeout(() => {
			this.playRandomSound();
			this.scheduleNextSound(); // Schedule the next one
		}, interval);
	}

	/**
	 * Start playing random sounds
	 */
	start() {
		this.isEnabled = true;
		if (this.audioContext && !this.nextSoundTimeout) {
			this.scheduleNextSound();
		}
	}

	/**
	 * Stop playing random sounds
	 */
	stop() {
		this.isEnabled = false;
		if (this.nextSoundTimeout) {
			clearTimeout(this.nextSoundTimeout);
			this.nextSoundTimeout = null;
		}
	}

	/**
	 * Clean up resources
	 */
	destroy() {
		this.stop();
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
	}
}

// Export a singleton instance
export const chickenSounds = new ChickenSoundManager();
