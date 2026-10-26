import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Radio,
  MapPin,
  HeartHandshake,
  Layers,
  Moon,
  Sun,
  X,
  Volume2,
  Camera,
  Compass,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  Activity,
  Code2,
} from 'lucide-react';
import { MobileState, HighAccuracyGpsData, IntrusionLog } from '../types';

interface AdvancedFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileState: MobileState;
  onUpdateMobileState: (updater: (prev: MobileState) => MobileState) => void;
  onTestSnap?: () => void;
  onTestClap?: () => void;
  onTestIntrusion: () => void;
  onTestProactive: () => void;
  onRefreshGps: () => void;
  onOpenKotlinStudio: () => void;
  soundLevel: number;
}

export const AdvancedFeaturesModal: React.FC<AdvancedFeaturesModalProps> = ({
  isOpen,
  onClose,
  mobileState,
  onUpdateMobileState,
  onTestSnap,
  onTestClap,
  onTestIntrusion,
  onTestProactive,
  onRefreshGps,
  onOpenKotlinStudio,
  soundLevel,
}) => {
  const [activeTab, setActiveTab] = useState<'service' | 'intrusion' | 'snap' | 'clap' | 'gps' | 'proactive'>('service');
  const [intruderNameInput, setIntruderNameInput] = useState(mobileState.intruderAlertName || 'अज्ञात व्यक्ति');

  if (!isOpen) return null;

  const handleTriggerSnapTest = onTestSnap || onTestClap || (() => {});

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">
                एडवांस्ड बैकग्राउंड व इंटेलिजेंट फीचर्स
              </h2>
              <p className="text-[11px] text-indigo-400">
                Foreground Service, Finger Snap Trigger, Intrusion Guard, High-Accuracy GPS & Proactive AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenKotlinStudio}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Kotlin Backend Source Codes"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Kotlin कोड</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex overflow-x-auto gap-1.5 p-2 bg-slate-950/60 border-b border-slate-800 text-xs">
          {[
            { id: 'service' as const, label: '1. बैकग्राउंड सेवा व स्क्रीन-ऑफ', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'intrusion' as const, label: '2. घुसपैठ व टच गार्ड', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
            { id: 'snap' as const, label: '3. 👌 चुटकी डिटेक्टर (Snap)', icon: <Radio className="w-3.5 h-3.5" /> },
            { id: 'gps' as const, label: '4. हाई-एक्यूरेसी GPS', icon: <MapPin className="w-3.5 h-3.5" /> },
            { id: 'proactive' as const, label: '5. प्रोएक्टिव AI साथी', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
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

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: Foreground Service & Screen-Off Execution */}
          {activeTab === 'service' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-200">
                    24/7 सक्रिय Foreground Service & WakeLock
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    यह सेवा Myra AI को बैकग्राउंड में हमेशा सक्रिय रखती है। फ़ोन की स्क्रीन बंद (OFF) होने पर भी
                    यह ताली की आवाज़, मोशन और घुसपैठ को निरंतर मॉनिटर करती है।
                  </p>
                </div>
              </div>

              {/* Service Toggle Card */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">Foreground Service स्थिति</h5>
                  <p className="text-xs text-slate-400">
                    {mobileState.isForegroundServiceRunning
                      ? 'सक्रिय (Active 24/7 with PARTIAL_WAKE_LOCK)'
                      : 'निष्क्रिय (Stopped)'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    onUpdateMobileState((prev) => ({
                      ...prev,
                      isForegroundServiceRunning: !prev.isForegroundServiceRunning,
                    }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    mobileState.isForegroundServiceRunning
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {mobileState.isForegroundServiceRunning ? 'चालू है (RUNNING)' : 'शुरू करें (START)'}
                </button>
              </div>

              {/* Screen Off Simulator Button */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-white flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" /> स्क्रीन ऑफ मोड (Screen-Off Simulation)
                    </h5>
                    <p className="text-xs text-slate-400">
                      स्क्रीन को डार्क/ऑफ करें और टेस्ट करें कि Myra ताली या टच पर कैसे तुरंत जागती है।
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateMobileState((prev) => ({ ...prev, isScreenOff: true }));
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <Moon className="w-4 h-4" />
                    <span>स्क्रीन ऑफ करें</span>
                  </button>
                </div>
                <div className="text-[11px] text-indigo-300/80 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-800/30">
                  ⚡ <strong>परीक्षण विधि:</strong> स्क्रीन ऑफ होने पर हाथ से ताली बजाएँ या स्क्रीन पर टैप करें। Myra स्क्रीन जगाकर बोलेगी: <em>"हाँ जी बॉस!"</em>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Intrusion Detection & Touch Monitoring */}
          {activeTab === 'intrusion' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-rose-200">
                    फ़ोन सुरक्षा एवं अनधिकृत टच डिटेक्शन
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    जब यह चालू होता है, यदि कोई भी आपके फ़ोन को उठाता है, हिलाता है या स्क्रीन को छूता है,
                    तो Myra ज़ोरदार सायरन बजाती है, फ़ोटो खींचती है और घुसपैठिए की चेतावनी बोलती है!
                  </p>
                </div>
              </div>

              {/* Arm / Disarm Switch */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white flex items-center gap-2">
                    {mobileState.isIntrusionArmed ? (
                      <Lock className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-slate-400" />
                    )}
                    <span>सुरक्षा गार्ड स्थिति (Security Guard)</span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    {mobileState.isIntrusionArmed
                      ? 'सशस्त्र (ARMED) — कोई भी स्पर्श अलार्म बजाएगा'
                      : 'अशस्त्र (DISARMED) — सामान्य मोड'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    onUpdateMobileState((prev) => ({
                      ...prev,
                      isIntrusionArmed: !prev.isIntrusionArmed,
                    }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    mobileState.isIntrusionArmed
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {mobileState.isIntrusionArmed ? 'गार्ड बंद करें' : 'गार्ड चालू करें (ARM)'}
                </button>
              </div>

              {/* Custom Intruder Name Setting */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  घुसपैठिए का नाम / संबोधन (Intruder Alert Name):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={intruderNameInput}
                    onChange={(e) => setIntruderNameInput(e.target.value)}
                    placeholder="उदा: 'अज्ञात व्यक्ति', 'चोर', या कोई नाम..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      onUpdateMobileState((prev) => ({
                        ...prev,
                        intruderAlertName: intruderNameInput.trim() || 'अज्ञात व्यक्ति',
                      }));
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                  >
                    सहेजें
                  </button>
                </div>
              </div>

              {/* Instant Test Intruder Alert */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">तत्काल घुसपैठ अलार्म का परीक्षण</h5>
                  <p className="text-xs text-slate-400">
                    तुरंत सायरन और Myra की चेतावनी वॉइस को टेस्ट करें
                  </p>
                </div>
                <button
                  onClick={onTestIntrusion}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>टेस्ट अलार्म बजाएँ</span>
                </button>
              </div>

              {/* Intrusion History Logs */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                    सुरक्षा लॉग्स (Recent Intrusion Logs - {mobileState.intrusionLogs?.length || 0})
                  </h5>
                  {mobileState.intrusionLogs?.length > 0 && (
                    <button
                      onClick={() =>
                        onUpdateMobileState((prev) => ({ ...prev, intrusionLogs: [] }))
                      }
                      className="text-[10px] text-slate-400 hover:text-rose-400"
                    >
                      लॉग्स मिटाएँ
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(!mobileState.intrusionLogs || mobileState.intrusionLogs.length === 0) ? (
                    <p className="text-xs text-slate-500 italic py-2 text-center">
                      कोई अनधिकृत गतिविधि दर्ज नहीं है। आपका फ़ोन सुरक्षित है!
                    </p>
                  ) : (
                    mobileState.intrusionLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="text-rose-400 font-bold block">{log.reason}</span>
                          <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40">
                          अलर्ट सक्रिय
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: High-Frequency Finger Snap Detector (चुटकी डिटेक्टर) */}
          {(activeTab === 'snap' || activeTab === 'clap') && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-cyan-200">
                    👌 हाई-फ़्रीक्वेंसी चुटकी डिटेक्टर (Finger Snap Acoustic Trigger)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    माइक से उँगलियों की चुटकी (Finger Snap) की 2.5kHz - 7.5kHz उच्च-आवृत्ति व तेज़ ट्रांज़िएंट अटैक को पहचानकर Myra स्वतः जाग जाती है और बातचीत शुरू करती है, बिना किसी बटन को हाथ लगाए!
                  </p>
                </div>
              </div>

              {/* Snap Detector Toggle */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">चुटकी डिटेक्टर स्थिति</h5>
                  <p className="text-xs text-slate-400">
                    {mobileState.isSnapDetectorActive
                      ? 'सक्रिय (माइक लगातार चुटकी की हाई-फ़्रीक्वेंसी ध्वनि सुन रहा है)'
                      : 'निष्क्रिय'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    onUpdateMobileState((prev) => ({
                      ...prev,
                      isSnapDetectorActive: !prev.isSnapDetectorActive,
                      isClapDetectorActive: !prev.isSnapDetectorActive,
                    }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    mobileState.isSnapDetectorActive
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {mobileState.isSnapDetectorActive ? 'सक्रिय है (ON)' : 'सक्रिय करें (OFF)'}
                </button>
              </div>

              {/* Real-Time Audio Meter */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">हाई-फ़्रीक्वेंसी बैंड स्तर (Snap 3-7kHz Filter):</span>
                  <span className="font-mono text-cyan-400 font-bold">{soundLevel}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-700 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      soundLevel > 70
                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, soundLevel)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>शांत</span>
                  <span className="text-cyan-400 font-semibold">चुटकी पहचान सीमा (~65%)</span>
                  <span>तीक्ष्ण चुटकी</span>
                </div>
              </div>

              {/* Instant Snap Simulation Button */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">चुटकी का परीक्षण (Simulate Finger Snap)</h5>
                  <p className="text-xs text-slate-400">
                    आवाज़ किए बिना भी तत्काल चुटकी ट्रिगर और ऑटो-माइक का परीक्षण करें
                  </p>
                </div>
                <button
                  onClick={handleTriggerSnapTest}
                  className="px-4 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>चुटकी बजाएँ (👌 Snap Fingers)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: High-Accuracy GPS & Location */}
          {activeTab === 'gps' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-200">
                    उच्च सटीकता GPS एवं लोकेशन सेवा
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Google FusedLocationProvider स्तर की सटीक GPS ट्रैकिंग, अल्टीट्यूड, गति (Speed)
                    और OpenStreetMap रिवर्स जियोकोडिंग से पूरा पता।
                  </p>
                </div>
              </div>

              {/* Coordinates & Address Display Card */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-400" /> लाइव GPS निर्देशांक:
                  </span>
                  <button
                    onClick={onRefreshGps}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> रीफ़्रेश करें
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">अक्षांश (Latitude)</span>
                    <span className="text-emerald-400 font-bold">
                      {mobileState.highAccuracyGps?.lat?.toFixed(5) || '28.61390'}° N
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">देशांतर (Longitude)</span>
                    <span className="text-emerald-400 font-bold">
                      {mobileState.highAccuracyGps?.lng?.toFixed(5) || '77.20900'}° E
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">सटीकता (Accuracy)</span>
                    <span className="text-indigo-400 font-bold">
                      ± {mobileState.highAccuracyGps?.accuracy || 5} मीटर
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ऊँचाई (Altitude)</span>
                    <span className="text-white font-bold">
                      {mobileState.highAccuracyGps?.altitude || 216} m
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">गति (Speed)</span>
                    <span className="text-white font-bold">
                      {mobileState.highAccuracyGps?.speed || 0} km/h
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">दिशा (Heading)</span>
                    <span className="text-white font-bold">
                      {mobileState.highAccuracyGps?.heading || 0}°
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] mb-1">
                    वर्तमान भौगोलिक पता (Reverse Geocoded Address):
                  </span>
                  <p className="text-slate-100 font-medium">
                    {mobileState.highAccuracyGps?.address || 'नई दिल्ली, दिल्ली, भारत'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Proactive AI Companion Agent */}
          {activeTab === 'proactive' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-pink-200">
                    प्रोएक्टिव AI साथी (Proactive Companion Agent)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    यह एजेंट केवल कमांड का इंतज़ार नहीं करता, बल्कि एक सच्चे प्यारे छोटे साथी की तरह
                    समय-समय पर आपकी सेहत, पानी और दिनचर्या का हालचाल पूछता है!
                  </p>
                </div>
              </div>

              {/* Proactive Agent Toggle */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">प्रोएक्टिव साथी एजेंट स्थिति</h5>
                  <p className="text-xs text-slate-400">
                    {mobileState.isProactiveAgentActive
                      ? 'सक्रिय (समय-समय पर खुद आकर बात करेगा)'
                      : 'निष्क्रिय'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    onUpdateMobileState((prev) => ({
                      ...prev,
                      isProactiveAgentActive: !prev.isProactiveAgentActive,
                    }))
                  }
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    mobileState.isProactiveAgentActive
                      ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {mobileState.isProactiveAgentActive ? 'सक्रिय है (ON)' : 'सक्रिय करें'}
                </button>
              </div>

              {/* Instant Proactive Check Test */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">तत्काल प्रोएक्टिव संदेश का परीक्षण</h5>
                  <p className="text-xs text-slate-400">
                    Myra तुरंत आपके पास आकर पानी और सेहत का हालचाल पूछेगी
                  </p>
                </div>
                <button
                  onClick={onTestProactive}
                  className="px-3.5 py-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>प्रोएक्टिव संदेश भेजो</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
