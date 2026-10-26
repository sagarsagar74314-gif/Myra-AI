import React, { useState } from 'react';
import { Phone, PhoneOff, Delete, X, User, Mic, MicOff, Volume2, Shield } from 'lucide-react';
import { SafetyConfirmationDialog } from './SafetyConfirmationDialog';

interface DialerAppProps {
  isOpen: boolean;
  onClose: () => void;
  initialNumber?: string;
  requireConfirmation?: boolean;
}

const CONTACTS = [
  { name: 'Mummy (मम्मी)', number: '+91 98765 43210', avatar: '👩' },
  { name: 'Papa (पापा)', number: '+91 98765 43211', avatar: '👨' },
  { name: 'Sagar (सागर)', number: '+91 99887 76655', avatar: '🧑' },
  { name: 'Office (कार्यालय)', number: '+91 11223 34455', avatar: '💼' },
  { name: 'Emergency Helpline (आपातकालीन)', number: '112', avatar: '🚨' },
  { name: 'Ambulance (एम्बुलेंस)', number: '108', avatar: '🚑' },
];

export const DialerApp: React.FC<DialerAppProps> = ({
  isOpen,
  onClose,
  initialNumber = '',
  requireConfirmation = true,
}) => {
  const [dialedNumber, setDialedNumber] = useState(initialNumber);
  const [inCall, setInCall] = useState(false);
  const [activeContact, setActiveContact] = useState<{ name: string; number: string } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    name?: string;
    number: string;
  }>({ isOpen: false, number: '' });

  React.useEffect(() => {
    if (initialNumber) setDialedNumber(initialNumber);
  }, [initialNumber]);

  React.useEffect(() => {
    let interval: any;
    if (inCall) {
      interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [inCall]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (dialedNumber.length < 15) {
      setDialedNumber((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const initiateCall = (number: string, name?: string) => {
    if (!number.trim()) return;
    if (requireConfirmation) {
      setConfirmDialog({
        isOpen: true,
        name: name || 'अज्ञात नंबर',
        number,
      });
    } else {
      startSimulatedCall(number, name);
    }
  };

  const startSimulatedCall = (number: string, name?: string) => {
    setActiveContact({ name: name || number, number });
    setInCall(true);
  };

  const endCall = () => {
    setInCall(false);
    setActiveContact(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const keypad = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '*', letters: '' },
    { num: '0', letters: '+' },
    { num: '#', letters: '' },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col justify-between text-white animate-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Android Phone / फोन डायलर</h2>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> सुरक्षित कॉलिंग (Safety Guard)
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {inCall ? (
        /* Ongoing Call Screen */
        <div className="flex-1 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950">
          <div className="text-center pt-8">
            <div className="w-24 h-24 rounded-full bg-indigo-600/30 border-2 border-indigo-400/50 flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-indigo-500/20 animate-pulse">
              👤
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{activeContact?.name}</h3>
            <p className="text-sm text-indigo-300 font-mono mb-2">{activeContact?.number}</p>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono">
              {formatDuration(callDuration)} (कॉल जारी है)
            </span>
          </div>

          <div className="w-full max-w-xs grid grid-cols-2 gap-4 my-8">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-colors ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              <span className="text-xs">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-colors ${
                isSpeaker
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <Volume2 className="w-6 h-6" />
              <span className="text-xs">{isSpeaker ? 'Speaker ON' : 'Speaker'}</span>
            </button>
          </div>

          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 active:scale-95 transition-all mb-4"
            title="End Call"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        </div>
      ) : (
        /* Keypad & Contacts Screen */
        <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full p-4 overflow-y-auto">
          {/* Displayed dialed number */}
          <div className="py-4 text-center min-h-[70px] flex items-center justify-center relative">
            <div className="text-3xl font-bold tracking-wider font-mono text-white">
              {dialedNumber || <span className="text-slate-600 text-xl font-sans">नंबर दर्ज करें...</span>}
            </div>
            {dialedNumber && (
              <button
                onClick={handleBackspace}
                className="absolute right-2 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <Delete className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Contacts Filter */}
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              त्वरित संपर्क (Quick Contacts)
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CONTACTS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => initiateCall(c.number, c.name)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-xs text-slate-200 transition-colors"
                >
                  <span>{c.avatar}</span>
                  <span className="font-medium">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 my-2">
            {keypad.map((k, index) => (
              <button
                key={index}
                onClick={() => handleDigit(k.num)}
                className="h-14 rounded-2xl bg-slate-800/70 hover:bg-slate-700/80 active:bg-indigo-600/40 border border-slate-700/50 flex flex-col items-center justify-center transition-all active:scale-95"
              >
                <span className="text-xl font-bold text-white leading-none">{k.num}</span>
                {k.letters && (
                  <span className="text-[9px] text-slate-400 font-semibold tracking-widest mt-0.5">
                    {k.letters}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Call Action Button */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => initiateCall(dialedNumber)}
              disabled={!dialedNumber.trim()}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              title="Call"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <SafetyConfirmationDialog
        isOpen={confirmDialog.isOpen}
        type="CALL"
        payload={{ name: confirmDialog.name, number: confirmDialog.number }}
        onConfirm={() => {
          setConfirmDialog({ isOpen: false, number: '' });
          startSimulatedCall(confirmDialog.number, confirmDialog.name);
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, number: '' })}
      />
    </div>
  );
};
