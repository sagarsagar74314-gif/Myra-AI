import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RotateCcw, Zap, ZapOff, Image as ImageIcon, CircleDot } from 'lucide-react';

interface CameraAppProps {
  isOpen: boolean;
  onClose: () => void;
  onSnapPhoto?: (photoUrl: string) => void;
}

export const CameraApp: React.FC<CameraAppProps> = ({ isOpen, onClose, onSnapPhoto }) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [snappedPhoto, setSnappedPhoto] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    async function initCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.warn('Real camera not available or permission denied:', err);
        setHasPermission(false);
      }
    }

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    if (videoRef.current && hasPermission) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setSnappedPhoto(dataUrl);
          if (onSnapPhoto) onSnapPhoto(dataUrl);
          return;
        }
      } catch (e) {
        console.warn('Canvas capture error:', e);
      }
    }

    // Fallback captured placeholder
    const simulatedPhoto =
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80';
    setSnappedPhoto(simulatedPhoto);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col justify-between text-white animate-in zoom-in-95 duration-200">
      {/* Flash effect overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200 pointer-events-none" />
      )}

      {/* Top Controls */}
      <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20"
          title="Close Camera"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-600/70 border border-indigo-400/40 text-indigo-100 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> Myra Cam HD
          </span>
        </div>

        <button
          onClick={() => setFlashOn(!flashOn)}
          className={`p-2.5 rounded-full backdrop-blur-md border ${
            flashOn
              ? 'bg-amber-500 text-black border-amber-400'
              : 'bg-black/40 text-white border-white/20'
          }`}
          title="Toggle Flash"
        >
          {flashOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Viewfinder Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {hasPermission ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
            <div className="w-48 h-48 rounded-full border-2 border-indigo-500/30 flex items-center justify-center relative mb-4">
              <div className="absolute inset-2 rounded-full border border-dashed border-indigo-400/40 animate-spin" style={{ animationDuration: '20s' }} />
              <Camera className="w-16 h-16 text-indigo-400 opacity-80" />
            </div>
            <p className="text-sm font-medium text-slate-300 max-w-xs">
              सिम्युलेटेड कैमरा व्यूफाइंडर सक्रिय है। वास्तविक कैमरे की अनुमति देने पर लाइव फीड दिखाई देगा।
            </p>
          </div>
        )}

        {/* Viewfinder crosshairs */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border border-white/20 rounded-2xl relative">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
          </div>
        </div>
      </div>

      {/* Bottom Shutter Bar */}
      <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-around z-10">
        {/* Gallery preview thumbnail */}
        <div className="w-12 h-12 rounded-xl border border-white/30 overflow-hidden bg-slate-800 flex items-center justify-center">
          {snappedPhoto ? (
            <img src={snappedPhoto} alt="Snapshot" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}
        </div>

        {/* Shutter Button */}
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:scale-90 transition-transform shadow-lg shadow-white/20"
          title="Take Photo"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <CircleDot className="w-6 h-6 text-slate-900" />
          </div>
        </button>

        {/* Flip camera */}
        <button
          onClick={() =>
            setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
          }
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          title="Switch Camera"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
