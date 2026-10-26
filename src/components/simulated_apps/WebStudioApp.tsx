import React, { useState } from 'react';
import {
  Globe,
  Code2,
  Eye,
  Download,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  Sparkles,
  X,
  Send,
  Save,
  Layers,
} from 'lucide-react';
import { GeneratedWebsite } from '../../types';

interface WebStudioAppProps {
  isOpen: boolean;
  onClose: () => void;
  currentSite: GeneratedWebsite | null;
  onGenerateSite: (prompt: string, template?: string) => void;
  onSaveToFileManager: (filename: string, content: string) => void;
  isGenerating?: boolean;
}

const TEMPLATES = [
  {
    id: 'portfolio',
    name: 'Developer Portfolio',
    desc: 'व्यक्तिगत पोर्टफोलियो, स्किल्स, प्रोजेक्ट्स और कांटेक्ट फॉर्म',
    color: 'from-indigo-600 to-purple-600',
  },
  {
    id: 'tech_saas',
    name: 'AI Startup SaaS',
    desc: 'मॉडर्न टेक लैंडिंग पेज, फीचर कार्ड्स और प्राइसिंग टेबल',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'coffee_shop',
    name: 'Artisan Cafe & Bakery',
    desc: 'कैफे मेनू, स्पेशल ड्रिंक्स और ऑनलाइन टेबल रिज़र्वेशन',
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk Agency',
    desc: 'डार्क मोड, ग्लोइंग नियॉन एनिमेशन और क्रिएटिव डिज़ाइन्स',
    color: 'from-pink-600 to-purple-600',
  },
];

