import React, { useState } from 'react';
import {
  Sliders,
  Wifi,
  WifiOff,
  Bluetooth,
  Plane,
  Radio,
  Volume2,
  VolumeX,
  Vibrate,
  Sun,
  Moon,
  Flashlight,
  Battery,
  BatteryCharging,
  Zap,
  MapPin,
  Shield,
  Smartphone,
  HardDrive,
  Trash2,
  X,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { MobileState, SoundMode } from '../types';

interface PhoneControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileState: MobileState;
  onUpdateMobileState: (updater: (prev: MobileState) => MobileState) => void;
  onOpenPermissions: () => void;
  onToggleFlashlight: (forced?: boolean) => void;
}

export const PhoneControlModal: React.FC<PhoneControlModalProps> = ({
  isOpen,
  onClose,
  mobileState,
  onUpdateMobileState,
  onOpenPermissions,
  onToggleFlashlight,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'sound' | 'display' | 'power'>('quick');

  if (!isOpen) return null;

  const playTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">System Control Center</h2>
              <p className="text-[10px] text-indigo-400">फ़ोन के सभी सिस्टम फ़ंक्शंस का पूर्ण नियंत्रण</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPermissions}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" /> अनुमतियाँ
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-2 bg-slate-950/60 border-b border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'quick' as const, label: 'क्विक टॉगल (Quick Tiles)' },
            { id: 'sound' as const, label: 'आवाज़ व वाइब्रेशन (Sound)' },
            { id: 'display' as const, label: 'डिस्प्ले व स्क्रीन (Display)' },
            { id: 'power' as const, label: 'बैटरी व स्टोरेज (Storage)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold flex-shrink-0 transition-colors ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: QUICK TILES */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* Wi-Fi Toggle */}
                <button
                  onClick={() => onUpdateMobileState((p) => ({ ...p, wifi: !p.wifi }))}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    mobileState.wifi
                      ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Wi-Fi</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mobileState.wifi ? 'MyraHome_5G' : 'बंद है (Off)'}
                    </span>
                  </div>
                  {mobileState.wifi ? <Wifi className="w-5 h-5 text-indigo-400" /> : <WifiOff className="w-5 h-5" />}
                </button>

                {/* Mobile Data 5G Toggle */}
                <button
                  onClick={() => onUpdateMobileState((p) => ({ ...p, mobileData: !p.mobileData }))}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    mobileState.mobileData
                      ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Mobile Data 5G</span>
                    <span className="text-[10px] text-slate-400">
                      {mobileState.mobileData ? 'सक्रिय (Jio 5G)' : 'बंद है (Off)'}
                    </span>
                  </div>
                  <Radio className={`w-5 h-5 ${mobileState.mobileData ? 'text-blue-400 animate-pulse' : ''}`} />
                </button>

                {/* Bluetooth Toggle */}
                <button
                  onClick={() => onUpdateMobileState((p) => ({ ...p, bluetooth: !p.bluetooth }))}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    mobileState.bluetooth
                      ? 'bg-purple-600/25 border-purple-500 text-white shadow-md shadow-purple-600/20'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Bluetooth</span>
                    <span className="text-[10px] text-slate-400">
                      {mobileState.bluetooth ? 'Earbuds Connected' : 'बंद है (Off)'}
                    </span>
                  </div>
                  <Bluetooth className={`w-5 h-5 ${mobileState.bluetooth ? 'text-purple-400' : ''}`} />
                </button>

                {/* Flashlight Toggle */}
                <button
                  onClick={() => onToggleFlashlight()}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    mobileState.flashlight
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Flashlight</span>
                    <span className="text-[10px] text-slate-400">
                      {mobileState.flashlight ? 'टॉर्च चालू है (ON)' : 'बंद है (Off)'}
                    </span>
                  </div>
                  <Flashlight className={`w-5 h-5 ${mobileState.flashlight ? 'text-amber-400 animate-pulse' : ''}`} />
                </button>

                {/* Strobe SOS Flasher */}
                <button
                  onClick={() =>
                    onUpdateMobileState((p) => ({
                      ...p,
                      strobeTorch: !p.strobeTorch,
                      flashlight: !p.strobeTorch ? true : p.flashlight,
                    }))
                  }
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    mobileState.strobeTorch
                      ? 'bg-rose-600/30 border-rose-500 text-rose-200 animate-pulse'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">SOS Strobe</span>
                    <span className="text-[10px] text-slate-400">
                      {mobileState.strobeTorch ? 'Emergency Blink' : 'फ्लैशिंग मोड'}
                    </span>
                  </div>
                  <Zap className={`w-5 h-5 ${mobileState.strobeTorch ? 'text-rose-400' : ''}`} />
                </button>

                {/* Airplane Mode */}
                <button
                  onClick={() =>
                    onUpdateMobileState((p) => ({
                      ...p,
                      airplaneMode: !p.airplaneMode,
                      wifi: !p.airplaneMode ? false : p.wifi,
                      mobileData: !p.airplaneMode ? false : p.mobileData,
                      bluetooth: !p.airplaneMode ? false : p.bluetooth,
                    }))
                  }
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    mobileState.airplaneMode
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Airplane Mode</span>
                    <span className="text-[10px] text-slate-400">
                      {mobileState.airplaneMode ? 'सक्रिय (No Signal)' : 'बंद है'}
                    </span>
                  </div>
                  <Plane className={`w-5 h-5 ${mobileState.airplaneMode ? 'text-amber-400' : ''}`} />
                </button>

                {/* Hotspot Toggle */}
                <button
                  onClick={() => onUpdateMobileState((p) => ({ ...p, hotspot: !p.hotspot }))}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    mobileState.hotspot
                      ? 'bg-teal-600/25 border-teal-500 text-white'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Hotspot</span>
                    <span className="text-[10px] text-slate-400">
                      {mobileState.hotspot ? 'Myra_Hotspot ON' : 'बंद है'}
                    </span>
                  </div>
                  <Wifi className={`w-5 h-5 ${mobileState.hotspot ? 'text-teal-400' : ''}`} />
                </button>

                {/* Battery Saver Mode */}
                <button
                  onClick={() => onUpdateMobileState((p) => ({ ...p, batterySaver: !p.batterySaver }))}
                  className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all active:scale-95 ${
                    mobileState.batterySaver
                      ? 'bg-emerald-600/25 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Battery Saver</span>
                    <span className="text-[10px] text-slate-400">
                      {mobileState.batterySaver ? 'बचत मोड सक्रिय' : 'सामान्य'}
                    </span>
                  </div>
                  <Battery className={`w-5 h-5 ${mobileState.batterySaver ? 'text-emerald-400' : ''}`} />
                </button>

                {/* Location GPS */}
                <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold block">Location GPS</span>
                    <span className="text-[10px] text-slate-400 truncate block max-w-[100px]">
                      {mobileState.locationName}
                    </span>
                  </div>
                  <MapPin className="w-5 h-5 text-rose-400" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOUND & VIBRATION */}
          {activeTab === 'sound' && (
            <div className="space-y-4">
              {/* Sound Mode Switcher */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-bold text-slate-300 block mb-2">ध्वनि प्रोफाइल (Sound Mode)</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sound' as const, label: 'रिंग (Sound)', icon: <Volume2 className="w-4 h-4 text-emerald-400" /> },
                    { id: 'vibrate' as const, label: 'वाइब्रेट (Vibrate)', icon: <Vibrate className="w-4 h-4 text-amber-400" /> },
                    { id: 'silent' as const, label: 'साइलेंट (Silent)', icon: <VolumeX className="w-4 h-4 text-rose-400" /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onUpdateMobileState((p) => ({ ...p, soundMode: m.id }));
                        if (m.id === 'vibrate') triggerHaptic();
                        if (m.id === 'sound') playTestChime();
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold ${
                        mobileState.soundMode === m.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Sliders */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-blue-400" /> Media Volume (मीडिया)
                    </span>
                    <span className="text-blue-400 font-mono font-bold">{mobileState.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={mobileState.volume}
                    onChange={(e) => onUpdateMobileState((p) => ({ ...p, volume: Number(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-purple-400" /> Ringtone Volume (कॉल रिंगटोन)
                    </span>
                    <span className="text-purple-400 font-mono font-bold">{mobileState.ringVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={mobileState.ringVolume}
                    onChange={(e) => onUpdateMobileState((p) => ({ ...p, ringVolume: Number(e.target.value) }))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" /> Alarm Volume (अलार्म)
                    </span>
                    <span className="text-amber-400 font-mono font-bold">{mobileState.alarmVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={mobileState.alarmVolume}
                    onChange={(e) => onUpdateMobileState((p) => ({ ...p, alarmVolume: Number(e.target.value) }))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={playTestChime}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 border border-slate-700 flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> रिंगटोन टेस्ट साउंड चलाएँ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISPLAY & SCREEN */}
          {activeTab === 'display' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" /> Screen Brightness (स्क्रीन चमक)
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{mobileState.brightness}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={mobileState.brightness}
                  onChange={(e) => onUpdateMobileState((p) => ({ ...p, brightness: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Auto-Brightness (ऑटो चमक)</span>
                  <button
                    onClick={() => onUpdateMobileState((p) => ({ ...p, autoBrightness: !p.autoBrightness }))}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                      mobileState.autoBrightness ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        mobileState.autoBrightness ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Screen Timeout (स्क्रीन बंद होने का समय)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 60, 120].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => onUpdateMobileState((p) => ({ ...p, screenTimeout: sec }))}
                        className={`py-1.5 rounded-lg text-xs font-semibold border ${
                          mobileState.screenTimeout === sec
                            ? 'bg-amber-500 text-black border-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BATTERY & STORAGE */}
          {activeTab === 'power' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BatteryCharging className="w-4 h-4 text-emerald-400" /> बैटरी स्तर (Battery Level)
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {mobileState.batteryLevel}% {mobileState.isCharging ? '• चार्जिंग चालू' : '• बैटरी पर'}
                    </span>
                  </div>
                  <button
                    onClick={() => onUpdateMobileState((p) => ({ ...p, isCharging: !p.isCharging }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      mobileState.isCharging
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {mobileState.isCharging ? 'Unplug Charger' : 'Plug in Charger'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-cyan-400" /> Android Storage (स्टोरेज)
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {mobileState.storageUsedMB} MB / {mobileState.storageTotalGB} GB
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${Math.min(100, (mobileState.storageUsedMB / (mobileState.storageTotalGB * 1024)) * 100 * 25)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
