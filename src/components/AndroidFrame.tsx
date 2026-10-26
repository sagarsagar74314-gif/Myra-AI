import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Flashlight,
  Home,
  ChevronLeft,
  Square,
  Sparkles,
} from 'lucide-react';
import { MobileState } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  mobileState: MobileState;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  onHomePress: () => void;
  onBackPress: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  mobileState,
  isPhoneFrame,
  onToggleFrame,
  onHomePress,
  onBackPress,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute brightness overlay opacity
  // brightness: 10% -> 90% opacity black, 100% -> 0% opacity black
  const dimmerOpacity = Math.max(0, (100 - mobileState.brightness) / 130);

  const content = (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Screen Brightness Overlay Filter */}
      <div
        className="pointer-events-none absolute inset-0 bg-black z-30 transition-opacity duration-300"
        style={{ opacity: dimmerOpacity }}
      />

      {/* Screen Flashlight Beam Indicator (when torch is active) */}
      {mobileState.flashlight && (
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-400/25 blur-3xl z-30 animate-pulse" />
      )}

      {/* Android System Status Bar */}
      <div className="relative z-30 px-5 pt-2 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-300 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60">
        {/* Time */}
        <div className="flex items-center gap-1.5 font-mono">
          <span>{timeStr || '10:30 AM'}</span>
        </div>

        {/* Punch Hole Camera cutout */}
        <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
        </div>

        {/* Right side Android System Icons */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          {mobileState.isForegroundServiceRunning && (
            <span title="24/7 Foreground Service Active" className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          {mobileState.isIntrusionArmed && (
            <span title="Intrusion Guard Armed" className="text-rose-400">🛡️</span>
          )}
          {mobileState.isClapDetectorActive && (
            <span title="Acoustic Clap Detector Active" className="text-amber-400 text-[9px]">👏</span>
          )}
          {mobileState.airplaneMode && (
            <span className="text-amber-400" title="Airplane Mode">✈️</span>
          )}
          {mobileState.hotspot && (
            <span className="text-teal-400" title="Hotspot Active">📡</span>
          )}
          {mobileState.soundMode === 'silent' && (
            <span title="Silent Mode"><VolumeX className="w-3 h-3 text-rose-400" /></span>
          )}
          {mobileState.soundMode === 'vibrate' && (
            <span className="text-amber-400" title="Vibrate Mode">📳</span>
          )}
          {mobileState.flashlight && (
            <Flashlight className={`w-3 h-3 text-amber-400 ${mobileState.strobeTorch ? 'animate-ping' : 'animate-pulse'}`} />
          )}
          {!mobileState.airplaneMode && (
            mobileState.wifi ? (
              <Wifi className="w-3 h-3 text-indigo-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-slate-500" />
            )
          )}
          {!mobileState.airplaneMode && mobileState.mobileData && (
            <span className="text-[9px] text-indigo-400 font-bold">5G</span>
          )}
          <div className="flex items-center gap-0.5">
            <span>{mobileState.batteryLevel}%</span>
            {mobileState.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            )}
          </div>
        </div>
      </div>

      {/* App Main Body */}
      <div className="relative flex-1 flex flex-col overflow-hidden">{children}</div>

      {/* Android Bottom Navigation Bar (Back, Home, Recents / Pill) */}
      <div className="relative z-30 h-10 px-6 bg-slate-950 border-t border-slate-900 flex items-center justify-around text-slate-400">
        <button
          onClick={onBackPress}
          className="p-2 rounded-xl hover:text-white hover:bg-slate-900 active:scale-90 transition-all"
          title="Back (वापस)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onHomePress}
          className="p-2 rounded-xl hover:text-white hover:bg-slate-900 active:scale-90 transition-all"
          title="Home (होम)"
        >
          <div className="w-16 h-1 rounded-full bg-slate-600 hover:bg-slate-400 transition-colors" />
        </button>

        <button
          onClick={onToggleFrame}
          className="p-2 rounded-xl hover:text-white hover:bg-slate-900 active:scale-90 transition-all"
          title={isPhoneFrame ? 'Full Screen Mode' : 'Phone Frame Mode'}
        >
          {isPhoneFrame ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  if (!isPhoneFrame) {
    return <div className="w-full h-screen overflow-hidden bg-slate-950">{content}</div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-6 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      {/* Smartphone Outer Bezel & Chassis */}
      <div className="relative w-full max-w-[430px] h-[92vh] max-h-[890px] rounded-[48px] bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-800 shadow-indigo-950/50 flex flex-col border-4 border-slate-800">
        {/* Speaker ear grille */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-slate-800 pointer-events-none" />

        {/* Volume & Power Button aesthetic notches */}
        <div className="absolute -left-4 top-24 w-1.5 h-12 bg-slate-700 rounded-l-md pointer-events-none" />
        <div className="absolute -left-4 top-40 w-1.5 h-12 bg-slate-700 rounded-l-md pointer-events-none" />
        <div className="absolute -right-4 top-28 w-1.5 h-16 bg-slate-700 rounded-r-md pointer-events-none" />

        {/* Inner Screen with rounded corners */}
        <div className="relative w-full h-full rounded-[38px] overflow-hidden flex flex-col shadow-inner">
          {content}
        </div>
      </div>
    </div>
  );
};
