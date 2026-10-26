import { Language } from '../types';

// Speech Recognition helper
export class SpeechManager {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  isAvailable(): boolean {
    return !!this.recognition;
  }

  startListening(
    language: Language,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('आपके ब्राउज़र में Speech Recognition समर्थित नहीं है।');
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    let langCode = 'hi-IN';
    if (language === 'English') langCode = 'en-IN';
    if (language === 'Urdu') langCode = 'ur-PK';

    this.recognition.lang = langCode;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      if (text) {
        onResult(text, !!final);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech Recognition error:', event.error);
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      onError(err.message || 'Microphone error');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }
}

// Text to speech audio playback (either from Gemini TTS base64 or Web SpeechSynthesis)
export async function speakText(
  text: string,
  options: {
    language: Language;
    speed: number;
    volume: number;
    voicePersona?: string;
  }
): Promise<void> {
  // Try server Gemini TTS first for crisp natural human quality
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceName: options.voicePersona || 'Puck',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        await playBase64Audio(data.audioBase64, options.volume);
        return;
      }
    }
  } catch (err) {
    console.warn('Gemini TTS failed, using browser SpeechSynthesis fallback:', err);
  }

  // Fallback to browser SpeechSynthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    // Clean text of markdown and actions
    const clean = text
      .replace(/\[\[ACTION:.*?\]\]/g, '')
      .replace(/```[\s\S]*?```/g, 'यहाँ कोड दिया गया है')
      .replace(/\(.*?\)/g, '')
      .replace(/[*#_~`>]/g, '')
      .slice(0, 400);

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.pitch = 1.25; // Youthful, cute anime-style pitch
    utterance.rate = (options.speed || 1.0) * 1.02;
    utterance.volume = options.volume / 100;

    let targetLang = 'hi-IN';
    if (options.language === 'English') targetLang = 'en-IN';
    if (options.language === 'Urdu') targetLang = 'ur-PK';

    utterance.lang = targetLang;

    // Pick a voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (v) => v.lang.startsWith(targetLang.slice(0, 2)) || v.name.toLowerCase().includes('hindi')
    );
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

// Play base64 WAV audio from Gemini TTS
export function playBase64Audio(base64: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64}`);
      audio.volume = Math.max(0, Math.min(1, volume / 100));
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

// Hardware Torch Controller (WebRTC MediaTrack torch API)
let torchTrack: MediaStreamTrack | null = null;
export async function toggleHardwareTorch(state: boolean): Promise<boolean> {
  try {
    if (state) {
      if (!torchTrack) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        torchTrack = stream.getVideoTracks()[0];
      }
      const capabilities = (torchTrack as any)?.getCapabilities?.();
      if (capabilities && (capabilities as any).torch) {
        await (torchTrack as any).applyConstraints({
          advanced: [{ torch: true }],
        });
        return true;
      }
    } else {
      if (torchTrack) {
        try {
          await (torchTrack as any).applyConstraints({
            advanced: [{ torch: false }],
          });
          torchTrack.stop();
        } catch (e) {
          // ignore
        }
        torchTrack = null;
      }
    }
  } catch (err) {
    console.log('Hardware torch constraint not available in this environment, using virtual torch');
  }
  return false;
}