export const WebStudioApp: React.FC<WebStudioAppProps> = ({
  isOpen,
  onClose,
  currentSite,
  onGenerateSite,
  onSaveToFileManager,
  isGenerating = false,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'split'>('preview');
  const [deviceViewport, setDeviceViewport] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [codeTab, setCodeTab] = useState<'all' | 'html' | 'css' | 'js'>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  // Default initial website code if none generated yet
  const defaultSite: GeneratedWebsite = currentSite || {
    id: 'default-site',
    title: 'Myra Modern Tech Portal',
    html: `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Myra AI - Future of Mobile Assistants</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0b0f19; color: #f3f4f6; min-height: 100vh; display: flex; flex-direction: column; }
    header { padding: 20px; background: rgba(17, 24, 39, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #1f2937; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero { flex: 1; padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    h1 { font-size: 32px; font-weight: 800; margin-bottom: 16px; line-height: 1.2; }
    .gradient-text { background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { font-size: 15px; color: #9ca3af; max-width: 480px; margin-bottom: 24px; line-height: 1.6; }
    .btn-group { display: flex; gap: 12px; }
    .btn { padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); }
    .btn-primary:hover { transform: scale(1.04); }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; width: 100%; max-width: 720px; margin-top: 36px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; text-align: left; }
    .card h3 { font-size: 16px; margin-bottom: 8px; color: #e2e8f0; }
    .card p { font-size: 13px; margin-bottom: 0; }
    footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937; }
  </style>
</head>
<body>
  <header>
    <div class="logo">⚡ Myra Studio</div>
    <button class="btn btn-primary" onclick="alert('नमस्ते! Myra AI वेबसाइट जनरेटर सक्रिय है।')">Get Started</button>
  </header>
  <main class="hero">
    <h1>आधुनिक AI से तैयार <br><span class="gradient-text">Next-Gen Websites</span></h1>
    <p>Myra AI द्वारा सेकंडों में रेस्पॉन्सिव, खूबसूरत और पूरी तरह इंटरैक्टिव वेबसाइट कोड तैयार करें।</p>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="changeHeroColor()">Change Glow</button>
      <button class="btn btn-secondary" onclick="alert('कोड डाउनलोड के लिए तैयार है!')">Explore Code</button>
    </div>
    <div class="features">
      <div class="card">
        <h3>🚀 Lightning Fast</h3>
        <p>क्लीन HTML5, आधुनिक CSS3 ग्रिड और इंटरैक्टिव जावास्क्रिप्ट कोड।</p>
      </div>
      <div class="card">
        <h3>📱 100% Responsive</h3>
        <p>मोबाइल, टैबलेट और डेस्कटॉप तीनों स्क्रीन्स पर बेहतरीन प्रदर्शन।</p>
      </div>
    </div>
  </main>
  <footer>
    <p>© 2026 Myra AI Generated Website • Android Assistant</p>
  </footer>
  <script>
    function changeHeroColor() {
      const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
      const pick = colors[Math.floor(Math.random() * colors.length)];
      document.querySelector('.hero').style.boxShadow = 'inset 0 0 80px ' + pick + '33';
    }
  </script>
</body>
</html>`,
    css: '',
    js: '',
    createdAt: 'Just now',
  };

  const activeSite = currentSite || defaultSite;
  const combinedCode = activeSite.html.includes('<style>')
    ? activeSite.html
    : `<!DOCTYPE html><html><head><style>${activeSite.css}</style></head><body>${activeSite.html}<script>${activeSite.js}</script></body></html>`;

  const handleDownload = () => {
    const blob = new Blob([combinedCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSite.title.toLowerCase().replace(/\s+/g, '-') || 'website'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToFiles = () => {
    const filename = `${activeSite.title.toLowerCase().replace(/\s+/g, '-') || 'index'}.html`;
    onSaveToFileManager(filename, combinedCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(combinedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGenerating) return;
    onGenerateSite(aiPrompt.trim());
    setAiPrompt('');
  };

  const getViewportWidth = () => {
    if (deviceViewport === 'mobile') return 'max-w-[375px]';
    if (deviceViewport === 'tablet') return 'max-w-[680px]';
    return 'w-full';
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col justify-between text-white animate-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
              Myra Web Studio <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI Live Generator</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs">
              {activeSite.title}
            </p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mode Switcher */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-0.5 flex items-center text-xs">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold ${
                viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold ${
                viewMode === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Code</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold hidden md:flex ${
                viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Split
            </button>
          </div>

          {/* Export & Save Buttons */}
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="कोड कॉपी करें"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSaveToFiles}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300"
            title="फ़ाइल मैनेजर में सहेजें (Save to Files)"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            title="डाउनलोड करें (Download HTML)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Template Carousel Bar */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/70 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex-shrink-0">
          त्वरित टेम्पलेट्स:
        </span>
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onGenerateSite(`Generate a complete ${tpl.name} website`, tpl.id)}
            disabled={isGenerating}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className={`w-2 h-2 rounded-full bg-gradient-to-tr ${tpl.color}`} />
            {tpl.name}
          </button>
        ))}
      </div>

      {/* Main Studio Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-2 sm:p-4 gap-3">
        {/* PREVIEW CONTAINER */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Viewport Control Bar */}
            <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDeviceViewport('mobile')}
                  className={`p-1.5 rounded-lg ${deviceViewport === 'mobile' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-850'}`}
                  title="Mobile Viewport (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceViewport('tablet')}
                  className={`p-1.5 rounded-lg ${deviceViewport === 'tablet' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-850'}`}
                  title="Tablet Viewport (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceViewport('desktop')}
                  className={`p-1.5 rounded-lg ${deviceViewport === 'desktop' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-850'}`}
                  title="Desktop Viewport"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                <span>{deviceViewport === 'mobile' ? '375 x 667' : deviceViewport === 'tablet' ? '768 x 1024' : '100%'}</span>
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="p-1 hover:text-white"
                  title="Reload Preview"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Sandbox iframe browser */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-auto">
              <div
                className={`w-full h-full ${getViewportWidth()} bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-700/60`}
              >
                <iframe
                  key={iframeKey}
                  title="Myra Web Preview"
                  srcDoc={combinedCode}
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* CODE EDITOR CONTAINER */}
        {(viewMode === 'code' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> index.html (Source Code)
              </span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-indigo-200 bg-slate-950/80 leading-relaxed">
              <pre className="whitespace-pre-wrap break-all">{combinedCode}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Bottom AI Website Prompt Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <form onSubmit={handlePromptSubmit} className="flex items-center gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="मायरा से वेबसाइट में बदलाव करवाएँ (उदा: 'ऐड कांटेक्ट फॉर्म', 'चेंज बैकग्राउंड टू डार्क पर्पल')..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={!aiPrompt.trim() || isGenerating}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{isGenerating ? 'बना रही है...' : 'जनरेट करें'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
