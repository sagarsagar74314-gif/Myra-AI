import React, { useEffect, useState } from 'react';
import { Moon, Sparkles, Radio, ShieldAlert, Sun } from 'lucide-react';

interface ScreenOffOverlayProps {
  isOpen: boolean;
  onWakeUp: () => void;
  onScreenTouch: () => void;
  isSnapActive?: boolean;
  isClapActive?: boolean;
  isIntrusionArmed: boolean;
}

export const ScreenOffOverlay: React.FC<ScreenOffOverlayProps> = ({
  isOpen,
  onWakeUp,
  onScreenTouch,
  isSnapActive,
  isClapActive,
  isIntrusionArmed,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const activeSnap = isSnapActive ?? isClapActive ?? true;

  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onScreenTouch}
      className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-between p-8 select-none cursor-pointer text-slate-500 animate-in fade-in duration-300"
    >
      {/* Top subtle status dots */}
      <div className="flex items-center justify-between w-full text-[10px] text-slate-600 font-mono pt-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>24/7 Background Service: ON</span>
        </div>
        {activeSnap && (
          <div className="flex items-center gap-1 text-cyan-400">
            <Radio className="w-3 h-3 animate-ping" />
            <span>Snap Mic Awake</span>
          </div>
        )}
      </div>

      {/* Center Minimal AMOLED Clock */}
      <div className="text-center space-y-2 opacity-80 hover:opacity-100 transition-opacity">
        <p className="text-4xl sm:text-5xl font-thin tracking-widest text-slate-400 font-mono">
          {timeStr || '10:30'}
        </p>
        <p className="text-[11px] text-slate-600 tracking-wider">
          स्क्रीन ऑफ है (Screen Locked / Off)
        </p>
        {isIntrusionArmed && (
          <span className="inline-flex items-center gap-1 text-[10px] text-rose-500/80 bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-900/40">
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>सुरक्षा गार्ड सशस्त्र (Intrusion Armed)</span>
          </span>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="text-center space-y-3 pb-6">
        <p className="text-[11px] text-slate-400">
          👌 चुटकी बजाएँ (Snap fingers) या जगाने के लिए कहीं भी टच करें
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWakeUp();
          }}
          className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs flex items-center gap-2 mx-auto active:scale-95 transition-all"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>स्क्रीन चालू करें (Wake Up)</span>
        </button>
      </div>
    </div>
  );
};
