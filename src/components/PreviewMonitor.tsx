import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ProjectState } from '../types/video';
import { cinematicRenderer } from '../engine/cinematicRenderer';
import { adaptiveAudio } from '../audio/adaptiveAudioEngine';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Maximize,
  Grid,
  Camera,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface PreviewMonitorProps {
  project: ProjectState;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayPause: () => void;
}

export const PreviewMonitor: React.FC<PreviewMonitorProps> = ({
  project,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayPause,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [visualizerLevels, setVisualizerLevels] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  const totalDuration = project.clips.reduce((acc, c) => acc + c.duration, 0) || 1;

  // Format time to SMPTE timecode (HH:MM:SS:FF)
  const formatTimecode = (seconds: number) => {
    const s = Math.max(seconds, 0);
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const frames = Math.floor((s % 1) * 30);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  // Preload clip images whenever clips change
  useEffect(() => {
    cinematicRenderer.preloadClipImages(project.clips);
  }, [project.clips]);

  // Handle Playback Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        let nextTime = currentTime + delta;
        if (nextTime >= totalDuration) {
          nextTime = 0; // Loop playback
          adaptiveAudio.seek(0);
        }
        onTimeUpdate(nextTime);
      }

      // Update audio visualizer levels
      if (isPlaying) {
        setVisualizerLevels(adaptiveAudio.getVisualizerLevels());
      }

      // Render current frame on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          cinematicRenderer.renderFrame(ctx, canvas.width, canvas.height, project, currentTime);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, currentTime, totalDuration, project, onTimeUpdate]);

  // Sync Audio Engine state
  useEffect(() => {
    adaptiveAudio.updateSoundtrackConfig(project.soundtrack);
    if (isPlaying) {
      adaptiveAudio.play();
    } else {
      adaptiveAudio.pause();
    }
  }, [isPlaying, project.soundtrack]);

  // Adjust canvas resolution dynamically based on aspect ratio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (project.aspectRatio === '9:16') {
      canvas.width = 1080;
      canvas.height = 1920;
    } else if (project.aspectRatio === '1:1') {
      canvas.width = 1080;
      canvas.height = 1080;
    } else if (project.aspectRatio === '21:9') {
      canvas.width = 2560;
      canvas.height = 1080;
    } else {
      canvas.width = 1920;
      canvas.height = 1080;
    }
  }, [project.aspectRatio]);

  // Step 1 frame backward / forward (1/30th sec)
  const stepFrame = useCallback((direction: -1 | 1) => {
    const frameDuration = 1 / 30;
    const nextTime = Math.max(0, Math.min(totalDuration, currentTime + direction * frameDuration));
    onTimeUpdate(nextTime);
    adaptiveAudio.seek(nextTime);
  }, [currentTime, totalDuration, onTimeUpdate]);

  // Jump to previous / next cut point
  const jumpToCut = useCallback((direction: -1 | 1) => {
    let accumulated = 0;
    const cutPoints = [0];
    project.clips.forEach(c => {
      accumulated += c.duration;
      cutPoints.push(accumulated);
    });

    if (direction === -1) {
      const prevCuts = cutPoints.filter(cp => cp < currentTime - 0.1);
      const target = prevCuts.length > 0 ? prevCuts[prevCuts.length - 1] : 0;
      onTimeUpdate(target);
      adaptiveAudio.seek(target);
    } else {
      const nextCuts = cutPoints.filter(cp => cp > currentTime + 0.1);
      const target = nextCuts.length > 0 ? nextCuts[0] : totalDuration;
      onTimeUpdate(target);
      adaptiveAudio.seek(target);
    }
  }, [currentTime, project.clips, totalDuration, onTimeUpdate]);

  // Snapshot PNG Frame
  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `CineAI_Frame_${formatTimecode(currentTime).replace(/:/g, '-')}.png`;
    a.click();
  };

  // Fullscreen monitor toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        onPlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, stepFrame]);

  // Compute CSS aspect ratio for monitor container
  const getAspectStyle = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[72vh]';
      case '1:1':
        return 'aspect-square max-h-[72vh]';
      case '21:9':
        return 'aspect-[21/9] w-full max-w-5xl';
      case '16:9':
      default:
        return 'aspect-video w-full max-w-5xl';
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center p-3 bg-[#08090d] relative overflow-hidden select-none"
    >
      {/* Central Screen Frame */}
      <div className={`relative ${getAspectStyle()} bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-[#1f2433] flex items-center justify-center`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />

        {/* Safe Zones / Rule of Thirds Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Rule of Thirds */}
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-cyan-400/20">
              <div className="border-r border-b border-cyan-400/20" />
              <div className="border-r border-b border-cyan-400/20" />
              <div className="border-b border-cyan-400/20" />
              <div className="border-r border-b border-cyan-400/20" />
              <div className="border-r border-b border-cyan-400/20" />
              <div className="border-b border-cyan-400/20" />
              <div className="border-r border-cyan-400/20" />
              <div className="border-r border-cyan-400/20" />
              <div />
            </div>
            {/* Center Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-t border-b border-l border-r border-cyan-400/40 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400/70 rounded-full" />
            </div>
            {/* Title Safe Area Box (90%) */}
            <div className="absolute inset-[5%] border border-dashed border-amber-400/30 pointer-events-none rounded" />
          </div>
        )}

        {/* Live Audio Visualizer (Bottom-Right overlay) */}
        <div className="absolute bottom-3 right-3 z-20 flex items-end gap-1 px-2 py-1.5 rounded-lg bg-black/60 backdrop-blur border border-white/10 pointer-events-none">
          {visualizerLevels.map((lvl, idx) => (
            <div
              key={idx}
              className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-cyan-400 transition-all duration-75"
              style={{ height: `${Math.max(lvl * 24, 3)}px` }}
            />
          ))}
          <span className="text-[10px] text-slate-400 font-mono ml-1">STEMS</span>
        </div>

        {/* Active Shot Badge (Top-Left overlay) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur border border-white/10 text-[11px] text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold text-white">REC</span>
          <span className="text-slate-500">|</span>
          <span>{(project?.globalFilter || 'clean_cinema').replace(/_/g, ' ').toUpperCase()}</span>
        </div>
      </div>

      {/* Floating Modern Transport Bar */}
      <div className="mt-3 flex items-center gap-3 px-4 py-2 rounded-xl bg-[#12151f]/90 backdrop-blur-md border border-[#222838] shadow-xl z-20">
        {/* Previous Cut */}
        <button
          onClick={() => jumpToCut(-1)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Plan précédent"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Step -1 frame */}
        <button
          onClick={() => stepFrame(-1)}
          className="px-1.5 py-1 rounded text-[11px] font-mono hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Reculer d'une image (Flèche gauche)"
        >
          -1F
        </button>

        {/* Play / Pause Primary Button */}
        <button
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 active:scale-95 transition-all cursor-pointer"
          title={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Step +1 frame */}
        <button
          onClick={() => stepFrame(1)}
          className="px-1.5 py-1 rounded text-[11px] font-mono hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Avancer d'une image (Flèche droite)"
        >
          +1F
        </button>

        {/* Next Cut */}
        <button
          onClick={() => jumpToCut(1)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Plan suivant"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Timecode Readout */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-black/50 border border-white/5 font-mono text-xs text-slate-200">
          <span className="text-violet-400 font-semibold">{formatTimecode(currentTime)}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{formatTimecode(totalDuration)}</span>
        </div>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Loop toggle */}
        <button
          onClick={() => {
            onTimeUpdate(0);
            adaptiveAudio.seek(0);
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Revenir au début"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Safe Area Grid toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            showGrid ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
          title="Grille de composition & Zones de sécurité"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Snapshot PNG */}
        <button
          onClick={takeSnapshot}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Prendre un instantané (PNG)"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Audio Mute toggle */}
        <button
          onClick={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            adaptiveAudio.updateSoundtrackConfig({
              ...project.soundtrack,
              masterVolume: nextMuted ? 0 : 0.85,
            });
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isMuted ? 'text-rose-400 bg-rose-500/10' : 'hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
          title={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Plein écran"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
