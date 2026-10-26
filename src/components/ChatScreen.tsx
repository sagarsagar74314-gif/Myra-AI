import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Trash2,
  Plus,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Smartphone,
  Search,
} from 'lucide-react';
import { ChatMessage, Language } from '../types';

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isVoice?: boolean) => void;
  onNewChat: () => void;
  onClearChat: () => void;
  onPlaySpeech: (text: string) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isThinking: boolean;
  language: Language;
  searchEnabled: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSendMessage,
  onNewChat,
  onClearChat,
  onPlaySpeech,
  isListening,
  onStartListening,
  onStopListening,
  isThinking,
  language,
  searchEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: '👏 ताली पहचान ऑन करो', text: 'मायरा, ताली पहचान (Clap Detector) ऑन करो' },
    { label: '🛡️ सुरक्षा गार्ड चालू करो', text: 'मायरा, फ़ोन सुरक्षा गार्ड और इंट्रूजन अलार्म चालू करो' },
    { label: '📍 मेरी लोकेशन बताओ', text: 'मायरा, हाई-एक्यूरेसी GPS से मेरी ताज़ा लोकेशन बताओ' },
    { label: '⚡ Kotlin कोड दिखाओ', text: 'मायरा, Jetpack Compose बैकग्राउंड सर्विसेज का Kotlin कोड दिखाओ' },
    { label: '🔦 टॉर्च जलाओ', text: 'मायरा, टॉर्च ऑन करो' },
    { label: '🌐 वेबसाइट जनरेट करो', text: 'मायरा, एक मॉडर्न पोर्टफोलियो वेबसाइट का कोड बनाओ' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Action Bar */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> नई चैट
          </button>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {language} Mode
          </span>
          {searchEnabled && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 flex items-center gap-1">
              <Search className="w-2.5 h-2.5" /> Search Grounded
            </span>
          )}
        </div>

        <button
          onClick={onClearChat}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="बातचीत मिटाएँ (Clear Chat)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 shadow-xl shadow-indigo-600/10">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Myra AI के साथ बातचीत शुरू करें
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              आप हिंदी, अंग्रेज़ी या उर्दू में बात कर सकते हैं। सवाल पूछें, डिवाइस कंट्रोल करें या कोड लिखवाएँ।
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(q.text, false)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-300 transition-all active:scale-95 text-left"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {/* Sender badge */}
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                    <span className="font-semibold flex items-center gap-1">
                      {isUser ? 'आप (You)' : 'Myra AI (मायरा)'}
                      {msg.isVoice && <Mic className="w-2.5 h-2.5 text-indigo-300" />}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Device Action Badge if triggered */}
                  {msg.detectedAction && (
                    <div className="my-1.5 p-2 rounded-xl bg-indigo-950/70 border border-indigo-700/50 text-[11px] text-indigo-200 flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>
                        Android Action: <b>{msg.detectedAction.type}</b>{' '}
                        {JSON.stringify(msg.detectedAction.payload)}
                      </span>
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>

                  {/* Grounding Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                      <span className="font-bold text-cyan-400 block mb-1">वेब स्रोत (Web Sources):</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {msg.citations.map((c, i) => (
                          <li key={i} className="truncate text-slate-300">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Message Action Bar (Copy & Speak) */}
                <div
                  className={`flex items-center gap-1 mt-1 px-1 transition-opacity ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] flex items-center gap-1"
                    title="संदेश कॉपी करें"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> कॉपी हो गया
                      </>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>

                  {!isUser && (
                    <button
                      onClick={() => onPlaySpeech(msg.text)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] flex items-center gap-1"
                      title="आवाज़ में सुनें"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-start gap-2 animate-in fade-in">
            <div className="p-3.5 rounded-2xl rounded-bl-xs bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 font-medium ml-1">
                मायरा सोच रहा है...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          {/* Voice Input Button */}
          <button
            onClick={isListening ? onStopListening : onStartListening}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title={isListening ? 'सुनना बंद करें' : 'बोलकर संदेश दें'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={isListening ? 'मायरा सुन रहा है, बोलिए बॉस...' : 'बॉस, मायरा से कुछ भी पूछें...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center"
            title="भेजें"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
