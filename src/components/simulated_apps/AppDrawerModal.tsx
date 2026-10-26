import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Camera,
  Settings,
  Calculator,
  Clock,
  FileText,
  CloudSun,
  Image,
  Flashlight,
  Compass,
  X,
  Search,
} from 'lucide-react';

interface AppDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp: (appId: string) => void;
}

export const AppDrawerModal: React.FC<AppDrawerModalProps> = ({
  isOpen,
  onClose,
  onLaunchApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const apps = [
    {
      id: 'web_studio',
      name: 'Web Studio / वेबसाइट जनरेटर',
      category: 'AI & Developer',
      icon: <Compass className="w-6 h-6 text-purple-400" />,
      bg: 'bg-purple-500/20 border-purple-500/30',
    },
    {
      id: 'files',
      name: 'Files / फ़ाइल प्रबंधक',
      category: 'Tools',
      icon: <FileText className="w-6 h-6 text-cyan-400" />,
      bg: 'bg-cyan-500/20 border-cyan-500/30',
    },
    {
      id: 'dialer',
      name: 'Phone / डायलर',
      category: 'System',
      icon: <Phone className="w-6 h-6 text-emerald-400" />,
      bg: 'bg-emerald-500/20 border-emerald-500/30',
    },
    {
      id: 'sms',
      name: 'Messages / संदेश',
      category: 'Communication',
      icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      bg: 'bg-blue-500/20 border-blue-500/30',
    },
    {
      id: 'camera',
      name: 'Camera / कैमरा',
      category: 'Media',
      icon: <Camera className="w-6 h-6 text-purple-400" />,
      bg: 'bg-purple-500/20 border-purple-500/30',
    },
    {
      id: 'settings',
      name: 'Settings / सेटिंग्स',
      category: 'System',
      icon: <Settings className="w-6 h-6 text-slate-300" />,
      bg: 'bg-slate-700/40 border-slate-600/40',
    },
    {
      id: 'calculator',
      name: 'Calculator / गणित',
      category: 'Tools',
      icon: <Calculator className="w-6 h-6 text-amber-400" />,
      bg: 'bg-amber-500/20 border-amber-500/30',
    },
    {
      id: 'notes',
      name: 'Notes / नोट्स',
      category: 'Productivity',
      icon: <FileText className="w-6 h-6 text-cyan-400" />,
      bg: 'bg-cyan-500/20 border-cyan-500/30',
    },
    {
      id: 'clock',
      name: 'Clock / अलार्म',
      category: 'Tools',
      icon: <Clock className="w-6 h-6 text-indigo-400" />,
      bg: 'bg-indigo-500/20 border-indigo-500/30',
    },
    {
      id: 'weather',
      name: 'Weather / मौसम',
      category: 'Information',
      icon: <CloudSun className="w-6 h-6 text-sky-400" />,
      bg: 'bg-sky-500/20 border-sky-500/30',
    },
    {
      id: 'gallery',
      name: 'Gallery / गैलरी',
      category: 'Media',
      icon: <Image className="w-6 h-6 text-pink-400" />,
      bg: 'bg-pink-500/20 border-pink-500/30',
    },
    {
      id: 'flashlight',
      name: 'Flashlight / टॉर्च',
      category: 'Tools',
      icon: <Flashlight className="w-6 h-6 text-yellow-400" />,
      bg: 'bg-yellow-500/20 border-yellow-500/30',
    },
    {
      id: 'browser',
      name: 'Browser / वेब',
      category: 'Internet',
      icon: <Compass className="w-6 h-6 text-teal-400" />,
      bg: 'bg-teal-500/20 border-teal-500/30',
    },
  ];

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 animate-in slide-in-from-bottom duration-200">
      {/* Top Bar with Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ऐप्स खोजें (Search Android Apps)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-2 px-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          सभी इंस्टॉल किए गए ऐप्स ({filteredApps.length})
        </span>
        <span className="text-[11px] text-indigo-400">Android System Apps</span>
      </div>

      {/* Grid of Apps */}
      <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3.5 p-1">
        {filteredApps.map((app) => (
          <button
            key={app.id}
            onClick={() => {
              onLaunchApp(app.id);
              onClose();
            }}
            className="flex flex-col items-center text-center p-3 rounded-2xl hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all active:scale-95 group"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${app.bg} border flex items-center justify-center mb-2 shadow-md group-hover:scale-105 transition-transform`}
            >
              {app.icon}
            </div>
            <span className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-white">
              {app.name.split('/')[0].trim()}
            </span>
            <span className="text-[10px] text-slate-500 line-clamp-1">
              {app.name.split('/')[1]?.trim() || app.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
