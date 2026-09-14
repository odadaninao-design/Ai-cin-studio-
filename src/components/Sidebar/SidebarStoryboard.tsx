import React, { useRef } from 'react';
import { ProjectState, VideoClip, CameraMotion, ArtisticFilter } from '../../types/video';
import { AiVideoAgentId } from '../../types/agents';
import { AI_VIDEO_AGENTS, getAgentById } from '../../data/aiVideoAgents';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown, Upload, Video, Camera, Sparkles, Cpu } from 'lucide-react';

interface SidebarStoryboardProps {
  project: ProjectState;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onOpenNewShotModal: () => void;
}

export const SidebarStoryboard: React.FC<SidebarStoryboardProps> = ({
  project,
  selectedClipId,
  onSelectClip,
  onUpdateProject,
  onOpenNewShotModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeClipIndex = project.clips.findIndex(c => c.id === selectedClipId);
  const selectedClip = activeClipIndex !== -1 ? project.clips[activeClipIndex] : project.clips[0];

  // Move clip up or down
  const moveClip = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= project.clips.length) return;
    onUpdateProject(prev => {
      const copy = [...prev.clips];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return { ...prev, clips: copy };
    });
  };

  // Duplicate clip
  const duplicateClip = (index: number) => {
    const orig = project.clips[index];
    const copy: VideoClip = {
      ...orig,
      id: `clip_${Date.now()}`,
      title: `${orig.title} (Copie)`,
    };
    onUpdateProject(prev => {
      const newClips = [...prev.clips];
      newClips.splice(index + 1, 0, copy);
      return { ...prev, clips: newClips };
    });
    onSelectClip(copy.id);
  };

  // Delete clip
  const deleteClip = (index: number) => {
    if (project.clips.length <= 1) return;
    onUpdateProject(prev => ({
      ...prev,
      clips: prev.clips.filter((_, i) => i !== index),
    }));
  };

  // Handle local media upload (image or video frame)
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClip) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onUpdateProject(prev => ({
        ...prev,
        clips: prev.clips.map(c =>
          c.id === selectedClip.id ? { ...c, imageUrl: result } : c
        ),
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-300 select-none">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMediaUpload}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Header & Add Shot */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Scénarimage & Plans ({project.clips.length})
          </h3>
          <p className="text-[11px] text-slate-400">Gérez chaque plan cinématographique</p>
        </div>
        <button
          onClick={onOpenNewShotModal}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter</span>
        </button>
      </div>

      {/* Clip List Carousel / Stack */}
      <div className="space-y-2.5">
        {project.clips.map((clip, idx) => {
          const isSelected = selectedClip?.id === clip.id;
          return (
            <div
              key={clip.id}
              onClick={() => onSelectClip(clip.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#181c2b] border-violet-500 shadow-md shadow-violet-500/10'
                  : 'bg-[#10131d] border-[#1d2232] hover:border-slate-700'
              }`}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-lg bg-slate-900 border border-white/10 overflow-hidden shrink-0 relative">
                  {clip.imageUrl ? (
                    <img src={clip.imageUrl} alt={clip.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Video className="w-5 h-5" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 font-mono text-[9px] text-white">
                    {clip.duration.toFixed(1)}s
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">
                        {idx + 1}. {clip.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{clip.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {clip.generatedByAgent && (
                      <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                        {getAgentById(clip.generatedByAgent).name.split(' ')[0]}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-violet-300 bg-violet-950/60 px-1.5 py-0.5 rounded">
                      {(clip.camera?.motion || 'dolly_in').replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded">
                      {(clip.filter || project.globalFilter || 'clean_cinema').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-center justify-between border-l border-[#222838] pl-2 text-slate-500">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        moveClip(idx, -1);
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Monter le plan"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        moveClip(idx, 1);
                      }}
                      disabled={idx === project.clips.length - 1}
                      className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Descendre le plan"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Clip Inspector (Fine-tuning) */}
      {selectedClip && (
        <div className="p-3.5 rounded-xl bg-[#121520] border border-[#22283a] space-y-4">
          <div className="flex items-center justify-between border-b border-[#202538] pb-2">
            <span className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Paramètres du Plan Actif</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => duplicateClip(activeClipIndex)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                title="Dupliquer ce plan"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {project.clips.length > 1 && (
                <button
                  onClick={() => deleteClip(activeClipIndex)}
                  className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                  title="Supprimer ce plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">Titre du Plan</label>
            <input
              type="text"
              value={selectedClip.title}
              onChange={e => {
                const val = e.target.value;
                onUpdateProject(prev => ({
                  ...prev,
                  clips: prev.clips.map(c => (c.id === selectedClip.id ? { ...c, title: val } : c)),
                }));
              }}
              className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Durée du Plan</span>
              <span className="font-mono text-cyan-400">{selectedClip.duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={1.5}
              max={10.0}
              step={0.5}
              value={selectedClip.duration}
              onChange={e => {
                const val = Number(e.target.value);
                onUpdateProject(prev => ({
                  ...prev,
                  clips: prev.clips.map(c => (c.id === selectedClip.id ? { ...c, duration: val } : c)),
                }));
              }}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#202638] rounded-lg"
            />
          </div>

          {/* Camera Motion */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">Mouvement de Caméra</label>
            <select
              value={selectedClip.camera?.motion || 'dolly_in'}
              onChange={e => {
                const motion = e.target.value as CameraMotion;
                onUpdateProject(prev => ({
                  ...prev,
                  clips: prev.clips.map(c =>
                    c.id === selectedClip.id ? { ...c, camera: { ...(c.camera || { speed: 1, intensity: 0.8 }), motion } } : c
                  ),
                }));
              }}
              className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="dolly_in">Dolly Avant (Zoom avant cinématique)</option>
              <option value="dolly_out">Dolly Arrière (Révélation large)</option>
              <option value="pan_left">Panoramique Gauche</option>
              <option value="pan_right">Panoramique Droite</option>
              <option value="tilt_up">Travelling Haut (Plongée vers ciel)</option>
              <option value="tilt_down">Travelling Bas (Contre-plongée)</option>
              <option value="orbit">Orbite Circulaire 2.5D</option>
              <option value="zoom_in">Zoom Punch Dynamique</option>
              <option value="handheld">Caméra Épaule Naturelle</option>
              <option value="static">Plan Fixe Précis</option>
            </select>
          </div>

          {/* Assigned AI Video Agent */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>Agent IA de Rendu</span>
            </label>
            <select
              value={selectedClip.generatedByAgent || project.activeAgentId || 'google_veo_2'}
              onChange={e => {
                const agentId = e.target.value as AiVideoAgentId;
                onUpdateProject(prev => ({
                  ...prev,
                  clips: prev.clips.map(c =>
                    c.id === selectedClip.id ? { ...c, generatedByAgent: agentId } : c
                  ),
                }));
              }}
              className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              {AI_VIDEO_AGENTS.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} — {agent.badge}
                </option>
              ))}
            </select>
          </div>

          {/* Replace Image / Media upload */}
          <div className="pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Remplacer l'image par un fichier local</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
