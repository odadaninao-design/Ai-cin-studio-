import React, { useRef, useState, useCallback } from 'react';
import { ProjectState, VideoClip } from '../../types/video';
import {
  Scissors,
  Trash2,
  Copy,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Magnet,
  Film,
  Sparkles,
  Type,
  Music,
  Volume2,
} from 'lucide-react';

interface TimelineProps {
  project: ProjectState;
  currentTime: number;
  selectedClipId: string | null;
  onTimeUpdate: (time: number) => void;
  onSelectClip: (clipId: string | null) => void;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onOpenNewShotModal: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  selectedClipId,
  onTimeUpdate,
  onSelectClip,
  onUpdateProject,
  onOpenNewShotModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tracksScrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(45); // pixels per second
  const [snapping, setSnapping] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const totalDuration = project.clips.reduce((acc, c) => acc + c.duration, 0) || 1;
  const timelineWidth = Math.max(totalDuration * zoom + 120, 800);

  // Compute time from clientX coordinate
  const getTimeFromMouseEvent = useCallback(
    (e: React.MouseEvent) => {
      if (!tracksScrollRef.current) return 0;
      const rect = tracksScrollRef.current.getBoundingClientRect();
      const scrollLeft = tracksScrollRef.current.scrollLeft;
      const offsetX = e.clientX - rect.left + scrollLeft;
      const rawTime = Math.max(0, Math.min(totalDuration, offsetX / zoom));

      if (!snapping) return rawTime;

      // Snap to nearby cut points within 8 pixels
      const snapThresholdTime = 8 / zoom;
      let accumulated = 0;
      const cutPoints = [0];
      project.clips.forEach(c => {
        accumulated += c.duration;
        cutPoints.push(accumulated);
      });

      for (const cp of cutPoints) {
        if (Math.abs(rawTime - cp) <= snapThresholdTime) {
          return cp;
        }
      }
      return rawTime;
    },
    [zoom, snapping, totalDuration, project.clips]
  );

