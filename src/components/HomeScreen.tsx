import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
} from 'lucide-react';
import { MobileState, SettingsState } from '../types';

interface HomeScreenProps {
  onStartVoice: () => void;
  onOpenChat: () => void;
  onOpenSettings?: () => void;
  onOpenAppDrawer?: () => void;
  onOpenPermissions?: () => void;
  onOpenPhoneControl?: () => void;
  onOpenWebStudio?: () => void;
  onOpenFileManager?: () => void;
  onOpenAdvancedFeatures?: () => void;
  onOpenKotlinStudio?: () => void;
  mobileState: MobileState;
  onToggleFlashlight?: () => void;
  onLaunchApp?: (appId: string) => void;
  settings: SettingsState;
  onQuickPrompt: (prompt: string) => void;
  isListening: boolean;
  isSpeaking: boolean;
  statusText: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartVoice,
  onOpenChat,
  onOpenAdvancedFeatures,
  onOpenKotlinStudio,
  settings,
  onQuickPrompt,
  isListening,
  isSpeaking,
  statusText,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickPrompt(quickInput.trim());
    setQuickInput('');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 overflow-hidden relative bg-gradient-to-b from-slate-950 via-[#0b102b] to-[#070a1e] text-white">
      {/* Background ambient neon glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

      {/* Sleek Minimalist Brand Header - Zero clutter, no shortcut buttons */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-2 pb-1 text-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
            MYRA AI
          </h1>
        </div>
      </div>

      {/* Central Prominent Voice Orb with Smooth Multi-Colored Rotating Glow */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto py-6">
        <div className="relative flex items-center justify-center">
          {/* Ambient Rotating Multi-Color Aurora Glow (Diffuse Lighting) */}
          <div
            className={`absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full pointer-events-none transition-all duration-700 animate-multicolor-glow ${
              isListening || isSpeaking ? 'animate-spin-smooth-fast scale-110' : 'animate-spin-smooth'
            }`}
            style={{
              background:
                'conic-gradient(from 0deg, #06b6d4, #3b82f6, #8b5cf6, #d946ef, #f43f5e, #f59e0b, #10b981, #06b6d4)',
              filter: 'blur(32px)',
            }}
          />

          {/* Secondary Counter-Rotating Orbital Ring */}
          <div
            className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-dashed border-indigo-400/30 pointer-events-none animate-spin-reverse"
            style={{ opacity: 0.6 }}
          />

          {/* Smooth Rotating Circular Multi-Colored Neon Ring */}
          <div
            className={`absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full p-[3px] pointer-events-none transition-all duration-500 ${
              isListening || isSpeaking ? 'animate-spin-smooth-fast' : 'animate-spin-smooth'
            }`}
            style={{
              background:
                'conic-gradient(from 0deg, #22d3ee, #6366f1, #a855f7, #ec4899, #f43f5e, #fbbf24, #34d399, #22d3ee)',
            }}
          >
            {/* Dark spacer to give sharp high-contrast ring definition */}
            <div className="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-md" />
          </div>

          {/* Dynamic Pulse Waves When Active */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute w-56 h-56 rounded-full border border-pink-400/50 animate-ping opacity-60 pointer-events-none" />
              <div
                className="absolute w-64 h-64 rounded-full border border-cyan-400/40 animate-pulse pointer-events-none"
                style={{ animationDuration: '2s' }}
              />
            </>
          )}

          {/* The Hero Central Voice Orb Button */}
          <button
            onClick={onStartVoice}
            className={`relative z-20 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 ring-4 ring-rose-400/40 shadow-rose-500/60 scale-105'
                : isSpeaking
                ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 ring-4 ring-emerald-400/40 shadow-cyan-500/60 scale-105'
                : 'bg-gradient-to-b from-slate-900/90 via-indigo-950/95 to-slate-950 border border-white/20 hover:border-white/40 shadow-[0_0_35px_rgba(99,102,241,0.4)] hover:shadow-[0_0_55px_rgba(168,85,247,0.6)] group'
            }`}
            aria-label="Myra से बात करने के लिए टैप करें"
          >
            {/* Subtle inner glass highlight */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Center animated visualizer or mic icon */}
            {isSpeaking ? (
              <div className="flex items-center gap-1.5 h-12 z-10">
                {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9].map((delay, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-white rounded-full animate-bounce shadow-sm"
                    style={{
                      height: '28px',
                      animationDelay: `${delay}s`,
                      animationDuration: '0.8s',
                    }}
                  />
                ))}
              </div>
            ) : isListening ? (
              <MicOff className="w-14 h-14 text-white animate-pulse z-10 drop-shadow-lg" />
            ) : (
              <Mic className="w-14 h-14 sm:w-16 sm:h-16 text-white group-hover:scale-105 transition-transform duration-300 z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Minimalist Chat Option */}
      <div className="relative z-10 pt-2 pb-1">
        <form onSubmit={handleQuickSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="बॉस, यहाँ कुछ भी पूछें या हुक्म दें..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
            aria-label="संदेश भेजें"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
