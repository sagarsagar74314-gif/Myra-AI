import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Shield,
  Plus,
  CheckCheck,
  User,
  Share2,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { SafetyConfirmationDialog } from './SafetyConfirmationDialog';

interface SmsAppProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialMessage?: string;
  requireConfirmation?: boolean;
}

interface MessageItem {
  id: string;
  recipient: string;
  text: string;
  time: string;
  status: 'sent' | 'delivered';
}

const QUICK_CONTACTS = [
  { name: 'Mummy (मम्मी)', number: '+91 98765 43210', avatar: '👩' },
  { name: 'Papa (पापा)', number: '+91 98765 43211', avatar: '👨' },
  { name: 'Sagar (सागर)', number: '+91 99887 76655', avatar: '🧑' },
  { name: 'Office (कार्यालय)', number: '+91 11223 34455', avatar: '💼' },
  { name: 'Friend (दोस्त)', number: '+91 91234 56789', avatar: '🤝' },
];

export const SmsApp: React.FC<SmsAppProps> = ({
  isOpen,
  onClose,
  initialRecipient = '',
  initialMessage = '',
  requireConfirmation = true,
}) => {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [messageText, setMessageText] = useState(initialMessage);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: '1',
      recipient: 'Mummy (मम्मी)',
      text: 'नमस्ते बेटा, घर कब आ रहे हो?',
      time: '10:30 AM',
      status: 'delivered',
    },
    {
      id: '2',
      recipient: 'Office (ऑफिस)',
      text: 'Meeting rescheduled to 4 PM.',
      time: 'Yesterday',
      status: 'delivered',
    },
    {
      id: '3',
      recipient: 'Sagar (सागर)',
      text: 'Myra AI का नया अपडेट लाइव हो गया है!',
      time: 'Just now',
      status: 'delivered',
    },
  ]);
  const [isComposing, setIsComposing] = useState(!!(initialRecipient || initialMessage));
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    recipient: string;
    message: string;
  }>({ isOpen: false, recipient: '', message: '' });

  React.useEffect(() => {
    if (initialRecipient) setRecipient(initialRecipient);
    if (initialMessage) {
      setMessageText(initialMessage);
      setIsComposing(true);
    }
  }, [initialRecipient, initialMessage]);

  if (!isOpen) return null;

  const quickTemplates = [
    'मैं अभी मीटिंग में हूँ, बाद में कॉल करता हूँ।',
    'हाँ, मैं सुरक्षित पहुँच गया हूँ।',
    'धन्यवाद! आपका दिन शुभ हो।',
    'कृपया मुझे 10 मिनट में कॉल करें।',
    'मायरा द्वारा भेजा गया संदेश।',
  ];

  const handleSendRequest = () => {
    if (!recipient.trim() || !messageText.trim()) return;

    if (requireConfirmation) {
      setConfirmDialog({
        isOpen: true,
        recipient,
        message: messageText,
      });
    } else {
      sendMessageDirectly();
    }
  };

  const sendMessageDirectly = () => {
    const newMsg: MessageItem = {
      id: Date.now().toString(),
      recipient,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };
    setMessages((prev) => [newMsg, ...prev]);

    // Attempt real mobile SMS intent dispatch
    try {
      const cleanNum = recipient.replace(/[^\d+]/g, '');
      const encodedMsg = encodeURIComponent(messageText);
      if (cleanNum) {
        // Creates a hidden anchor link for standard mobile sms protocol
        const a = document.createElement('a');
        a.href = `sms:${cleanNum}?body=${encodedMsg}`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      // Fallback handled in UI
    }

    setMessageText('');
    setRecipient('');
    setIsComposing(false);
  };

  const handleShareExternal = () => {
    if (navigator.share) {
      navigator.share({
        title: `Message for ${recipient}`,
        text: messageText,
      }).catch(() => {});
    } else {
      const text = encodeURIComponent(`${messageText} (To: ${recipient})`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col justify-between text-white animate-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Android Messages / संदेश</h2>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" /> अनुमति के बिना कोई मैसेज नहीं जाता
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

      {isComposing ? (
        /* Composer Screen */
        <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">नया संदेश लिखें (New Message)</h3>
            <button
              onClick={() => setIsComposing(false)}
              className="text-xs text-indigo-400 hover:underline"
            >
              इनबॉक्स देखें
            </button>
          </div>

          {/* Quick Contact Selectors */}
          <div className="mb-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              त्वरित संपर्क चुनें:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {QUICK_CONTACTS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setRecipient(c.name)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                >
                  <span>{c.avatar}</span>
                  <span className="truncate">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 flex-1 flex flex-col">
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                प्राप्तकर्ता (To / Recipient)
              </label>
              <input
                type="text"
                placeholder="नाम या मोबाइल नंबर दर्ज करें..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
                संदेश (Message)
              </label>
              <textarea
                rows={4}
                placeholder="यहाँ संदेश टाइप करें..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full flex-1 p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Quick Template Chips */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1.5 font-medium">त्वरित संदेश (Quick Templates):</p>
              <div className="flex flex-wrap gap-1.5">
                {quickTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessageText(t)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-left transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={handleShareExternal}
                disabled={!messageText.trim()}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                title="WhatsApp या अन्य ऐप्स में शेयर करें"
              >
                <Share2 className="w-4 h-4 text-emerald-400" /> शेयर करें
              </button>

              <button
                onClick={handleSendRequest}
                disabled={!recipient.trim() || !messageText.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all"
              >
                <Send className="w-4 h-4" /> संदेश भेजें (Send SMS)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Message Inbox List */
        <div className="flex-1 p-4 max-w-md mx-auto w-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">हालिया संदेश (Recent Messages)</h3>
            <button
              onClick={() => setIsComposing(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> नया संदेश
            </button>
          </div>

          <div className="space-y-2.5">
            {messages.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setRecipient(m.recipient);
                  setIsComposing(true);
                }}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">{m.recipient}</h4>
                    <span className="text-[10px] text-slate-500">{m.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{m.text}</p>
                </div>
                <CheckCheck className="w-4 h-4 text-blue-400 flex-shrink-0 self-center" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <SafetyConfirmationDialog
        isOpen={confirmDialog.isOpen}
        type="SMS"
        payload={{ recipient: confirmDialog.recipient, message: confirmDialog.message }}
        onConfirm={() => {
          setConfirmDialog({ isOpen: false, recipient: '', message: '' });
          sendMessageDirectly();
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, recipient: '', message: '' })}
      />
    </div>
  );
};
