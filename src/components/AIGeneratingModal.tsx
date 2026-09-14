import React, { useState, useEffect } from 'react';
import { Sparkles, Clapperboard, Film, Music, Palette, Camera } from 'lucide-react';

interface AIGeneratingModalProps {
  isOpen: boolean;
  prompt: string;
  agentName?: string;
}

export const AIGeneratingModal: React.FC<AIGeneratingModalProps> = ({
  isOpen,
  prompt,
  agentName = 'Google Veo 2',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { label: 'Analyse dramaturgique et découpage du scénario...', icon: <Film className="w-4 h-4 text-violet-400" /> },
    { label: 'Calcul des trajectoires et mouvements de caméra cinématographiques...', icon: <Camera className="w-4 h-4 text-cyan-400" /> },
    { label: 'Harmonisation de l\'étalonnage colorimétrique et filtres d\'ambiance...', icon: <Palette className="w-4 h-4 text-amber-400" /> },
    { label: 'Composition en temps réel de la bande-son adaptative...', icon: <Music className="w-4 h-4 text-emerald-400" /> },
    { label: 'Assemblage final de la séquence sur la timeline...', icon: <Clapperboard className="w-4 h-4 text-rose-400" /> },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-[#0e111a] border border-[#262c3e] rounded-2xl p-7 shadow-2xl shadow-violet-950/40 text-center space-y-6">
        {/* Animated Icon Ring */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>

        {/* Title & User Prompt */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-mono">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Moteur : {agentName}</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-wide uppercase">
            Réalisation Cinématographique IA
          </h3>
          <p className="text-xs text-slate-400 italic line-clamp-2 px-4">
            « {prompt} »
          </p>
        </div>

        {/* Animated Steps Progress List */}
        <div className="space-y-2.5 text-left bg-[#080a0f] p-4 rounded-xl border border-white/5">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                  isCurrent
                    ? 'text-white font-medium scale-[1.01]'
                    : isCompleted
                    ? 'text-slate-400 opacity-60'
                    : 'text-slate-600 opacity-30'
                }`}
              >
                <div className="shrink-0">{step.icon}</div>
                <span className="truncate">{step.label}</span>
                {isCompleted && (
                  <span className="ml-auto text-[10px] font-mono text-emerald-400">FAIT</span>
                )}
                {isCurrent && (
                  <span className="ml-auto text-[10px] font-mono text-violet-400 animate-pulse">EN COURS</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500">
          Génération automatisée 100% gratuite • Prise en charge des caméras virtuelles et du mixage dynamique
        </p>
      </div>
    </div>
  );
};
