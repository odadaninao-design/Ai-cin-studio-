import React from 'react';
import { ProjectState, SoundMood } from '../../types/video';
import { adaptiveAudio } from '../../audio/adaptiveAudioEngine';
import { Music, Volume2, VolumeX, Radio, Sparkles, Activity, Play, Zap } from 'lucide-react';

interface SidebarAudioProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
}

export const SidebarAudio: React.FC<SidebarAudioProps> = ({
  project,
  onUpdateProject,
}) => {
  const soundtrack = project.soundtrack;

  const moods: { id: SoundMood; label: string; desc: string; bpm: number }[] = [
    {
      id: 'cyberpunk_synth',
      label: 'Cyberpunk Synthwave',
      desc: 'Basses 808 lourdes, arpèges analogiques et nappes futuristes',
      bpm: 110,
    },
    {
      id: 'epic_orchestral',
      label: 'Orchestral Épique (Hans Zimmer)',
      desc: 'Percussions Taiko massives, cordes majestueuses et cors puissants',
      bpm: 96,
    },
    {
      id: 'lofi_ambient',
      label: 'Lo-Fi Chillout Mélancolique',
      desc: 'Accords de Rhodes chaleureux, crépitement vinyle et tempo doux',
      bpm: 80,
    },
    {
      id: 'dark_suspense',
      label: 'Suspense & Mystère Sombre',
      desc: 'Sous-basses telluriques dissonantes et pulsations cardiaques',
      bpm: 78,
    },
    {
      id: 'uplifting_cinema',
      label: 'Cinéma Lumineux & Émouvant',
      desc: 'Progressions majeures inspirantes, cloches et montées émotionnelles',
      bpm: 104,
    },
    {
      id: 'action_hybrid',
      label: 'Action Industrielle Hybride',
      desc: 'Rythmique 16e de seconde implacable et synthétiseurs agressifs',
      bpm: 120,
    },
  ];

  const handleMoodChange = (moodId: SoundMood) => {
    const selected = moods.find(m => m.id === moodId);
    onUpdateProject(prev => ({
      ...prev,
      soundtrack: {
        ...prev.soundtrack,
        mood: moodId,
        bpm: selected ? selected.bpm : prev.soundtrack.bpm,
      },
    }));
  };

  const handleStemVolumeChange = (stemName: keyof typeof soundtrack.stems, volume: number) => {
    onUpdateProject(prev => ({
      ...prev,
      soundtrack: {
        ...prev.soundtrack,
        stems: {
          ...prev.soundtrack.stems,
          [stemName]: {
            ...prev.soundtrack.stems[stemName],
            volume,
          },
        },
      },
    }));
  };

  const handleStemMuteToggle = (stemName: keyof typeof soundtrack.stems) => {
    onUpdateProject(prev => ({
      ...prev,
      soundtrack: {
        ...prev.soundtrack,
        stems: {
          ...prev.soundtrack.stems,
          [stemName]: {
            ...prev.soundtrack.stems[stemName],
            muted: !prev.soundtrack.stems[stemName].muted,
          },
        },
      },
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-300 select-none">
      {/* Header */}
      <div>
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bande-Son Adaptative & Stems</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Moteur de synthèse sonore procédural calé en temps réel sur les plans
        </p>
      </div>

      {/* Mood Selector Cards */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span>Ambiance Musicale</span>
          <span className="font-mono text-emerald-400 text-[11px]">{soundtrack.bpm} BPM</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {moods.map(m => {
            const isSelected = soundtrack.mood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleMoodChange(m.id)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#141e1c] border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-[#10131e] border-[#1d2232] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{m.label}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    {m.bpm} BPM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tempo BPM Slider */}
      <div className="p-3 rounded-xl bg-[#121520] border border-[#202538] space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-200">Tempo / BPM</span>
          <span className="font-mono text-emerald-400">{soundtrack.bpm} BPM</span>
        </div>
        <input
          type="range"
          min={60}
          max={140}
          step={2}
          value={soundtrack.bpm}
          onChange={e => {
            const val = Number(e.target.value);
            onUpdateProject(prev => ({
              ...prev,
              soundtrack: { ...prev.soundtrack, bpm: val },
            }));
          }}
          className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-[#202638] rounded-lg"
        />
      </div>

      {/* 5-Channel STEM Mixer */}
      <div className="p-3.5 rounded-xl bg-[#121520] border border-[#202538] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mixeur de Stems Multi-Pistes</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">5 CANAUX</span>
        </div>

        <div className="space-y-3">
          {(Object.keys(soundtrack.stems) as Array<keyof typeof soundtrack.stems>).map(stemKey => {
            const stem = soundtrack.stems[stemKey];
            return (
              <div key={stemKey} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{stem.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px]">
                      {stem.muted ? 'MUET' : `${Math.round(stem.volume * 100)}%`}
                    </span>
                    <button
                      onClick={() => handleStemMuteToggle(stemKey)}
                      className={`p-1 rounded cursor-pointer ${
                        stem.muted
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title={stem.muted ? 'Rétablir la piste' : 'Couper la piste'}
                    >
                      {stem.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={stem.muted ? 0 : stem.volume}
                  onChange={e => handleStemVolumeChange(stemKey, Number(e.target.value))}
                  disabled={stem.muted}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#202638] rounded-lg disabled:opacity-30"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* SFX Instant Soundboard */}
      <div className="p-3.5 rounded-xl bg-[#121520] border border-[#202538] space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Table d'Effets Sonores (SFX Cinéma)</span>
        </h4>
        <p className="text-[10px] text-slate-400">
          Cliquez pour déclencher en direct ou intégrer dans les plans
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => adaptiveAudio.triggerSfx('boom')}
            className="p-2 rounded-lg bg-[#191e2e] hover:bg-[#20263c] border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-between active:scale-95 transition-all cursor-pointer"
          >
            <span>Sub-Boom Taiko</span>
            <Play className="w-3 h-3 text-amber-400" />
          </button>
          <button
            onClick={() => adaptiveAudio.triggerSfx('whoosh')}
            className="p-2 rounded-lg bg-[#191e2e] hover:bg-[#20263c] border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-between active:scale-95 transition-all cursor-pointer"
          >
            <span>Whoosh Transition</span>
            <Play className="w-3 h-3 text-cyan-400" />
          </button>
          <button
            onClick={() => adaptiveAudio.triggerSfx('riser')}
            className="p-2 rounded-lg bg-[#191e2e] hover:bg-[#20263c] border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-between active:scale-95 transition-all cursor-pointer"
          >
            <span>Montée Riser Tension</span>
            <Play className="w-3 h-3 text-violet-400" />
          </button>
          <button
            onClick={() => adaptiveAudio.triggerSfx('glitch')}
            className="p-2 rounded-lg bg-[#191e2e] hover:bg-[#20263c] border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-between active:scale-95 transition-all cursor-pointer"
          >
            <span>Glitch Cybernétique</span>
            <Play className="w-3 h-3 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
