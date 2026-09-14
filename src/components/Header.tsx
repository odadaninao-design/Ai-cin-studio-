import React from 'react';
import { ProjectState, AspectRatio } from '../types/video';
import { Sparkles, Download, Film, Monitor, Smartphone, Square, Clapperboard } from 'lucide-react';

interface HeaderProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onOpenAiModal: () => void;
  onOpenExportModal: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  onOpenAiModal,
  onOpenExportModal,
  onOpenInstallModal,
}) => {
  const aspectRatios: { id: AspectRatio; label: string; icon: React.ReactNode }[] = [
    { id: '16:9', label: '16:9 Cinéma', icon: <Monitor className="w-3.5 h-3.5" /> },
    { id: '9:16', label: '9:16 Reels/TikTok', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: '21:9', label: '21:9 Anamorphic', icon: <Film className="w-3.5 h-3.5" /> },
    { id: '1:1', label: '1:1 Carré', icon: <Square className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-14 border-b border-[#1e2330] bg-[#0c0e14] px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30">
          <Clapperboard className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-sm tracking-wider bg-gradient-to-r from-violet-200 via-white to-cyan-200 bg-clip-text text-transparent">
            CINE<span className="text-violet-400">AI</span> STUDIO
          </span>
        </div>

        {/* Free Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>100% Gratuit & Illimité</span>
        </div>

        {/* Project Title Input */}
        <div className="hidden md:flex items-center ml-2">
          <input
            type="text"
            value={project.title}
            onChange={e => onUpdateProject(prev => ({ ...prev, title: e.target.value }))}
            className="bg-transparent hover:bg-white/5 focus:bg-white/10 text-xs text-slate-200 font-medium px-2 py-1 rounded border border-transparent hover:border-slate-800 focus:border-slate-700 outline-none transition-colors max-w-[220px] truncate"
            title="Cliquez pour renommer le projet"
          />
        </div>
      </div>

      {/* Middle: Aspect Ratio Switcher */}
      <div className="flex items-center gap-1 bg-[#141722] p-1 rounded-lg border border-[#1f2433]">
        {aspectRatios.map(aspect => (
          <button
            key={aspect.id}
            onClick={() => onUpdateProject(prev => ({ ...prev, aspectRatio: aspect.id }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              project.aspectRatio === aspect.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title={`Format ${aspect.label}`}
          >
            {aspect.icon}
            <span className="hidden lg:inline">{aspect.label}</span>
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Install on Mobile Button */}
        <button
          onClick={onOpenInstallModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          title="Installer CineAI sur iPhone ou Android"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Sur mon Téléphone</span>
          <span className="sm:hidden">App</span>
        </button>

        {/* AI Generator Button */}
        <button
          onClick={onOpenAiModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
          <span>Générateur IA</span>
        </button>

        {/* Export Video Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-100 text-xs font-medium transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Exporter Vidéo</span>
        </button>
      </div>
    </header>
  );
};
