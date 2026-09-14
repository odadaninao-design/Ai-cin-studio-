import React, { useState } from 'react';
import { VideoClip, CameraMotion, ArtisticFilter } from '../types/video';
import { AiVideoAgentId } from '../types/agents';
import { AI_VIDEO_AGENTS } from '../data/aiVideoAgents';
import { Plus, Film, X, Sparkles, Cpu } from 'lucide-react';

interface NewShotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShot: (newClip: VideoClip) => void;
  defaultFilter: ArtisticFilter;
  activeAgentId?: AiVideoAgentId;
}

export const NewShotModal: React.FC<NewShotModalProps> = ({
  isOpen,
  onClose,
  onAddShot,
  defaultFilter,
  activeAgentId = 'google_veo_2',
}) => {
  const [title, setTitle] = useState('Nouveau Plan');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(4.0);
  const [motion, setMotion] = useState<CameraMotion>('dolly_in');
  const [selectedAgent, setSelectedAgent] = useState<AiVideoAgentId>(activeAgentId);
  const [voiceover, setVoiceover] = useState('');
  const [selectedImage, setSelectedImage] = useState(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80'
  );

  if (!isOpen) return null;

  const stockThumbnails = [
    { label: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80' },
    { label: 'Cyborg Code', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80' },
    { label: 'Ruelle Brumeuse', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80' },
    { label: 'Tour Monolithe', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80' },
    { label: 'Montagne 70mm', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80' },
    { label: 'Lac Turquoise', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80' },
    { label: 'Film Noir 1940', url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80' },
    { label: 'Soleil Couchant', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=80' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clip: VideoClip = {
      id: `clip_${Date.now()}`,
      title: title || 'Nouveau Plan',
      description: description || 'Plan cinématographique haute définition',
      visualPrompt: description || 'Cinematic shot, 8k resolution, professional movie camera.',
      imageUrl: selectedImage,
      duration,
      camera: { motion, speed: 1.0, intensity: 0.8 },
      filter: defaultFilter,
      filterIntensity: 85,
      colorGrading: { brightness: 0, contrast: 15, saturation: 15, temperature: 0, vignette: 40, grain: 30 },
      transitionIn: 'cross_dissolve',
      transitionDuration: 0.6,
      voiceover,
      captions: voiceover ? [{ id: `c_${Date.now()}`, text: voiceover, start: 0.5, end: duration - 0.5 }] : [],
      generatedByAgent: selectedAgent,
    };
    onAddShot(clip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-[#10131d] border border-[#23293d] rounded-2xl p-6 shadow-2xl shadow-black/90 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f2538] pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Ajouter un Plan Cinématographique</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-300">Titre du Plan</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex : Révélation du Sanctuaire"
                className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Durée (sec)</label>
              <input
                type="number"
                min={1}
                max={15}
                step={0.5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-violet-500"
                required
              />
            </div>
          </div>

          {/* Description / Prompt */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Description Visuelle de la Scène</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex : Vue panoramique sur l'horizon, rayons de lumière filtrant à travers la brume..."
              rows={2}
              className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {/* Camera Motion */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Mouvement de Caméra</label>
            <select
              value={motion}
              onChange={e => setMotion(e.target.value as CameraMotion)}
              className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="dolly_in">Dolly Avant (Zoom avant cinématique)</option>
              <option value="dolly_out">Dolly Arrière (Révélation large)</option>
              <option value="pan_left">Panoramique Gauche</option>
              <option value="pan_right">Panoramique Droite</option>
              <option value="tilt_up">Travelling Haut</option>
              <option value="tilt_down">Travelling Bas</option>
              <option value="orbit">Orbite Circulaire 2.5D</option>
              <option value="zoom_in">Zoom Punch Rapide</option>
              <option value="handheld">Caméra Épaule Organique</option>
            </select>
          </div>

          {/* AI Video Agent Selection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>Moteur Vidéo IA de Génération</span>
            </label>
            <select
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value as AiVideoAgentId)}
              className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              {AI_VIDEO_AGENTS.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.provider}) — {agent.badge}
                </option>
              ))}
            </select>
          </div>

          {/* Voiceover */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Voix-Off / Sous-titre (Optionnel)</label>
            <input
              type="text"
              value={voiceover}
              onChange={e => setVoiceover(e.target.value)}
              placeholder="Texte de narration pour ce plan..."
              className="w-full bg-[#0a0c13] border border-[#202638] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500"
            />
          </div>

          {/* Visual Stock Thumbnail Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Visuel Clé</label>
            <div className="grid grid-cols-4 gap-2">
              {stockThumbnails.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(item.url)}
                  className={`h-14 rounded-lg overflow-hidden border relative cursor-pointer group ${
                    selectedImage === item.url
                      ? 'border-violet-400 ring-2 ring-violet-500/40'
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center py-0.5 truncate">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2538]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg hover:bg-white/5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insérer dans la Timeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
