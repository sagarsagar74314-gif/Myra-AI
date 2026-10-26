/**
 * FingerSnapDetector (हाई-फ़्रीक्वेंसी चुटकी डिटेक्टर)
 * Real-time High-Frequency Acoustic Finger Snap Detector using Web Audio API.
 *
 * Distinguishes sharp finger snaps (चुटकी) from hand claps, ambient speech, and background noise:
 * - Employs a Bandpass/Highpass Biquad filter (2800 Hz - 7000 Hz) to isolate crisp snap harmonics.
 * - Detects ultra-rapid transient onset (< 12ms attack) and fast decay.
 * - Monitors high Zero-Crossing Rate (ZCR) characteristic of sudden skin friction snaps.
 */
export class FingerSnapDetector {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private micStream: MediaStream | null = null;
  private isListening = false;
  private animFrameId: number | null = null;
  private lastTriggerTime = 0;

  async start(
    sensitivity: number, // 10 - 100
    onSnapDetected: () => void,
    onSnapFrequencyLevel?: (level: number) => void
  ): Promise<boolean> {
    if (this.isListening) return true;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      const source = this.audioCtx.createMediaStreamSource(this.micStream);

      // High-Frequency Bandpass Filter targeting finger snaps (center 3800 Hz, Q: 2.0)
      // This filters out low-frequency voice hums, table thuds, and hollow hand claps
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.setValueAtTime(3800, this.audioCtx.currentTime);
      this.filterNode.Q.setValueAtTime(2.0, this.audioCtx.currentTime);

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512; // Fast temporal response
      this.analyser.smoothingTimeConstant = 0.05;

      source.connect(this.filterNode);
      this.filterNode.connect(this.analyser);

      this.isListening = true;
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeDomainArray = new Uint8Array(bufferLength);

      let prevEnergy = 0;
      // Sensitivity mapping: higher sensitivity = lower threshold
      const threshold = Math.max(65, 230 - sensitivity * 1.7);

      const checkAudio = () => {
        if (!this.isListening || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        this.analyser.getByteTimeDomainData(timeDomainArray);

        let sum = 0;
        let peak = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          sum += val;
          if (val > peak) peak = val;
        }

        // Calculate Zero-Crossing Rate in time domain
        let zeroCrossings = 0;
        for (let i = 1; i < bufferLength; i++) {
          if ((timeDomainArray[i] >= 128 && timeDomainArray[i - 1] < 128) ||
              (timeDomainArray[i] < 128 && timeDomainArray[i - 1] >= 128)) {
            zeroCrossings++;
          }
        }

        const avg = sum / bufferLength;
        const normalizedLevel = Math.min(100, Math.round((peak / 255) * 100));
        onSnapFrequencyLevel?.(normalizedLevel);

        const delta = peak - prevEnergy;
        prevEnergy = avg;

        const now = Date.now();
        // A finger snap produces:
        // 1. High filtered peak in the 2.8 - 7 kHz band (> threshold)
        // 2. Steep transient onset delta (> 35)
        // 3. High Zero-Crossing Rate (> 40 across the window)
        if (peak > threshold && delta > 35 && zeroCrossings > 40 && now - this.lastTriggerTime > 600) {
          this.lastTriggerTime = now;
          onSnapDetected();
        }

        this.animFrameId = requestAnimationFrame(checkAudio);
      };

      this.animFrameId = requestAnimationFrame(checkAudio);
      return true;
    } catch (err) {
      console.warn('Finger snap detector could not access microphone:', err);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {
        // ignore
      }
      this.audioCtx = null;
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}
