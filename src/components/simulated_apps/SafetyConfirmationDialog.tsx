import React from 'react';
import { ShieldAlert, Check, X, PhoneCall, Send, AlertTriangle } from 'lucide-react';

interface SafetyConfirmationDialogProps {
  isOpen: boolean;
  type: 'CALL' | 'SMS' | 'SETTINGS_RESET' | 'CLEAR_MEMORY';
  payload: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SafetyConfirmationDialog: React.FC<SafetyConfirmationDialogProps> = ({
  isOpen,
  type,
  payload,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  let title = 'पुष्टि आवश्यक है';
  let description = 'सुरक्षा नीति के अनुसार इस क्रिया के लिए आपकी पुष्टि आवश्यक है।';
  let icon = <ShieldAlert className="w-8 h-8 text-amber-400" />;

  if (type === 'CALL') {
    title = 'कॉल करने की पुष्टि (Call Confirmation)';
    description = `क्या आप वाकई ${payload.name || 'इस नंबर'} (${payload.number || 'अज्ञात'}) पर कॉल मिलाना चाहते हैं?`;
    icon = <PhoneCall className="w-8 h-8 text-emerald-400" />;
  } else if (type === 'SMS') {
    title = 'संदेश भेजने की पुष्टि (SMS Confirmation)';
    description = `क्या आप वाकई ${payload.recipient || 'प्राप्तकर्ता'} को यह संदेश भेजना चाहते हैं? "${payload.message || ''}"`;
    icon = <Send className="w-8 h-8 text-blue-400" />;
  } else if (type === 'SETTINGS_RESET') {
    title = 'सेटिंग्स रीसेट (Reset Settings)';
    description = 'क्या आप सभी डिफ़ॉल्ट सेटिंग्स वापस लाना चाहते हैं?';
    icon = <AlertTriangle className="w-8 h-8 text-rose-400" />;
  } else if (type === 'CLEAR_MEMORY') {
    title = 'मेमोरी मिटाएँ (Clear Memory)';
    description = 'क्या आप Myra AI द्वारा सेव की गई सभी व्यक्तिगत यादें मिटाना चाहते हैं?';
    icon = <AlertTriangle className="w-8 h-8 text-rose-400" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-slate-800/90 border border-slate-700">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-base leading-snug">{title}</h3>
            <span className="text-[11px] text-indigo-400 font-medium">Myra Android Security Guard</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
          {description}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" /> रद्द करें (Cancel)
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Check className="w-4 h-4" /> पुष्टि करें (Confirm)
          </button>
        </div>
      </div>
    </div>
  );
};
