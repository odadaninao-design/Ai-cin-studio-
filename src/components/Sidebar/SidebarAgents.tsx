import React, { useState } from 'react';
import { ProjectState, ArtisticFilter } from '../../types/video';
import { AiVideoAgent, AiVideoAgentId, AgentCategory } from '../../types/agents';
import { AI_VIDEO_AGENTS, getAgentById } from '../../data/aiVideoAgents';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  Sliders,
  Play,
  Layers,
  Zap,
  ShieldCheck,
  Video,
  Eye,
  Camera,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';

interface SidebarAgentsProps {
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
}

export const SidebarAgents: React.FC<SidebarAgentsProps> = ({
  project,
  onUpdateProject,
  onGenerateAI,
  isGenerating,
}) => {
  const currentAgentId: AiVideoAgentId = project.activeAgentId || 'google_veo_2';
  const activeAgent = getAgentById(currentAgentId);

  const [selectedCategory, setSelectedCategory] = useState<AgentCategory>('all');
  const [testPrompt, setTestPrompt] = useState(activeAgent.samplePrompts[0] || '');
  const [motionScale, setMotionScale] = useState(activeAgent.defaultConfig.motionScale);
  const [promptAdherence, setPromptAdherence] = useState(activeAgent.defaultConfig.promptAdherence);
  const [cameraMode, setCameraMode] = useState(activeAgent.defaultConfig.cameraMovement);
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  const [expandedAgentId, setExpandedAgentId] = useState<AiVideoAgentId | null>(null);

  const filteredAgents = AI_VIDEO_AGENTS.filter(agent => {
    if (selectedCategory === 'all') return true;
    return agent.category === selectedCategory;
  });

  const handleSelectAgent = (agent: AiVideoAgent) => {
    onUpdateProject(prev => ({
      ...prev,
      activeAgentId: agent.id,
    }));
    setMotionScale(agent.defaultConfig.motionScale);
    setPromptAdherence(agent.defaultConfig.promptAdherence);
    setCameraMode(agent.defaultConfig.cameraMovement);
    if (agent.samplePrompts[0]) {
      setTestPrompt(agent.samplePrompts[0]);
    }
  };

  const handleRunAgentGeneration = () => {
    const promptToUse =
      testPrompt.trim() ||
      activeAgent.samplePrompts[0] ||
      'Séquence cinématographique spectaculaire réalisée avec ' + activeAgent.name;

    onGenerateAI(
      promptToUse,
      activeAgent.name.toLowerCase().includes('veo') ? 'cinematic_4k' : 'cinematic',
      15,
      project.globalFilter,
      activeAgent.id
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-300 select-none">
      {/* Active Agent Hero Showcase */}
      <div className="relative overflow-hidden rounded-2xl p-4 bg-[#0d1019] border border-violet-500/30 shadow-xl shadow-black/40">
        <div
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: activeAgent.themeColor.accent }}
        />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300">
                <Cpu className="w-3 h-3 text-violet-400" />
                <span>Agent Actif</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Prêt</span>
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
              <span>{activeAgent.name}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                {activeAgent.version}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{activeAgent.provider}</p>
          </div>

          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide uppercase ${activeAgent.themeColor.badgeBg} ${activeAgent.themeColor.badgeText} border border-white/10`}
          >
            {activeAgent.badge}
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed relative z-10">
          {activeAgent.tagline}
        </p>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#1a2030] relative z-10">
          <div className="bg-[#121624] p-2 rounded-lg border border-[#1e2538]">
            <div className="text-[10px] text-slate-400">Photoréalisme</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
              {activeAgent.metrics.photorealism}%
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${activeAgent.metrics.photorealism}%` }}
              />
            </div>
          </div>

          <div className="bg-[#121624] p-2 rounded-lg border border-[#1e2538]">
            <div className="text-[10px] text-slate-400">Mouvement</div>
            <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">
              {activeAgent.metrics.motionQuality}%
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full"
                style={{ width: `${activeAgent.metrics.motionQuality}%` }}
              />
            </div>
          </div>

          <div className="bg-[#121624] p-2 rounded-lg border border-[#1e2538]">
            <div className="text-[10px] text-slate-400">Vitesse Rendu</div>
            <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
              {activeAgent.metrics.renderSpeed}%
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{ width: `${activeAgent.metrics.renderSpeed}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Trigger Button */}
        <div className="mt-3.5 flex gap-2">
          <button
            onClick={handleRunAgentGeneration}
            disabled={isGenerating}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 active:scale-95 shadow-violet-600/20'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : 'text-amber-300'}`} />
            <span>
              {isGenerating ? 'Génération par l\'agent...' : `Générer avec ${activeAgent.name}`}
            </span>
          </button>

          <button
            onClick={() => setShowConfigDetails(!showConfigDetails)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showConfigDetails
                ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                : 'bg-[#121624] border-[#22283a] text-slate-300 hover:text-white'
            }`}
            title="Ajuster les paramètres de l'agent"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Agent Configuration Drawer */}
      {showConfigDetails && (
        <div className="p-3.5 rounded-xl bg-[#0f131f] border border-[#232b3d] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span>Paramètres Moteur ({activeAgent.name})</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Max {activeAgent.maxResolution.toUpperCase()} • {activeAgent.maxDurationSeconds}s
            </span>
          </div>

          {/* Motion Scale Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 text-[11px]">Échelle de Mouvement (Motion Scale)</span>
              <span className="font-mono text-cyan-400 text-xs">{motionScale}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={motionScale}
              onChange={e => setMotionScale(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#1b2131] rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Subtil</span>
              <span>Cinématique</span>
              <span>Dynamique</span>
            </div>
          </div>

          {/* Prompt Adherence (CFG) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 text-[11px]">Adhérence au Prompt (CFG Scale)</span>
              <span className="font-mono text-violet-400 text-xs">{promptAdherence}</span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={promptAdherence}
              onChange={e => setPromptAdherence(Number(e.target.value))}
              className="w-full accent-violet-400 cursor-pointer h-1.5 bg-[#1b2131] rounded-lg"
            />
          </div>

          {/* Camera Motion Mode */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Contrôle Caméra Spécifique</label>
            <select
              value={cameraMode}
              onChange={e => setCameraMode(e.target.value as any)}
              className="w-full bg-[#141826] border border-[#252e42] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="auto">Automatique (Selon la narration)</option>
              <option value="dolly">Dolly Cinémascope (Zoom fluide)</option>
              <option value="pan">Panoramique Horizontal</option>
              <option value="orbit">Orbite 360° Circulaire</option>
              <option value="fpv_drone">Vol Drone FPV Haute Vitesse</option>
              <option value="handheld">Caméra Épaule Réaliste</option>
            </select>
          </div>

          {/* Test Prompt Input */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Invite de Test Spécifique</label>
            <textarea
              value={testPrompt}
              onChange={e => setTestPrompt(e.target.value)}
              rows={2}
              className="w-full bg-[#141826] border border-[#252e42] rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 outline-none resize-none focus:border-violet-500"
              placeholder="Décrivez votre plan pour tester cet agent..."
            />
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Catalogue des Agents IA ({AI_VIDEO_AGENTS.length})</span>
          </span>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {[
            { id: 'all' as AgentCategory, label: 'Tous' },
            { id: 'cinema' as AgentCategory, label: 'Cinéma & 4K' },
            { id: 'realism' as AgentCategory, label: 'Photoréalisme' },
            { id: 'multimodal' as AgentCategory, label: 'Audio-Vidéo Foley' },
            { id: 'motion' as AgentCategory, label: 'Mouvement DiT' },
            { id: 'vfx' as AgentCategory, label: 'VFX & Effets' },
            { id: 'open_source' as AgentCategory, label: 'Open Source' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer font-medium ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-[#121624] text-slate-400 hover:text-white hover:bg-[#181e30]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* All AI Video Agents List */}
      <div className="space-y-2.5">
        {filteredAgents.map(agent => {
          const isCurrent = agent.id === currentAgentId;
          const isExpanded = expandedAgentId === agent.id;

          return (
            <div
              key={agent.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isCurrent
                  ? 'bg-[#121626] border-violet-500/50 shadow-md shadow-violet-950/30'
                  : 'bg-[#0f121a] hover:bg-[#131722] border-[#1d2332] hover:border-slate-700'
              }`}
            >
              {/* Card Header & Summary */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-white truncate">
                        {agent.name}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${agent.themeColor.badgeBg} ${agent.themeColor.badgeText}`}
                      >
                        {agent.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {agent.provider} • {agent.version}
                    </p>
                  </div>

                  {/* Active or Select Button */}
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-400 bg-violet-950/60 px-2 py-1 rounded-lg border border-violet-500/40 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Actif</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelectAgent(agent)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#1a2133] hover:bg-violet-600 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer"
                    >
                      Activer
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                {/* Capabilities Pills */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {agent.capabilities.slice(0, 3).map((cap, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-medium bg-[#161c2c] text-slate-300 px-1.5 py-0.5 rounded border border-[#20283e]"
                    >
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="text-[9px] text-slate-500 self-center">
                      +{agent.capabilities.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer Controls / Expand */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1b2131] text-[10px]">
                  <div className="flex items-center gap-2 font-mono text-slate-400">
                    <span>{agent.maxResolution.toUpperCase()}</span>
                    <span>•</span>
                    <span>Jusqu'à {agent.maxDurationSeconds}s</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent.id)}
                      className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-0.5"
                    >
                      <span>{isExpanded ? 'Moins d\'infos' : 'Détails & Prompts'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details & Sample Prompts */}
              {isExpanded && (
                <div className="p-3 bg-[#0a0d14] border-t border-[#1a2030] space-y-2.5 text-xs animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Capacités Clés
                    </span>
                    <ul className="space-y-1">
                      {agent.capabilities.map((cap, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sample Prompts */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Exemples de Prompts Recommandés
                    </span>
                    {agent.samplePrompts.map((sample, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#111520] border border-[#1d2334] text-[11px] text-slate-300 group cursor-pointer hover:border-violet-500/50 transition-colors"
                        onClick={() => {
                          setTestPrompt(sample);
                          handleSelectAgent(agent);
                          setShowConfigDetails(true);
                        }}
                      >
                        <p className="line-clamp-2 italic text-slate-300">« {sample} »</p>
                        <div className="flex items-center gap-1 text-[9px] text-violet-400 font-medium mt-1">
                          <span>Appliquer & Tester</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
