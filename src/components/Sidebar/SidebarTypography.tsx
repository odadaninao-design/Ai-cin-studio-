import React from 'react';
import { ProjectState } from '../../types/video';
import { Type, MessageSquare, Sparkles, Wand2 } from 'lucide-react';

interface SidebarTypographyProps {
  project: ProjectState;
  selectedClipId: string | null;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
}

export const SidebarTypography: React.FC<SidebarTypographyProps> = ({
  project,
  selectedClipId,
  onUpdateProject,
}) => {
  const activeClip = project.clips.find(c => c.id === selectedClipId) || project.clips[0];

  const handleVoiceoverChange = (text: string) => {
    if (!activeClip) return;
    onUpdateProject(prev => ({
      ...prev,
      clips: prev.clips.map(c =>
        c.id === activeClip.id ? { ...c, voiceover: text } : c
      ),
    }));
  };

  const sampleNarrations = [
    "Dans l'ombre des gratte-ciels, un secret refuse de mourir.",
    "Le vent du nord apporte avec lui la mémoire des géants.",
    "Chaque seconde qui passe est un choix irréversible.",
    "Quand la ville s'éteint, une autre vie commence.",
    "La réponse n'était pas dans les données, mais dans l'instant.",
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-300 select-none">
      {/* Header */}
      <div>
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-cyan-400" />
          <span>Voix-Off & Sous-Titres Cinématiques</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {activeClip ? `Narration pour « ${activeClip.title} »` : 'Sélectionnez un plan pour éditer sa voix-off'}
        </p>
      </div>

      {/* Voiceover Text Area */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span>Texte de Voix-Off / Narration</span>
          <span className="text-[10px] text-cyan-400 font-mono">SOUS-TITRE ACTIF</span>
        </label>
        <textarea
          value={activeClip?.voiceover || ''}
          onChange={e => handleVoiceoverChange(e.target.value)}
          placeholder="Entrez la narration de ce plan..."
          rows={3}
          className="w-full bg-[#10131d] border border-[#202637] hover:border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-all resize-none shadow-inner"
        />
      </div>

      {/* Quick Inspiration Phrases */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Suggestions de Narration Cinéma</span>
        </span>
        <div className="space-y-1.5">
          {sampleNarrations.map((narration, idx) => (
            <button
              key={idx}
              onClick={() => handleVoiceoverChange(narration)}
              className="w-full text-left p-2 rounded-lg bg-[#121520] hover:bg-[#181c2b] border border-[#1d2232] hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-200 transition-all cursor-pointer truncate"
            >
              « {narration} »
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle Style Box */}
      <div className="p-3.5 rounded-xl bg-[#121520] border border-[#202538] space-y-3">
        <h4 className="text-xs font-semibold text-slate-200">Style d'Affichage des Sous-Titres</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-black/60 border border-violet-500/40 text-center">
            <span className="text-white font-medium">Cinéma Classique</span>
            <span className="block text-[10px] text-slate-400 mt-1">Fond semi-opaque & ombre douce</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/30 border border-slate-700 text-center opacity-70">
            <span className="text-amber-300 font-medium">Néon Glow</span>
            <span className="block text-[10px] text-slate-400 mt-1">Lueur vibrante cyberpunk</span>
          </div>
        </div>
      </div>
    </div>
  );
};
