import { AdaptiveSoundtrack, SoundMood } from '../types/video';

class AdaptiveAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private currentStep = 0;
  private bpm = 110;
  private mood: SoundMood = 'cyberpunk_synth';

  // Gain nodes for stems
  private masterGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private drumsGain: GainNode | null = null;
  private atmosGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Analyser node for UI visualizer
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  // Destination node for canvas / MediaRecorder export
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.mediaStreamDest = this.ctx.createMediaStreamDestination();

    this.melodyGain = this.ctx.createGain();
    this.bassGain = this.ctx.createGain();
    this.drumsGain = this.ctx.createGain();
    this.atmosGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    // Route stems to master
    [this.melodyGain, this.bassGain, this.drumsGain, this.atmosGain, this.sfxGain].forEach(node => {
      node.connect(this.masterGain!);
    });

    // Route master to speakers AND recorder destination
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.masterGain.connect(this.mediaStreamDest);
  }

  public getAudioStream(): MediaStream | null {
    this.init();
    return this.mediaStreamDest?.stream || null;
  }

  public updateSoundtrackConfig(soundtrack?: AdaptiveSoundtrack) {
    this.init();
    if (!soundtrack) return;
    this.bpm = soundtrack.bpm || 110;
    this.mood = soundtrack.mood || 'cyberpunk_synth';

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(soundtrack.masterVolume ?? 0.85, this.ctx.currentTime, 0.05);
    }

    if (soundtrack.stems) {
      const { melody, bass, drums, atmos, sfx } = soundtrack.stems;
      if (this.melodyGain && this.ctx && melody) {
        this.melodyGain.gain.setTargetAtTime(melody.muted ? 0 : melody.volume, this.ctx.currentTime, 0.05);
      }
      if (this.bassGain && this.ctx && bass) {
        this.bassGain.gain.setTargetAtTime(bass.muted ? 0 : bass.volume, this.ctx.currentTime, 0.05);
      }
      if (this.drumsGain && this.ctx && drums) {
        this.drumsGain.gain.setTargetAtTime(drums.muted ? 0 : drums.volume, this.ctx.currentTime, 0.05);
      }
      if (this.atmosGain && this.ctx && atmos) {
        this.atmosGain.gain.setTargetAtTime(atmos.muted ? 0 : atmos.volume, this.ctx.currentTime, 0.05);
      }
      if (this.sfxGain && this.ctx && sfx) {
        this.sfxGain.gain.setTargetAtTime(sfx.muted ? 0 : sfx.volume, this.ctx.currentTime, 0.05);
      }
    }
  }

  public play() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Start 16th note musical scheduler loop
    const stepDurationMs = (60 / this.bpm / 4) * 1000;
    this.timerId = window.setInterval(() => {
      this.tick();
      this.currentStep = (this.currentStep + 1) % 32;
    }, stepDurationMs);
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public seek(timeInSeconds: number) {
    const beats = (timeInSeconds * this.bpm) / 60;
    this.currentStep = Math.floor(beats * 4) % 32;
  }

  public getVisualizerLevels(): number[] {
    if (!this.analyser || !this.dataArray) return [0, 0, 0, 0, 0, 0, 0, 0];
    this.analyser.getByteFrequencyData(this.dataArray);
    const levels: number[] = [];
    const step = Math.floor(this.dataArray.length / 8);
    for (let i = 0; i < 8; i++) {
      levels.push(this.dataArray[i * step] / 255);
    }
    return levels;
  }

  // Synthesis engine per step
  private tick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const step = this.currentStep;

    switch (this.mood) {
      case 'cyberpunk_synth':
        this.playCyberpunkStep(step, now);
        break;
      case 'epic_orchestral':
        this.playOrchestralStep(step, now);
        break;
      case 'lofi_ambient':
        this.playLofiStep(step, now);
        break;
      case 'dark_suspense':
        this.playSuspenseStep(step, now);
        break;
      case 'uplifting_cinema':
        this.playUpliftingStep(step, now);
        break;
      case 'action_hybrid':
        this.playActionStep(step, now);
        break;
      default:
        this.playCyberpunkStep(step, now);
    }
  }

  private playCyberpunkStep(step: number, now: number) {
    if (!this.ctx) return;

    // Cyberpunk Arpeggio notes (F, Ab, C, Eb in Hz)
    const arpNotes = [174.61, 207.65, 261.63, 311.13, 349.23, 415.30, 523.25, 622.25];
    const noteFreq = arpNotes[step % arpNotes.length];

    // Melody / Pluck
    if (this.melodyGain && this.melodyGain.gain.value > 0.01) {
      this.playSynthPluck(noteFreq, now, 0.12, 'sawtooth');
    }

    // Heavy Sub Bass on quarter notes
    if (step % 8 === 0 && this.bassGain && this.bassGain.gain.value > 0.01) {
      const bassFreq = (step % 16 === 0) ? 43.65 : 38.89; // F1 or Eb1
      this.playSubBass(bassFreq, now, 0.6);
    }

    // Cyber drums: kick on 0, 8, 16, 24, snare on 8, 24, hi-hat every even step
    if (this.drumsGain && this.drumsGain.gain.value > 0.01) {
      if (step % 8 === 0) {
        this.playKick(now);
      }
      if (step % 16 === 8) {
        this.playSnare(now);
      }
      if (step % 2 === 0) {
        this.playHihat(now, step % 4 === 2 ? 0.08 : 0.04);
      }
    }

    // Atmospheric Drone every 16 steps
    if (step % 16 === 0 && this.atmosGain && this.atmosGain.gain.value > 0.01) {
      this.playPadChord([87.31, 130.81, 174.61], now, 2.5);
    }
  }

  private playOrchestralStep(step: number, now: number) {
    if (!this.ctx) return;

    // Taiko boom on 0 and 16
    if (this.drumsGain && this.drumsGain.gain.value > 0.01) {
      if (step === 0 || step === 12 || step === 20) {
        this.playTaikoBoom(now);
      }
      if (step % 4 === 0) {
        this.playOrchestralPulse(now);
      }
    }

    // Majestic strings pad
    if (step % 16 === 0 && this.atmosGain && this.atmosGain.gain.value > 0.01) {
      const chord = step === 0 ? [130.81, 196.0, 261.63] : [110.0, 164.81, 220.0];
      this.playPadChord(chord, now, 3.2);
    }

    // Cello bass note
    if (step % 8 === 0 && this.bassGain && this.bassGain.gain.value > 0.01) {
      this.playSubBass(55.0, now, 0.8);
    }

    // French Horn / Violin motif
    if (step % 4 === 0 && this.melodyGain && this.melodyGain.gain.value > 0.01) {
      const melodyFreqs = [261.63, 329.63, 392.0, 523.25];
      const freq = melodyFreqs[(step / 4) % melodyFreqs.length];
      this.playSynthPluck(freq, now, 0.4, 'triangle');
    }
  }

  private playLofiStep(step: number, now: number) {
    if (!this.ctx) return;

    // Soft Rhodes chord
    if (step % 16 === 0 && this.atmosGain && this.atmosGain.gain.value > 0.01) {
      this.playPadChord([146.83, 174.61, 220.0, 261.63], now, 2.8);
    }

    // Warm Lo-Fi Sub
    if (step % 8 === 0 && this.bassGain && this.bassGain.gain.value > 0.01) {
      this.playSubBass(73.42, now, 0.5);
    }

    // Dusty drums: Kick on 0 and 10, rim on 8 and 24
    if (this.drumsGain && this.drumsGain.gain.value > 0.01) {
      if (step === 0 || step === 10) this.playKick(now, 60, 0.18);
      if (step === 8 || step === 24) this.playSnare(now, 0.08);
      if (step % 2 === 0) this.playHihat(now, 0.02);
    }

    // Nostalgic piano high note
    if ((step === 6 || step === 14 || step === 22) && this.melodyGain && this.melodyGain.gain.value > 0.01) {
      this.playSynthPluck(440.0 * (step === 6 ? 1 : 1.25), now, 0.35, 'sine');
    }
  }

  private playSuspenseStep(step: number, now: number) {
    if (!this.ctx) return;

    // Dissonant sub rumble
    if (step === 0 && this.bassGain && this.bassGain.gain.value > 0.01) {
      this.playSubBass(36.71, now, 1.8);
    }

    // Ticking heartbeat clock
    if (step % 4 === 0 && this.drumsGain && this.drumsGain.gain.value > 0.01) {
      this.playHihat(now, 0.06);
    }

    // High dissonant cluster string
    if (step % 16 === 0 && this.atmosGain && this.atmosGain.gain.value > 0.01) {
      this.playPadChord([466.16, 493.88, 523.25], now, 3.5);
    }
  }

  private playUpliftingStep(step: number, now: number) {
    if (!this.ctx) return;

    // Bright major chord
    if (step % 16 === 0 && this.atmosGain && this.atmosGain.gain.value > 0.01) {
      this.playPadChord([196.0, 246.94, 293.66, 392.0], now, 2.8);
    }

    if (step % 8 === 0 && this.bassGain && this.bassGain.gain.value > 0.01) {
      this.playSubBass(49.0, now, 0.6);
    }

    if (this.drumsGain && this.drumsGain.gain.value > 0.01) {
      if (step % 8 === 0) this.playKick(now);
      if (step % 8 === 4) this.playHihat(now, 0.07);
    }

    if (step % 2 === 0 && this.melodyGain && this.melodyGain.gain.value > 0.01) {
      const notes = [392.0, 493.88, 587.33, 783.99];
      this.playSynthPluck(notes[(step / 2) % notes.length], now, 0.15, 'triangle');
    }
  }

  private playActionStep(step: number, now: number) {
    if (!this.ctx) return;

    // Relentless 16th-note industrial bass
    if (step % 2 === 0 && this.bassGain && this.bassGain.gain.value > 0.01) {
      this.playSubBass(step % 8 === 0 ? 55.0 : 41.2, now, 0.18);
    }

    // Heavy kick on every beat
    if (this.drumsGain && this.drumsGain.gain.value > 0.01) {
      if (step % 4 === 0) this.playKick(now);
      if (step % 8 === 4) this.playSnare(now);
      if (step % 2 === 1) this.playHihat(now, 0.08);
    }

    // Staccato lead motif
    if (step % 4 === 2 && this.melodyGain && this.melodyGain.gain.value > 0.01) {
      this.playSynthPluck(330.0, now, 0.1, 'sawtooth');
    }
  }

  // Sound synthesis primitives
  private playSynthPluck(freq: number, time: number, duration = 0.2, type: OscillatorType = 'sawtooth') {
    if (!this.ctx || !this.melodyGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + duration);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.melodyGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playSubBass(freq: number, time: number, duration = 0.5) {
    if (!this.ctx || !this.bassGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.bassGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playKick(time: number, startFreq = 120, duration = 0.3) {
    if (!this.ctx || !this.drumsGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + duration);

    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.drumsGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playSnare(time: number, duration = 0.15) {
    if (!this.ctx || !this.drumsGain) return;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumsGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  private playHihat(time: number, duration = 0.05) {
    if (!this.ctx || !this.drumsGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumsGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  private playPadChord(frequencies: number[], time: number, duration = 2.5) {
    if (!this.ctx || !this.atmosGain) return;
    frequencies.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.12 / frequencies.length, time + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.atmosGain!);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private playTaikoBoom(time: number) {
    if (!this.ctx || !this.drumsGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + 0.8);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);

    osc.connect(gain);
    gain.connect(this.drumsGain);

    osc.start(time);
    osc.stop(time + 0.9);
  }

  private playOrchestralPulse(time: number) {
    if (!this.ctx || !this.drumsGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(80, time);
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.drumsGain);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  // Instant SFX Trigger methods
  public triggerSfx(type: 'boom' | 'whoosh' | 'riser' | 'glitch' | 'hit') {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'boom':
        this.playTaikoBoom(now);
        break;
      case 'whoosh': {
        const dur = 0.5;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + dur * 0.5);
        filter.frequency.exponentialRampToValueAtTime(200, now + dur);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + dur * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + dur);
        break;
      }
      case 'riser': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 1.3);
        break;
      }
      case 'glitch': {
        for (let i = 0; i < 4; i++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(300 + Math.random() * 1200, now + i * 0.05);
          gain.gain.setValueAtTime(0.2, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.04);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.04);
        }
        break;
      }
      case 'hit': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  }
}

export const adaptiveAudio = new AdaptiveAudioEngine();
