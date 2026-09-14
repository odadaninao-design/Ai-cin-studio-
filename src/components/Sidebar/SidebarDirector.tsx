import React, { useState } from 'react';
import { ProjectState, ArtisticFilter } from '../../types/video';
import { AiVideoAgentId } from '../../types/agents';
import { AI_VIDEO_AGENTS, getAgentById } from '../../data/aiVideoAgents';
import { Sparkles, Wand2, Film, Clock, Layers, Flame, Cpu, ArrowRight } from 'lucide-react';

interface SidebarDirectorProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onGenerateAI: (
    prompt: string,
    style: string,
    duration: number,
    filter: ArtisticFilter,
    agentId?: AiVideoAgentId
  ) => void;
  isGenerating: boolean;
  onNavigateToAgents?: () => void;
}

export const SidebarDirector: React.FC<SidebarDirectorProps> = ({
  project,
  onUpdateProject,
  onGenerateAI,
  isGenerating,
  onNavigateToAgents,
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cyberpunk');
  const [targetDuration, setTargetDuration] = useState(15);
  const [selectedFilter, setSelectedFilter] = useState<ArtisticFilter>('neo_noir');
  const [selectedAgentId, setSelectedAgentId] = useState<AiVideoAgentId>(
    project.activeAgentId || 'google_veo_2'
  );

  const activeAgent = getAgentById(selectedAgentId);

  const inspirationPresets = [
    {
      title: 'Cyberpunk 2088',
      desc: 'Un détective cyborg dans les ruelles pluvieuses de Neo-Tokyo sous les néons',
      style: 'cyberpunk',
      filter: 'neo_noir' as ArtisticFilter,
    },
    {
      title: 'Film Noir 1940',
      desc: 'Enquête sous la pluie à Paris, ombres de stores vénitiens et mystère',
      style: 'cinema_noir',
      filter: 'bw_noir' as ArtisticFilter,
    },
    {
      title: 'Nature IMAX 70mm',
      desc: 'Survol drone majestueux de crêtes enneigées caressées par le soleil levant',
      style: 'epic_nature',
      filter: 'golden_hour' as ArtisticFilter,
    },
    {
      title: 'Blade Runner',
      desc: 'Dunes incandescentes, tempête ambrée et architectures monumentales',
      style: 'blade_runner',
      filter: 'blade_runner' as ArtisticFilter,
    },
    {
      title: 'Odyssée Spatiale',
      desc: 'Un vaisseau explorant les anneaux d\'une géante gazeuse à la lisière du cosmos',
      style: 'sci_fi',
      filter: 'nolan_imax' as ArtisticFilter,
    },
  ];

  const handleApplyInspiration = (preset: typeof inspirationPresets[0]) => {
    setPromptText(preset.desc);
    setSelectedStyle(preset.style);
    setSelectedFilter(preset.filter);
  };

  const handleTriggerGenerate = () => {
    const text = promptText.trim() || 'Une séquence cinématographique spectaculaire haute définition';
    onGenerateAI(text, selectedStyle, targetDuration, selectedFilter, selectedAgentId);
  };

  const handleSelectAgent = (id: AiVideoAgentId) => {
    setSelectedAgentId(id);
    onUpdateProject(prev => ({
      ...prev,
      activeAgentId: id,
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-300 select-none">
      {/* Introduction Hero Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-950/40 via-[#141824] to-[#0f111a] border border-violet-500/20 space-y-2">
        <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Réalisateur IA & Scénarimage</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Décrivez simplement votre idée de scène. Notre IA conçoit automatiquement le découpage en plans, les mouvements de caméra fluides, l'étalonnage artistique et la bande-son adaptative.
        </p>
      </div>

      {/* Main Text Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span>Vision Cinématographique (Texte simple)</span>
          <span className="text-[10px] text-emerald-400 font-medium">100% Gratuit & Illimité</span>
        </label>
        <div className="relative">
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            placeholder="Ex : Un voyageur solitaire traverse une forêt bioluminescente au crépuscule sous une pluie d'étoiles filantes..."
            rows={4}
            className="w-full bg-[#10131d] border border-[#202637] hover:border-slate-700 focus:border-violet-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-all resize-none shadow-inner"
          />
        </div>
      </div>

      {/* Inspirations & Quick Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Inspirations de Réalisateurs</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {inspirationPresets.map((insp, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyInspiration(insp)}
              className="text-left p-2 rounded-lg bg-[#121520] hover:bg-[#181c2b] border border-[#1d2232] hover:border-violet-500/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-200 group-hover:text-violet-300 transition-colors">
                  {insp.title}
                </span>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                  {(insp.filter || 'clean_cinema').replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{insp.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* AI Video Agent Selector */}
      <div className="space-y-2 pt-2 border-t border-[#1a1f2c]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span>Moteur Vidéo IA</span>
          </label>
          {onNavigateToAgents && (
            <button
              type="button"
              onClick={onNavigateToAgents}
              className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5 cursor-pointer font-medium"
            >
              <span>Voir les {AI_VIDEO_AGENTS.length} agents</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={selectedAgentId}
            onChange={e => handleSelectAgent(e.target.value as AiVideoAgentId)}
            className="w-full bg-[#10131d] border border-violet-500/30 hover:border-violet-500/60 rounded-xl px-3 py-2 text-xs text-white font-medium outline-none cursor-pointer appearance-none shadow-sm"
          >
            {AI_VIDEO_AGENTS.map(agent => (
              <option key={agent.id} value={agent.id} className="bg-[#10131d] text-white">
                {agent.name} ({agent.provider}) — {agent.badge}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {/* Selected Agent Quick Pill */}
        <div className="p-2.5 rounded-lg bg-[#121626] border border-[#1d243a] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-medium">{activeAgent.name}</span>
            <span className="text-slate-400 text-[10px]">({activeAgent.version})</span>
          </div>
          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${activeAgent.themeColor.badgeBg} ${activeAgent.themeColor.badgeText}`}>
            {activeAgent.badge}
          </span>
        </div>
      </div>

      {/* Production Settings */}
      <div className="space-y-3 pt-2 border-t border-[#1a1f2c]">
        {/* Target Duration */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Durée de la Séquence</span>
            </span>
            <span className="font-mono text-cyan-400 text-xs">{targetDuration}s (~{Math.ceil(targetDuration / 4.5)} plans)</span>
          </div>
          <input
            type="range"
            min={10}
            max={45}
            step={5}
            value={targetDuration}
            onChange={e => setTargetDuration(Number(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer h-1.5 bg-[#1a1f2c] rounded-lg"
          />
        </div>

        {/* Initial Filter / Mood */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>Filtre Artistique Principal</span>
          </label>
          <select
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value as ArtisticFilter)}
            className="w-full bg-[#10131d] border border-[#202637] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
          >
            <option value="neo_noir">Neo Noir Cyberpunk (Teal & Magenta)</option>
            <option value="blade_runner">Blade Runner 2049 (Brumes Ambrées)</option>
            <option value="wes_anderson">Pastel Wes Anderson (Symphonie Pastel)</option>
            <option value="kodak_35mm">Kodak Portra 400 (Argentique 35mm)</option>
            <option value="nolan_imax">Christopher Nolan IMAX (Bleu Acier 70mm)</option>
            <option value="golden_hour">Heure Dorée (Soleil Couchant)</option>
            <option value="bw_noir">Noir & Blanc 1940 (Clair-Obscur)</option>
            <option value="matrix_phosphor">Phosphore Matrix (Vert CRT)</option>
            <option value="vintage_vhs">Rétro Cassette VHS (Scanlines)</option>
          </select>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={handleTriggerGenerate}
        disabled={isGenerating}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-xs text-white shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isGenerating
            ? 'bg-slate-800 text-slate-400 cursor-wait'
            : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/25 active:scale-95'
        }`}
      >
        <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'text-amber-300'}`} />
        <span>
          {isGenerating ? 'Création de la vidéo IA en cours...' : 'Transformer en Vidéo Cinématographique'}
        </span>
      </button>
    </div>
  );
};
