import React from 'react';
import { Mic, MicOff, Volume2, X, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  transcript: string;
  response: string;
  onToggleListening: () => void;
  language: Language;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  isListening,
  isSpeaking,
  isThinking,
  transcript,
  response,
  onToggleListening,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-6 text-white animate-in slide-in-from-bottom duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Myra Voice Assistant</h3>
            <span className="text-[10px] text-slate-400">{language} Voice Engine</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Voice Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
        {/* Glowing Orb */}
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 flex items-center justify-center animate-orb-glow shadow-2xl">
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Dynamic Soundwaves */}
              <div className="flex items-center gap-2 h-16">
                {[0.2, 0.5, 0.9, 0.4, 0.7, 1.1, 0.6, 0.3].map((delay, idx) => (
                  <span
                    key={idx}
                    className={`w-2 rounded-full transition-all ${
                      isListening
                        ? 'bg-gradient-to-t from-rose-500 to-amber-400'
                        : isSpeaking
                        ? 'bg-gradient-to-t from-emerald-400 to-indigo-400'
                        : 'bg-indigo-500/50'
                    } ${isListening || isSpeaking ? 'voice-wave-bar' : 'h-3'}`}
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Subtitles & Transcripts */}
        <div className="max-w-md space-y-3 px-2">
          {transcript && (
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm font-medium text-slate-200">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                आपकी आवाज़ (You Said):
              </span>
              "{transcript}"
            </div>
          )}

          {isThinking && (
            <p className="text-xs text-indigo-300 font-semibold animate-pulse flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> मायरा सोच रहा है बॉस...
            </p>
          )}

          {response && (
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-700/50 text-sm text-white font-medium shadow-lg">
              <span className="text-[10px] uppercase font-bold text-purple-300 block mb-0.5 flex items-center justify-center gap-1">
                <Volume2 className="w-3 h-3 text-purple-400" /> मायरा का उत्तर:
              </span>
              {response}
            </div>
          )}

          {!transcript && !response && !isThinking && (
            <p className="text-sm text-slate-300 font-medium">
              हाँ जी बॉस! मायरा हाज़िर है। नीचे माइक बटन दबाकर बोलिए!
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onToggleListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-500 text-white ring-8 ring-rose-600/30 animate-pulse'
              : 'bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white ring-8 ring-indigo-600/20'
          }`}
          title={isListening ? 'सुनना रोकें' : 'बोलना शुरू करें'}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <p className="text-xs text-slate-400">
          {isListening ? 'मायरा सुन रहा है बॉस... (टैप करें रोकने के लिए)' : 'बोलने के लिए माइक दबाएँ'}
        </p>
      </div>
    </div>
  );
};
