import React, { useState } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  FilePlus,
  Trash2,
  Download,
  Edit3,
  X,
  Search,
  Check,
  HardDrive,
  Code2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { CreatedFile } from '../../types';

interface FileManagerAppProps {
  isOpen: boolean;
  onClose: () => void;
  files: CreatedFile[];
  onCreateFile: (file: Omit<CreatedFile, 'id' | 'createdAt' | 'updatedAt' | 'size'>) => void;
  onDeleteFile: (id: string) => void;
  onUpdateFile: (id: string, content: string) => void;
  storageUsedMB: number;
  storageTotalGB: number;
}

export const FileManagerApp: React.FC<FileManagerAppProps> = ({
  isOpen,
  onClose,
  files,
  onCreateFile,
  onDeleteFile,
  onUpdateFile,
  storageUsedMB,
  storageTotalGB,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFile, setActiveFile] = useState<CreatedFile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // New file form
  const [newFileName, setNewFileName] = useState('');
  const [newFileExt, setNewFileExt] = useState('txt');
  const [newFileContent, setNewFileContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setNewFileName('');
    setNewFileExt('txt');
    setNewFileContent('');
    setIsCreating(true);
  };

  const handleSaveNewFile = () => {
    if (!newFileName.trim()) return;
    const cleanName = newFileName.includes('.')
      ? newFileName
      : `${newFileName.trim()}.${newFileExt}`;
    const ext = cleanName.split('.').pop() || newFileExt;

    onCreateFile({
      name: cleanName,
      extension: ext,
      content: newFileContent,
    });

    setIsCreating(false);
  };

  const handleOpenFile = (file: CreatedFile) => {
    setActiveFile(file);
    setEditContent(file.content);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!activeFile) return;
    onUpdateFile(activeFile.id, editContent);
    setActiveFile({
      ...activeFile,
      content: editContent,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setIsEditing(false);
  };

  const handleDownloadFile = (file: CreatedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyContent = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFileIcon = (ext: string) => {
    const lower = ext.toLowerCase();
    if (['html', 'htm', 'jsx', 'tsx', 'vue'].includes(lower)) {
      return <FileCode className="w-5 h-5 text-orange-400" />;
    }
    if (['js', 'ts', 'py', 'java', 'kt', 'cpp', 'c', 'json', 'css'].includes(lower)) {
      return <Code2 className="w-5 h-5 text-cyan-400" />;
    }
    return <FileText className="w-5 h-5 text-indigo-400" />;
  };

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.extension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col justify-between text-white animate-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Files & Documents / फ़ाइल प्रबंधक</h2>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <HardDrive className="w-3 h-3 text-cyan-400" /> {storageUsedMB} MB / {storageTotalGB} GB Android Storage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartCreate}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/25 transition-all"
          >
            <FilePlus className="w-4 h-4" /> नई फ़ाइल
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col p-4 max-w-4xl mx-auto w-full">
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="फ़ाइल खोजें (Search files)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* File View / Edit Modal */}
        {activeFile ? (
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in">
            {/* Active file toolbar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(activeFile.extension)}
                <div className="truncate">
                  <span className="font-bold text-xs text-white truncate block">{activeFile.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeFile.size} bytes • {activeFile.updatedAt || activeFile.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyContent(activeFile.id, activeFile.content)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                  title="कॉपी करें"
                >
                  {copiedId === activeFile.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDownloadFile(activeFile)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs flex items-center gap-1"
                  title="डाउनलोड करें (Download)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> सेव करें
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                    title="एडिट करें"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setActiveFile(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* File Content Display / Textarea */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-200">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-transparent border-0 outline-none text-cyan-200 font-mono resize-none leading-relaxed"
                  autoFocus
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono leading-relaxed break-all">
                  {activeFile.content || '(फ़ाइल रिक्त है)'}
                </pre>
              )}
            </div>
          </div>
        ) : (
          /* Files List Grid */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredFiles.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <FileCode className="w-12 h-12 text-slate-700 mb-2" />
                <p className="text-xs font-semibold text-slate-400">कोई फ़ाइल नहीं मिली</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  ऊपर "नई फ़ाइल" बटन दबाएँ या Myra AI से कहें: "मायरा, script.py फ़ाइल बनाओ"।
                </p>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleOpenFile(file)}
                  className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-800 group-hover:bg-cyan-500/10 border border-slate-700/60 transition-colors">
                      {getFileIcon(file.extension)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                        {file.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {file.size} bytes • {file.updatedAt || file.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                      title="डाउनलोड"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                      title="हटाएँ (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create New File Modal Overlay */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-cyan-400" /> नई फ़ाइल बनाएँ (Create New File)
              </h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">फ़ाइल का नाम</label>
                  <input
                    type="text"
                    placeholder="उदा: index, notes, main"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">एक्सटेंशन</label>
                  <select
                    value={newFileExt}
                    onChange={(e) => setNewFileExt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="txt">.txt (Text)</option>
                    <option value="html">.html (HTML)</option>
                    <option value="css">.css (CSS)</option>
                    <option value="js">.js (JavaScript)</option>
                    <option value="py">.py (Python)</option>
                    <option value="json">.json (JSON)</option>
                    <option value="md">.md (Markdown)</option>
                    <option value="kt">.kt (Kotlin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">सामग्री (File Content)</label>
                <textarea
                  rows={8}
                  placeholder="फ़ाइल में कोड या टेक्स्ट यहाँ लिखें..."
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  onClick={handleSaveNewFile}
                  disabled={!newFileName.trim()}
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30"
                >
                  फ़ाइल बनाएँ (Save File)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
