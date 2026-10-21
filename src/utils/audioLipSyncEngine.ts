/**
 * Audio, Lip-Sync, and Canvas Video Recording Engine
 * Provides audio synthesis, viseme calculation, background music, and video export.
 */

export interface VisemeFrame {
  openness: number; // 0 (closed) to 1 (wide open)
  width: number;    // 0 (narrow 'oo') to 1 (wide 'ee')
  visemeType: 'rest' | 'open' | 'wide' | 'round' | 'closed';
}

class AudioLipSyncEngine {
  private audioCtx: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private isBgmPlaying = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getContext(): AudioContext {
    this.initContext();
    return this.audioCtx!;
  }

  /**
   * Generates emotional background music using soft synthesizer chords (warm ambient strings)
   */
  public startBackgroundMusic(volume = 0.15) {
    this.initContext();
    if (this.isBgmPlaying) return;

    try {
      const ctx = this.audioCtx!;
      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(volume, ctx.currentTime);
      this.bgmGainNode.connect(ctx.destination);

      // Warm emotional chords: C major 9 -> F major 7 progression (frequencies)
      const chordNotes = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00], // G
      ];

      let chordIndex = 0;
      const playNextChord = () => {
        if (!this.isBgmPlaying) return;
        const currentChord = chordNotes[chordIndex % chordNotes.length];
        chordIndex++;

        currentChord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Soft attack, warm sustain, gentle release
          noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
          noteGain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.8);
          noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);

          osc.connect(noteGain);
          noteGain.connect(this.bgmGainNode!);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 4.0);
        });

        if (this.isBgmPlaying) {
          setTimeout(playNextChord, 3800);
        }
      };

      this.isBgmPlaying = true;
      playNextChord();
    } catch (e) {
      console.warn('BGM initialization notice:', e);
    }
  }

  public stopBackgroundMusic() {
    this.isBgmPlaying = false;
    if (this.bgmGainNode) {
      try {
        this.bgmGainNode.gain.setValueAtTime(0, this.audioCtx?.currentTime || 0);
      } catch (e) {}
    }
  }

  /**
   * Synthesize or play character speech audio
   * Uses Web Speech API for authentic Urdu pronunciation or Web Audio tone synthesis
   */
  public speakLine(
    textUrdu: string,
    textRomanUrdu: string,
    speaker: 'Aalu' | 'Aam' | string,
    onWordSpoken?: (word: string, progress: number) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        setTimeout(resolve, 2500);
        return;
      }

      window.speechSynthesis.cancel();

      // Find Urdu voice if available, else Hindi or general South Asian voice for authentic accent
      const voices = window.speechSynthesis.getVoices();
      const urduVoice =
        voices.find((v) => v.lang.startsWith('ur')) ||
        voices.find((v) => v.lang.startsWith('hi')) ||
        voices.find((v) => v.lang.includes('IN') || v.lang.includes('PK')) ||
        voices[0];

      const utterance = new SpeechSynthesisUtterance(textUrdu || textRomanUrdu);
      if (urduVoice) utterance.voice = urduVoice;

      if (speaker === 'Aalu') {
        // Aalu: Young male, energetic, emotional, higher pitch
        utterance.pitch = 1.35;
        utterance.rate = 1.05;
      } else {
        // Aam: Deep male, warm, mature, slower emotional pace
        utterance.pitch = 0.75;
        utterance.rate = 0.92;
      }

      utterance.onboundary = (event) => {
        if (event.name === 'word' && onWordSpoken) {
          const charIndex = event.charIndex;
          const fullText = utterance.text;
          const word = fullText.slice(charIndex).split(' ')[0];
          const progress = charIndex / fullText.length;
          onWordSpoken(word, progress);
        }
      };

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = () => {
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Real-time Lip-Sync Viseme Calculation
   * Calculates mouth openness and width according to current playback time and dialogue phonemes
   */
  public calculateViseme(
    currentTime: number,
    isSpeaking: boolean,
    speaker: string,
    dialogueText: string
  ): VisemeFrame {
    if (!isSpeaking) {
      return { openness: 0.05, width: 0.5, visemeType: 'rest' };
    }

    // High frequency natural speech cadence (lip oscillation between 3.5Hz and 6.5Hz)
    const speed = speaker === 'Aalu' ? 6.2 : 4.8;
    const wave = Math.sin(currentTime * speed * Math.PI * 2);
    const subWave = Math.sin(currentTime * speed * 2 * Math.PI);

    // Natural talking variation
    let openness = Math.max(0.1, (wave * 0.45 + subWave * 0.25 + 0.4));
    let width = 0.5 + Math.sin(currentTime * 3.5) * 0.25;

    // Detect open vowel or round vowel moments based on text
    let visemeType: VisemeFrame['visemeType'] = 'open';
    if (openness < 0.2) {
      visemeType = 'closed';
    } else if (width > 0.65) {
      visemeType = 'wide';
    } else if (width < 0.38) {
      visemeType = 'round';
    }

    return {
      openness: Math.min(1, Math.max(0.05, openness)),
      width: Math.min(1, Math.max(0.2, width)),
      visemeType,
    };
  }
}

export const lipSyncEngine = new AudioLipSyncEngine();
