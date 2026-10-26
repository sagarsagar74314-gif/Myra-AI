import React, { useState } from 'react';
import {
  Settings,
  Mic,
  Volume2,
  Globe2,
  Shield,
  Smartphone,
  Brain,
  Sliders,
  Moon,
  Sun,
  X,
  Trash2,
  Sparkles,
  Search,
  Check,
  RotateCcw,
  Info,
  Radio,
  Wifi,
  Bluetooth,
  Flashlight,
  Camera,
  Phone,
  MessageSquare,
  Lock,
} from 'lucide-react';
import {
  SettingsState,
  MobileState,
  Language,
  PermissionsState,
} from '../types';

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onUpdateSettings: (updater: (prev: SettingsState) => SettingsState) => void;
  mobileState: MobileState;
  onUpdateMobileState: (updater: (prev: MobileState) => MobileState) => void;
  onOpenPermissionManager: () => void;
  onOpenDevStatus: () => void;
  onClearChat: () => void;
}

type TabType = 'general' | 'voice' | 'chat' | 'mobile' | 'security' | 'memory' | 'about';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  mobileState,
  onUpdateMobileState,
  onOpenPermissionManager,
  onOpenDevStatus,
  onClearChat,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [newMemoryNote, setNewMemoryNote] = useState('');

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'general', label: '1. मुख्य जानकारी', icon: <Info className="w-4 h-4" /> },
    { id: 'voice', label: '2. आवाज़ सेटिंग्स', icon: <Mic className="w-4 h-4" /> },
    { id: 'chat', label: '3. चैट व AI इंजन', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'mobile', label: '4. मोबाइल कंट्रोल', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'security', label: '5. सुरक्षा व प्राइवेसी', icon: <Shield className="w-4 h-4" /> },
    { id: 'memory', label: '6. AI मेमोरी', icon: <Brain className="w-4 h-4" /> },
    { id: 'about', label: '7. सहायता व परिचय', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleAddMemoryNote = () => {
    if (!newMemoryNote.trim()) return;
    onUpdateSettings((prev) => ({
      ...prev,
      memory: {
        ...prev.memory,
        notes: [...prev.memory.notes, newMemoryNote.trim()],
      },
    }));
    setNewMemoryNote('');
  };

  const handleDeleteMemoryNote = (index: number) => {
    onUpdateSettings((prev) => ({
      ...prev,
      memory: {
        ...prev.memory,
        notes: prev.memory.notes.filter((_, i) => i !== index),
      },
    }));
  };

  const handleClearAllMemory = () => {
    if (confirm('क्या आप सचमुच Myra AI की सभी सेव की गई यादें मिटाना चाहते हैं?')) {
      onUpdateSettings((prev) => ({
        ...prev,
        memory: {
          name: '',
          city: '',
          notes: [],
        },
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white flex flex-col h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Myra AI — पूर्ण सेटिंग्स फ़ॉर्म (Complete Settings)
              </h2>
              <p className="text-[11px] text-indigo-400">
                Personal AI Assistant Settings Hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex overflow-x-auto gap-1.5 p-2 bg-slate-950/60 border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" /> 1. AI की मुख्य जानकारी (Core AI Info)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">AI का नाम</span>
                    <span className="font-bold text-white text-sm">Myra AI (मायरा एआई)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">प्लेटफ़ॉर्म</span>
                    <span className="font-bold text-indigo-400 text-sm">Android Mobile</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">AI का प्रकार</span>
                    <span className="font-bold text-white text-sm">Personal AI Assistant</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">AI का उद्देश्य</span>
                    <span className="font-bold text-white text-sm">
                      मोबाइल पर व्यक्तिगत सहायक के रूप में काम करना
                    </span>
                  </div>
                </div>
              </div>

              {/* Language Selection */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-purple-400" /> भाषा चयन (Language Selection)
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  मुख्य भाषा: हिंदी (Hindi) | अतिरिक्त भाषाएँ: अंग्रेज़ी (English), उर्दू (Urdu)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Hindi', 'English', 'Urdu'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          language: lang,
                        }))
                      }
                      className={`p-3 rounded-xl border text-center transition-all ${
                        settings.language === lang
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold ring-2 ring-indigo-500/40'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-sm">
                        {lang === 'Hindi' ? 'हिंदी' : lang === 'English' ? 'English' : 'اردو'}
                      </span>
                      <span className="text-[10px] text-slate-400">{lang}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input & Output Modes */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">आवाज़ से कंट्रोल (Voice Control)</h5>
                    <p className="text-[11px] text-slate-400">माइक्रोफ़ोन से बोलकर सवाल पूछें</p>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        voiceAssistantEnabled: !prev.voiceAssistantEnabled,
                      }))
                    }
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                      settings.voiceAssistantEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.voiceAssistantEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">बोलकर जवाब देना (Spoken Response)</h5>
                    <p className="text-[11px] text-slate-400">Myra AI टेक्स्ट के साथ आवाज़ में भी उत्तर देगी</p>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        spokenResponse: !prev.spokenResponse,
                      }))
                    }
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                      settings.spokenResponse ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.spokenResponse ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Voice Settings */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-400" /> 2. AI की आवाज़ की सेटिंग (Voice Settings)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Speech Recognition एवं Gemini Text-to-Speech नियंत्रण
                </p>

                <div className="space-y-4">
                  {/* Voice Speed Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300">आवाज़ की गति (Voice Speed)</span>
                      <span className="text-indigo-400 font-mono font-bold">{settings.voiceSpeed}x</span>
                    </div>
                    <div className="flex gap-2">
                      {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              voiceSpeed: spd,
                            }))
                          }
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                            settings.voiceSpeed === spd
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd === 1.0 ? 'Normal (1.0x)' : `${spd}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300">आवाज़ की वॉल्यूम (Voice Volume)</span>
                      <span className="text-indigo-400 font-mono font-bold">{settings.voiceVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.voiceVolume}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          voiceVolume: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Persona Selection */}
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Myra Voice Persona (आवाज़ शैली)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Puck' as const, name: 'Puck (पक - Boy Voice)', desc: 'Cute Anime Boy (बॉस)' },
                        { id: 'Kore' as const, name: 'Kore (कोरे)', desc: 'Friendly Warm' },
                        { id: 'Zephyr' as const, name: 'Zephyr (ज़ेफिर)', desc: 'Calm Clear' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              voicePersona: p.id,
                            }))
                          }
                          className={`p-2.5 rounded-xl border text-left ${
                            settings.voicePersona === p.id
                              ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continuous Listening Notice */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">बिना अनुमति लगातार सुनना (Always-on mic)</h5>
                      <p className="text-[11px] text-slate-400">
                        गोपनीयता नीति: डिफ़ॉल्ट रूप से OFF (केवल बटन दबाने पर सुनती है)
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          continuousListening: !prev.continuousListening,
                        }))
                      }
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                        settings.continuousListening ? 'bg-amber-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.continuousListening ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Chat Settings */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> 3. AI चैट सेटिंग (Chat Settings)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  सवालों के जवाब, सामान्य ज्ञान, गणित व पढ़ाई, कोड लिखना, हिंदी अनुवाद एवं इंटरनेट खोज
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-cyan-400" /> इंटरनेट से नई जानकारी खोजना (Live Search Grounding)
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        ताज़ा समाचार, मौसम और लाइव तथ्यों के लिए Google Search का उपयोग करें
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          searchEnabled: !prev.searchEnabled,
                        }))
                      }
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                        settings.searchEnabled ? 'bg-cyan-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.searchEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-white">बातचीत मिटाना (Clear Chat)</h5>
                      <p className="text-[11px] text-slate-400">वर्तमान बातचीत के सभी संदेश साफ़ करें</p>
                    </div>
                    <button
                      onClick={onClearChat}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> मिटाएँ
                    </button>
                  </div>
                </div>
              </div>

              {/* Supported AI features checklist */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  समर्थित AI क्षमताएँ:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900">
                    <Check className="w-4 h-4 text-emerald-400" /> सवालों के सटीक जवाब
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900">
                    <Check className="w-4 h-4 text-emerald-400" /> सामान्य ज्ञान (GK)
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900">
                    <Check className="w-4 h-4 text-emerald-400" /> गणित व पढ़ाई सहायता
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900">
                    <Check className="w-4 h-4 text-emerald-400" /> कोड लिखना (Code Writer)
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900">
                    <Check className="w-4 h-4 text-emerald-400" /> हिंदी से अंग्रेज़ी अनुवाद
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900">
                    <Check className="w-4 h-4 text-emerald-400" /> संदेश कॉपी करने की सुविधा
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Mobile Control Settings */}
          {activeTab === 'mobile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" /> 4. मोबाइल कंट्रोल सेटिंग (Device Controls)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Android सिस्टम सीमाओं के अनुसार Flashlight, Volume, Brightness, Wi-Fi, Bluetooth
                </p>

                <div className="space-y-4">
                  {/* Flashlight toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Flashlight className={`w-5 h-5 ${mobileState.flashlight ? 'text-amber-400' : 'text-slate-400'}`} />
                      <div>
                        <h5 className="text-xs font-bold text-white">Flashlight Control (टॉर्च)</h5>
                        <span className="text-[10px] text-slate-400">
                          {mobileState.flashlight ? 'वर्तमान स्थिति: चालू (ON)' : 'वर्तमान स्थिति: बंद (OFF)'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateMobileState((prev) => ({
                          ...prev,
                          flashlight: !prev.flashlight,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        mobileState.flashlight
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {mobileState.flashlight ? 'Turn OFF' : 'Turn ON'}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-blue-400" /> Volume Control (सिस्टम वॉल्यूम)
                      </span>
                      <span className="text-blue-400 font-mono font-bold">{mobileState.volume}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={mobileState.volume}
                      onChange={(e) =>
                        onUpdateMobileState((prev) => ({
                          ...prev,
                          volume: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {/* Brightness Slider */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Sun className="w-4 h-4 text-amber-400" /> Brightness Control (स्क्रीन चमक)
                      </span>
                      <span className="text-amber-400 font-mono font-bold">{mobileState.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={mobileState.brightness}
                      onChange={(e) =>
                        onUpdateMobileState((prev) => ({
                          ...prev,
                          brightness: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* Wi-Fi & Bluetooth */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className={`w-4 h-4 ${mobileState.wifi ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-semibold">Wi-Fi</span>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateMobileState((prev) => ({
                            ...prev,
                            wifi: !prev.wifi,
                          }))
                        }
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                          mobileState.wifi ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {mobileState.wifi ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bluetooth className={`w-4 h-4 ${mobileState.bluetooth ? 'text-blue-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-semibold">Bluetooth</span>
                      </div>
                      <button
                        onClick={() =>
                          onUpdateMobileState((prev) => ({
                            ...prev,
                            bluetooth: !prev.bluetooth,
                          }))
                        }
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                          mobileState.bluetooth ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {mobileState.bluetooth ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Security & Privacy */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" /> 5. सुरक्षा और प्राइवेसी (Security & Privacy)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  उपयोगकर्ता की अनुमति के बिना संवेदनशील क्रियाओं पर पूर्ण प्रतिबंध
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-white">
                        संवेदनशील कार्यों से पहले पुष्टि (Require Confirmation)
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        कॉल करने, मैसेज भेजने या महत्वपूर्ण सेटिंग्स बदलने से पहले उपयोगकर्ता की स्वीकृति मांगें
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          requireActionConfirmation: !prev.requireActionConfirmation,
                        }))
                      }
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                        settings.requireActionConfirmation ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.requireActionConfirmation ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Intrusion Guard quick toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-white">
                        फ़ोन सुरक्षा गार्ड (Intrusion & Touch Guard)
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        फ़ोन को हिलाने या छूने पर सायरन और घुसपैठिए की वॉइस चेतावनी
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateMobileState((prev) => ({
                          ...prev,
                          isIntrusionArmed: !prev.isIntrusionArmed,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        mobileState.isIntrusionArmed
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {mobileState.isIntrusionArmed ? 'ARMED' : 'OFF'}
                    </button>
                  </div>

                  {/* Acoustic Clap Detector quick toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-white">
                        ताली व ध्वनि पहचान (Acoustic Clap Trigger)
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        ताली बजाने पर स्वतः माइक खोलकर वॉइस असिस्टेंट वेक-अप
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateMobileState((prev) => ({
                          ...prev,
                          isClapDetectorActive: !prev.isClapDetectorActive,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        mobileState.isClapDetectorActive
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {mobileState.isClapDetectorActive ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">Permissions Manager</h5>
                      <p className="text-[11px] text-slate-400">
                        Microphone, Camera, Contacts, Location, Notifications अनुमतियाँ प्रबंधित करें
                      </p>
                    </div>
                    <button
                      onClick={onOpenPermissionManager}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-semibold"
                    >
                      अनुमतियाँ देखें
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                    <span className="font-bold text-slate-200 block">गोपनीयता नीति नियम (Privacy Rules):</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                      <li>उपयोगकर्ता की अनुमति के बिना संदेश न भेजना</li>
                      <li>उपयोगकर्ता की पुष्टि के बिना कॉल न करना</li>
                      <li>पासवर्ड और OTP को कभी भी स्टोर या प्रोसेस न करना</li>
                      <li>निजी जानकारी को अनावश्यक रूप से स्टोर न करना</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Memory Settings */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" /> 6. AI की मेमोरी सेटिंग (AI Memory & Profile)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  उपयोगकर्ता की पसंद याद रखना, पुरानी बातचीत देखना व डेटा मिटाना
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-white">बातचीत याद रखना (AI Memory)</h5>
                      <p className="text-[11px] text-slate-400">
                        Myra AI आपकी पसंद, नाम और प्राथमिकताओं को याद रखेगी
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          memoryEnabled: !prev.memoryEnabled,
                        }))
                      }
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                        settings.memoryEnabled ? 'bg-purple-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.memoryEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium block mb-1">
                        आपका नाम (Your Name)
                      </label>
                      <input
                        type="text"
                        placeholder="जैसे: सागर"
                        value={settings.memory.name}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            memory: { ...prev.memory, name: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium block mb-1">
                        शहर / स्थान (City)
                      </label>
                      <input
                        type="text"
                        placeholder="जैसे: दिल्ली / मुंबई"
                        value={settings.memory.city}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            memory: { ...prev.memory, city: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Custom Memory Facts */}
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      याद रखने योग्य बातें (Saved Facts & Preferences)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="नई बात जोड़ें (उदा: मुझे विज्ञान और कोडिंग पसंद है)..."
                        value={newMemoryNote}
                        onChange={(e) => setNewMemoryNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMemoryNote()}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleAddMemoryNote}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                      >
                        जोड़ें
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {settings.memory.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300"
                        >
                          <span className="truncate flex-1">{note}</span>
                          <button
                            onClick={() => handleDeleteMemoryNote(idx)}
                            className="p-1 text-slate-400 hover:text-rose-400 ml-2"
                            title="मिटाएँ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {settings.memory.notes.length === 0 && (
                        <p className="text-[11px] text-slate-500 italic p-2">कोई अतिरिक्त यादें सेव नहीं हैं।</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleClearAllMemory}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> सभी सेव की गई जानकारी मिटाएँ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: About & Engineering */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" /> 7. सहायता एवं Myra AI के बारे में (About)
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Myra AI भारत व वैश्विक उपयोगकर्ताओं के लिए तैयार की गई अगली पीढ़ी की Android AI सहायक है,
                  जो हिंदी, अंग्रेज़ी और उर्दू में सहज बातचीत के साथ डिवाइस नियंत्रण को जोड़ती है।
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">12-स्टेप डेवलपमेंट चेकलिस्ट & APK विवरण</h5>
                      <p className="text-[11px] text-slate-400">Kotlin & Jetpack Compose कोड तथा आर्किटेक्चर</p>
                    </div>
                    <button
                      onClick={onOpenDevStatus}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                    >
                      चेकलिस्ट देखें
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">फ़ोन फ्रेम मोड (Smartphone Mockup Frame)</h5>
                      <p className="text-[11px] text-slate-400">
                        Android स्मार्टफोन केस में देखें या फ़ुल-स्क्रीन विंडो मोड में स्विच करें
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          phoneFrameMode: !prev.phoneFrameMode,
                        }))
                      }
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold ${
                        settings.phoneFrameMode
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {settings.phoneFrameMode ? 'Phone Frame ON' : 'Edge-to-Edge ON'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <p>संस्करण: <span className="text-white font-mono">Myra AI v1.0.0 (Android Edition)</span></p>
                    <p>AI इंजन: <span className="text-indigo-400 font-mono">Gemini 3.8 Flash + Live Search</span></p>
                    <p>डेवलपर ईमेल: <span className="text-purple-400 font-mono">sagarff627@gmail.com</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Myra AI Android Settings Panel</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30"
          >
            सेटिंग्स सहेजें (Save & Close)
          </button>
        </div>
      </div>
    </div>
  );
};
