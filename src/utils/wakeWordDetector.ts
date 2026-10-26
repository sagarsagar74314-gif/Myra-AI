/**
 * WakeWordDetector
 * Continuous background hotword/wake-word listener for 'मायरा' / 'Myra'.
 * Runs continuously in background to wake up assistant without opening app interface.
 */
export class WakeWordDetector {
  private recognition: any = null;
  private isRunning = false;
  private onWakeWord: (remainderCommand?: string) => void = () => {};
  private onStatusChange?: (status: string) => void;
  private restartTimeout: any = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'hi-IN';
        this.recognition.maxAlternatives = 3;

        this.recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim().toLowerCase();

            // Check if hotword 'मायरा' or phonetic equivalents are present
            const hotwords = ['मायरा', 'मायरा!', 'myra', 'mayra', 'maira', 'aira', 'mira', 'महिरा', 'मैरा'];
            const containsHotword = hotwords.some((hw) => transcript.includes(hw));

            if (containsHotword) {
              // Extract any following command if user spoke "मायरा टॉर्च जलाओ"
              let remainder = '';
              for (const hw of hotwords) {
                if (transcript.includes(hw)) {
                  const parts = transcript.split(hw);
                  if (parts.length > 1 && parts[1].trim().length > 0) {
                    remainder = parts[1].trim();
                  }
                  break;
                }
              }

              this.onWakeWord(remainder || undefined);
              break;
            }
          }
        };

        this.recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.warn('WakeWord recognition error:', event.error);
          }
        };

        this.recognition.onend = () => {
          if (this.isRunning) {
            // Auto restart to maintain 24/7 background listener
            clearTimeout(this.restartTimeout);
            this.restartTimeout = setTimeout(() => {
              if (this.isRunning) {
                try {
                  this.recognition?.start();
                } catch (e) {
                  // ignore
                }
              }
            }, 500);
          }
        };
      } catch (err) {
        console.warn('SpeechRecognition failed to construct:', err);
      }
    }
  }

  start(onWakeWord: (remainder?: string) => void, onStatusChange?: (status: string) => void): boolean {
    if (!this.recognition) return false;
    this.onWakeWord = onWakeWord;
    this.onStatusChange = onStatusChange;
    this.isRunning = true;

    try {
      this.recognition.start();
      this.onStatusChange?.('सक्रिय (Wake-word Active)');
      return true;
    } catch (e) {
      console.warn('WakeWord start error:', e);
      return false;
    }
  }

  stop() {
    this.isRunning = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.onStatusChange?.('निष्क्रिय (Inactive)');
  }

  isActive(): boolean {
    return this.isRunning;
  }
}
