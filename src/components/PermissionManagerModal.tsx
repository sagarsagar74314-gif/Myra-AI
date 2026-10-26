import React from 'react';
import {
  Shield,
  ShieldCheck,
  Mic,
  Camera,
  MapPin,
  Users,
  Bell,
  X,
  Lock,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  MessageSquare,
  Sliders,
} from 'lucide-react';
import { PermissionsState, PermissionStatus } from '../types';

interface PermissionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: PermissionsState;
  onUpdatePermission: (key: keyof PermissionsState, status: PermissionStatus) => void;
}

export const PermissionManagerModal: React.FC<PermissionManagerModalProps> = ({
  isOpen,
  onClose,
  permissions,
  onUpdatePermission,
}) => {
  if (!isOpen) return null;

  const requestRealPermission = async (key: keyof PermissionsState) => {
    try {
      if (key === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        onUpdatePermission('microphone', 'granted');
      } else if (key === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        onUpdatePermission('camera', 'granted');
      } else if (key === 'location') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            () => onUpdatePermission('location', 'granted'),
            () => onUpdatePermission('location', 'denied')
          );
        }
      } else if (key === 'notifications') {
        if ('Notification' in window) {
          const res = await Notification.requestPermission();
          onUpdatePermission('notifications', res === 'granted' ? 'granted' : 'denied');
        }
      } else {
        // Toggle simulated/runtime permission
        const current = permissions[key];
        onUpdatePermission(key, current === 'granted' ? 'denied' : 'granted');
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      // Toggle manually
      const current = permissions[key];
      onUpdatePermission(key, current === 'granted' ? 'denied' : 'granted');
    }
  };

  const permItems = [
    {
      key: 'microphone' as const,
      name: 'Microphone (माइक्रोफ़ोन)',
      desc: 'आवाज़ सुनकर कमांड लेने और Voice Assistant से बात करने के लिए आवश्यक।',
      icon: <Mic className="w-5 h-5 text-indigo-400" />,
    },
    {
      key: 'camera' as const,
      name: 'Camera (कैमरा)',
      desc: 'कैमरा खोलने, फ़ोटो खींचने और विज़ुअल विश्लेषण के लिए।',
      icon: <Camera className="w-5 h-5 text-purple-400" />,
    },
    {
      key: 'storage' as const,
      name: 'Storage & Files (फ़ाइल एक्सेस)',
      desc: 'फ़ाइलें बनाने, संपादित करने, वेबसाइट कोड जनरेट करने और डाउनलोड करने के लिए।',
      icon: <HardDrive className="w-5 h-5 text-cyan-400" />,
    },
    {
      key: 'sms' as const,
      name: 'SMS & Messages (संदेश सेवा)',
      desc: 'सीधे SMS भेजने और त्वरित संदेश ड्राफ्ट करने के लिए (उपयोगकर्ता पुष्टि के साथ)।',
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
    },
    {
      key: 'location' as const,
      name: 'Location & GPS (स्थान)',
      desc: 'मौसम, नज़दीकी स्थान और सटीक भौगोलिक जानकारी प्राप्त करने के लिए।',
      icon: <MapPin className="w-5 h-5 text-rose-400" />,
    },
    {
      key: 'contacts' as const,
      name: 'Contacts (संपर्क सूची)',
      desc: 'कॉल मिलाने या नाम से संदेश भेजने की अनुमति।',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
    },
    {
      key: 'systemSettings' as const,
      name: 'System Settings Control (सिस्टम नियंत्रण)',
      desc: 'टॉर्च, ब्राइटनेस, वॉल्यूम, हॉटस्पॉट और नेटवर्क टॉगल नियंत्रित करने के लिए।',
      icon: <Sliders className="w-5 h-5 text-amber-400" />,
    },
    {
      key: 'notifications' as const,
      name: 'Notifications (सूचनाएँ)',
      desc: 'रिमाइंडर, अलर्ट और मैसेज डिलीवरी सूचनाएँ भेजने के लिए।',
      icon: <Bell className="w-5 h-5 text-pink-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-white flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Permission Manager / अनुमतियाँ
              </h2>
              <p className="text-[11px] text-indigo-300">Myra AI Privacy & Security Center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Guarantee Notice */}
        <div className="my-3 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-300 leading-relaxed">
            <span className="font-semibold text-white block mb-0.5">
              100% सुरक्षा एवं गोपनीयता गारंटी:
            </span>
            Myra AI कभी भी आपकी पुष्टि के बिना संदेश या कॉल नहीं करती। सभी संवेदनशील डिवाइस क्रियाएँ
            पुष्टि के बाद ही निष्पादित होती हैं।
          </div>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-1">
          {permItems.map((item) => {
            const status = permissions[item.key] || 'prompt';
            const isGranted = status === 'granted';

            return (
              <div
                key={item.key}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                      {isGranted ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-2.5 h-2.5" /> स्वीकृत (Granted)
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" /> आवश्यक (Not Granted)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                </div>

                {/* Switch toggle */}
                <button
                  onClick={() => requestRealPermission(item.key)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex-shrink-0 ${
                    isGranted ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                  title={isGranted ? 'अनुमति बंद करें' : 'अनुमति दें'}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isGranted ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30"
          >
            सहेजें एवं बंद करें (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