  // Scrubber mouse down
  const handleRulerMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    const newTime = getTimeFromMouseEvent(e);
    onTimeUpdate(newTime);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!tracksScrollRef.current) return;
      const rect = tracksScrollRef.current.getBoundingClientRect();
      const scrollLeft = tracksScrollRef.current.scrollLeft;
      const offsetX = moveEvent.clientX - rect.left + scrollLeft;
      const time = Math.max(0, Math.min(totalDuration, offsetX / zoom));
      onTimeUpdate(time);
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Razor / Split Tool: Split selected clip at playhead
  const handleSplitClip = () => {
    let accumulated = 0;
    let targetIndex = -1;
    let splitOffset = 0;

    for (let i = 0; i < project.clips.length; i++) {
      const clip = project.clips[i];
      if (currentTime > accumulated && currentTime < accumulated + clip.duration) {
        targetIndex = i;
        splitOffset = currentTime - accumulated;
        break;
      }
      accumulated += clip.duration;
    }

    if (targetIndex === -1) return;

    const original = project.clips[targetIndex];
    if (splitOffset < 0.5 || original.duration - splitOffset < 0.5) return; // Prevent micro-cuts

    const firstHalf: VideoClip = {
      ...original,
      id: `clip_${Date.now()}_1`,
      title: `${original.title} (Partie 1)`,
      duration: Number(splitOffset.toFixed(2)),
    };

    const secondHalf: VideoClip = {
      ...original,
      id: `clip_${Date.now()}_2`,
      title: `${original.title} (Partie 2)`,
      duration: Number((original.duration - splitOffset).toFixed(2)),
      transitionIn: 'cross_dissolve',
    };

    onUpdateProject(prev => {
      const newClips = [...prev.clips];
      newClips.splice(targetIndex, 1, firstHalf, secondHalf);
      return { ...prev, clips: newClips };
    });

    onSelectClip(secondHalf.id);
  };

  // Delete selected clip
  const handleDeleteSelectedClip = () => {
    if (!selectedClipId || project.clips.length <= 1) return;
    onUpdateProject(prev => ({
      ...prev,
      clips: prev.clips.filter(c => c.id !== selectedClipId),
    }));
    onSelectClip(null);
  };

  // Duplicate selected clip
  const handleDuplicateSelectedClip = () => {
    if (!selectedClipId) return;
    const clipIndex = project.clips.findIndex(c => c.id === selectedClipId);
    if (clipIndex === -1) return;

    const original = project.clips[clipIndex];
    const copy: VideoClip = {
      ...original,
      id: `clip_${Date.now()}`,
      title: `${original.title} (Copie)`,
    };

    onUpdateProject(prev => {
      const newClips = [...prev.clips];
      newClips.splice(clipIndex + 1, 0, copy);
      return { ...prev, clips: newClips };
    });
    onSelectClip(copy.id);
  };

  // Fit timeline zoom to container width
  const handleFitToScreen = () => {
    if (!tracksScrollRef.current) return;
    const availableWidth = tracksScrollRef.current.clientWidth - 100;
    const calculatedZoom = Math.max(15, Math.min(120, availableWidth / totalDuration));
    setZoom(calculatedZoom);
  };

  // Render Ruler tick marks
  const renderRulerTicks = () => {
    const ticks = [];
    const stepSeconds = zoom > 60 ? 1 : zoom > 30 ? 2 : 5;
    const totalSteps = Math.ceil(totalDuration) + 2;

    for (let s = 0; s <= totalSteps; s += stepSeconds) {
      const x = s * zoom;
      const m = Math.floor(s / 60);
      const sec = s % 60;
      const timeStr = `${m}:${sec.toString().padStart(2, '0')}`;

      ticks.push(
        <div key={s} className="absolute top-0 flex flex-col items-center" style={{ left: `${x}px` }}>
          <div className="h-2 w-px bg-slate-600" />
          <span className="text-[9px] font-mono text-slate-400 mt-0.5 select-none">{timeStr}</span>
        </div>
      );
    }
    return ticks;
  };

  return (
    <div
      ref={containerRef}
      className="h-64 border-t border-[#1e2330] bg-[#0c0e14] flex flex-col shrink-0 select-none z-20"
    >
      {/* Timeline Toolbar */}
      <div className="h-9 border-b border-[#1b202c] px-3 flex items-center justify-between bg-[#10131d]">
        {/* Left Editing Tools */}
        <div className="flex items-center gap-1">
          {/* Split / Razor tool */}
          <button
            onClick={handleSplitClip}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Scinder le plan à la tête de lecture (C)"
          >
            <Scissors className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Scinder</span>
          </button>

          {/* Delete clip */}
          <button
            onClick={handleDeleteSelectedClip}
            disabled={!selectedClipId || project.clips.length <= 1}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              selectedClipId && project.clips.length > 1
                ? 'hover:bg-rose-500/20 text-rose-300 hover:text-rose-200'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Supprimer le plan sélectionné"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supprimer</span>
          </button>

          {/* Duplicate clip */}
          <button
            onClick={handleDuplicateSelectedClip}
            disabled={!selectedClipId}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              selectedClipId
                ? 'hover:bg-white/10 text-slate-300 hover:text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Dupliquer le plan sélectionné"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dupliquer</span>
          </button>

          {/* Add Shot */}
          <button
            onClick={onOpenNewShotModal}
            className="flex items-center gap-1 px-2 py-1 rounded bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-medium border border-violet-500/30 transition-colors ml-1 cursor-pointer"
            title="Ajouter un nouveau plan cinématographique"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Plan</span>
          </button>
        </div>

        {/* Right Zoom & Magnet Controls */}
        <div className="flex items-center gap-2">
          {/* Snapping Magnet */}
          <button
            onClick={() => setSnapping(!snapping)}
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              snapping ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={snapping ? 'Aimantation active' : 'Aimantation désactivée'}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-800" />

          {/* Zoom Out */}
          <button
            onClick={() => setZoom(prev => Math.max(prev - 8, 15))}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom arrière"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => setZoom(prev => Math.min(prev + 10, 120))}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom avant"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Fit to screen */}
          <button
            onClick={handleFitToScreen}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Ajuster à l'écran"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Fixed left sidebar) */}
        <div className="w-36 border-r border-[#1b202c] bg-[#0e1118] shrink-0 flex flex-col select-none text-[11px] font-medium text-slate-400">
          <div className="h-6 border-b border-[#1b202c] flex items-center px-3 font-mono text-[10px] text-slate-500">
            TIMELINE
          </div>
          <div className="h-16 border-b border-[#1b202c] flex items-center gap-2 px-3 hover:bg-white/5 transition-colors">
            <Film className="w-3.5 h-3.5 text-violet-400" />
            <span className="truncate">V1 : Vidéo & Plans</span>
          </div>
          <div className="h-8 border-b border-[#1b202c] flex items-center gap-2 px-3 hover:bg-white/5 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">FX : Filtres & LUTs</span>
          </div>
          <div className="h-8 border-b border-[#1b202c] flex items-center gap-2 px-3 hover:bg-white/5 transition-colors">
            <Type className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">TXT : Sous-titres</span>
          </div>
          <div className="h-9 flex items-center gap-2 px-3 hover:bg-white/5 transition-colors">
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">A1 : Musique Adapt.</span>
          </div>
        </div>

        {/* Scrollable Tracks Area */}
        <div
          ref={tracksScrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#090a0f] scrollbar-thin scrollbar-thumb-slate-800"
          onMouseDown={handleRulerMouseDown}
        >
          <div style={{ width: `${timelineWidth}px` }} className="h-full relative flex flex-col">
            {/* Top Ruler Bar */}
            <div className="h-6 border-b border-[#1b202c] bg-[#0d1017] relative cursor-ew-resize">
              {renderRulerTicks()}
            </div>

            {/* Track 1: Video / Visual Clips */}
            <div className="h-16 border-b border-[#181d28] bg-[#0c0e15] relative flex items-center px-1">
              {(() => {
                let accumulated = 0;
                return project.clips.map((clip, idx) => {
                  const clipLeft = accumulated * zoom;
                  const clipW = clip.duration * zoom;
                  accumulated += clip.duration;
                  const isSelected = selectedClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      onClick={e => {
                        e.stopPropagation();
                        onSelectClip(clip.id);
                        onTimeUpdate(clipLeft / zoom);
                      }}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${clipW}px`,
                      }}
                      className={`absolute h-14 rounded-lg overflow-hidden flex items-center border transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-violet-400 ring-2 ring-violet-500/40 z-10'
                          : 'border-[#262c3e] hover:border-slate-500 bg-[#161a26]'
                      }`}
                    >
                      {/* Background Thumbnail Image */}
                      {clip.imageUrl ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"
                          style={{ backgroundImage: `url(${clip.imageUrl})` }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/40 to-slate-900/60" />
                      )}

                      {/* Content Overlay */}
                      <div className="relative z-10 px-2 flex flex-col justify-between h-full py-1 text-[11px] pointer-events-none w-full">
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-semibold text-white drop-shadow truncate">
                            {idx + 1}. {clip.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-200 bg-black/60 px-1 py-0.5 rounded shrink-0">
                            {clip.duration.toFixed(1)}s
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-300 overflow-hidden">
                          {clip.generatedByAgent && (
                            <span className="bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 px-1 py-0.2 rounded uppercase font-mono text-[8px] shrink-0">
                              {clip.generatedByAgent.replace(/_/g, ' ').split(' ')[0]}
                            </span>
                          )}
                          <span className="bg-violet-900/80 px-1 py-0.2 rounded uppercase font-mono truncate">
                            {(clip.camera?.motion || 'dolly_in').replace(/_/g, ' ')}
                          </span>
                          <span className="text-amber-300/90 font-mono truncate">
                            {(clip.filter || project.globalFilter || 'clean_cinema').replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Transition Badge at start if cross_dissolve */}
                      {clip.transitionIn !== 'none' && idx > 0 && (
                        <div className="absolute top-1 left-1 z-20 px-1 py-0.5 rounded bg-cyan-600/80 text-[8px] text-white font-mono uppercase shadow pointer-events-none">
                          {clip.transitionIn === 'flash_white' ? 'FLASH' : 'DISSOLVE'}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Track 2: FX / Filters Layer */}
            <div className="h-8 border-b border-[#181d28] bg-[#090b10] relative flex items-center">
              {(() => {
                let accumulated = 0;
                return project.clips.map(clip => {
                  const clipLeft = accumulated * zoom;
                  const clipW = clip.duration * zoom;
                  accumulated += clip.duration;
                  return (
                    <div
                      key={clip.id}
                      style={{ left: `${clipLeft}px`, width: `${clipW}px` }}
                      className="absolute h-6 rounded bg-amber-500/10 border border-amber-500/30 px-2 flex items-center justify-between text-[10px] text-amber-300/90 font-mono overflow-hidden"
                    >
                      <span className="truncate">{(clip.filter || project.globalFilter || 'clean_cinema').replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-amber-400/60 text-[9px]">{clip.filterIntensity ?? 80}%</span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Track 3: Subtitles / Captions Layer */}
            <div className="h-8 border-b border-[#181d28] bg-[#090b10] relative flex items-center">
              {(() => {
                let accumulated = 0;
                return project.clips.map(clip => {
                  const clipLeft = accumulated * zoom;
                  const clipW = clip.duration * zoom;
                  accumulated += clip.duration;
                  if (!clip.voiceover) return null;

                  return (
                    <div
                      key={clip.id}
                      style={{ left: `${clipLeft}px`, width: `${clipW}px` }}
                      className="absolute h-6 rounded bg-cyan-500/10 border border-cyan-500/30 px-2 flex items-center text-[10px] text-cyan-200 font-sans truncate"
                      title={clip.voiceover}
                    >
                      <span className="truncate">« {clip.voiceover} »</span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Track 4: Adaptive Music Track (Waveform & Beat ticks) */}
            <div className="h-9 bg-[#07090e] relative flex items-center overflow-hidden">
              <div
                className="absolute inset-y-1 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center px-3"
                style={{ width: `${totalDuration * zoom}px` }}
              >
                {/* Procedural Waveform Graphic */}
                <div className="w-full flex items-center gap-1 opacity-70">
                  {Array.from({ length: Math.floor((totalDuration * zoom) / 6) }).map((_, i) => {
                    const beat = i % 4 === 0;
                    const h = beat ? 20 : 6 + (Math.sin(i * 0.4) * 0.5 + 0.5) * 12;
                    return (
                      <div
                        key={i}
                        className={`w-0.5 rounded-full ${beat ? 'bg-emerald-400' : 'bg-emerald-600/60'}`}
                        style={{ height: `${h}px` }}
                      />
                    );
                  })}
                </div>
                <div className="absolute right-3 top-1 flex items-center gap-1 text-[9px] font-mono text-emerald-300">
                  <Volume2 className="w-3 h-3" />
                  <span>{(project.soundtrack?.mood || 'cyberpunk_synth').replace(/_/g, ' ').toUpperCase()} • {project.soundtrack?.bpm || 110} BPM</span>
                </div>
              </div>
            </div>

            {/* Red Playhead Indicator */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center transition-all duration-75"
              style={{ left: `${currentTime * zoom}px` }}
            >
              {/* Playhead Head */}
              <div className="w-3.5 h-3.5 bg-red-500 rotate-45 -mt-1 shadow-md shadow-red-500/50" />
              {/* Vertical Laser Line */}
              <div className="w-0.5 flex-1 bg-gradient-to-b from-red-500 via-red-500 to-rose-400 shadow-sm shadow-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
