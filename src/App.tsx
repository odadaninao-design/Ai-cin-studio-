import React, { useState, useCallback, useEffect } from 'react';
import { ProjectState, VideoClip, ArtisticFilter, SoundMood } from './types/video';
import { DEFAULT_PROJECT } from './data/defaultProject';
import { sanitizeProject } from './utils/sanitizeProject';
import { Header } from './components/Header';
import { PreviewMonitor } from './components/PreviewMonitor';
import { Timeline } from './components/Timeline/Timeline';
import { SidebarDirector } from './components/Sidebar/SidebarDirector';
import { SidebarAgents } from './components/Sidebar/SidebarAgents';
import { SidebarStoryboard } from './components/Sidebar/SidebarStoryboard';
import { SidebarFilters } from './components/Sidebar/SidebarFilters';
import { SidebarAudio } from './components/Sidebar/SidebarAudio';
import { SidebarTypography } from './components/Sidebar/SidebarTypography';
import { ExportModal } from './components/ExportModal';
import { NewShotModal } from './components/NewShotModal';
import { AIGeneratingModal } from './components/AIGeneratingModal';
import { InstallModal } from './components/InstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sparkles, Film, Palette, Music, Type, Cpu } from 'lucide-react';
import { AiVideoAgentId } from './types/agents';
import { AI_VIDEO_AGENTS, getAgentById } from './data/aiVideoAgents';

type SidebarTab = 'director' | 'agents' | 'storyboard' | 'filters' | 'audio' | 'typography';

export default function App() {
  const [project, setProject] = useState<ProjectState>(DEFAULT_PROJECT);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(DEFAULT_PROJECT.clips[0]?.id || null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('director');

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewShotModalOpen, setIsNewShotModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState('');

  // Handle Play/Pause toggle
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Handle Playhead scrub
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // AI Director Generation API Caller
  const handleGenerateAI = async (
    prompt: string,
    style: string,
    targetDuration: number,
    filter: ArtisticFilter,
    agentId?: AiVideoAgentId
  ) => {
    setIsAiGenerating(true);
    setGeneratingPrompt(prompt);
    setIsPlaying(false);

    const effectiveAgentId = agentId || project.activeAgentId || 'google_veo_2';

    try {
      const response = await fetch('/api/ai/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          targetDuration,
          aspectRatio: project.aspectRatio,
          agentId: effectiveAgentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur réseau lors de la génération IA');
      }

      const data = await response.json();
      if (data.project) {
        const sanitized = sanitizeProject({
          ...data.project,
          activeAgentId: effectiveAgentId,
        });
        setProject(sanitized);
        setSelectedClipId(sanitized.clips[0]?.id || null);
        setCurrentTime(0);
        // Switch to storyboard tab so user can review the shots
        setActiveTab('storyboard');
      }
    } catch (err: any) {
      console.log('[AI Director] Mode procédural activé avec l\'agent:', effectiveAgentId);
      // Fallback: Create dynamic shots locally if API is busy
      const shotCount = Math.max(3, Math.ceil(targetDuration / 4.5));
      const newClips: VideoClip[] = Array.from({ length: shotCount }).map((_, i) => ({
        id: `clip_gen_${Date.now()}_${i}`,
        title: `Plan ${i + 1} : Séquence ${style.toUpperCase()}`,
        description: `${prompt} - Étape cinématique ${i + 1}`,
        visualPrompt: `${prompt}, cinematic lighting, shot ${i + 1}, master movie quality.`,
        imageUrl: DEFAULT_PROJECT.clips[i % DEFAULT_PROJECT.clips.length].imageUrl,
        duration: Number((targetDuration / shotCount).toFixed(1)),
        camera: {
          motion: (['dolly_in', 'pan_right', 'tilt_down', 'orbit', 'zoom_in'] as const)[i % 5],
          speed: 1.0,
          intensity: 0.85,
        },
        filter,
        filterIntensity: 85,
        colorGrading: { brightness: 0, contrast: 15, saturation: 15, temperature: 0, vignette: 40, grain: 30 },
        transitionIn: i === 0 ? 'none' : 'cross_dissolve',
        transitionDuration: 0.6,
        voiceover: `Plan ${i + 1} : ${prompt.slice(0, 45)}...`,
        captions: [{ id: `c_${i}`, text: `Plan ${i + 1} : ${prompt.slice(0, 45)}...`, start: 0.5, end: 3.5 }],
        generatedByAgent: effectiveAgentId,
      }));

      setProject(prev => ({
        ...prev,
        title: prompt.slice(0, 30).toUpperCase() || 'NOUVELLE CRÉATION IA',
        tagline: prompt,
        globalFilter: filter,
        activeAgentId: effectiveAgentId,
        clips: newClips,
      }));
      setSelectedClipId(newClips[0]?.id || null);
      setCurrentTime(0);
      setActiveTab('storyboard');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Add a new shot to the sequence
  const handleAddShot = (newClip: VideoClip) => {
    setProject(prev => ({
      ...prev,
      clips: [...prev.clips, newClip],
    }));
    setSelectedClipId(newClip.id);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090d] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Application Header */}
      <Header
        project={project}
        onUpdateProject={setProject}
        onOpenAiModal={() => setActiveTab('director')}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Central Workspace: Monitor + Timeline */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Cinema Preview Monitor */}
          <PreviewMonitor
            project={project}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={handleTimeUpdate}
            onPlayPause={handlePlayPause}
          />

          {/* Multi-Track Timeline Editor */}
          <Timeline
            project={project}
            currentTime={currentTime}
            selectedClipId={selectedClipId}
            onTimeUpdate={handleTimeUpdate}
            onSelectClip={setSelectedClipId}
            onUpdateProject={setProject}
            onOpenNewShotModal={() => setIsNewShotModalOpen(true)}
          />
        </div>

        {/* Right Tabbed Inspector & AI Director Sidebar */}
        <div className="w-80 md:w-96 border-l border-[#1e2330] bg-[#0c0e15] flex flex-col shrink-0 z-20">
          {/* Sidebar Tabs Header */}
          <div className="h-11 border-b border-[#1c212f] bg-[#0f121a] flex items-center px-2 gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('director')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'director'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>IA Réalisateur</span>
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'agents'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Agents IA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                {AI_VIDEO_AGENTS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('storyboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'storyboard'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plans ({project.clips.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('filters')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'filters'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Filtres</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'audio'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audio</span>
            </button>

            <button
              onClick={() => setActiveTab('typography')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'typography'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-rose-400" />
              <span>Voix-off</span>
            </button>
          </div>

          {/* Active Sidebar Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'director' && (
              <SidebarDirector
                project={project}
                onUpdateProject={setProject}
                onGenerateAI={handleGenerateAI}
                onNavigateToAgents={() => setActiveTab('agents')}
                isGenerating={isAiGenerating}
              />
            )}
            {activeTab === 'agents' && (
              <SidebarAgents
                project={project}
                onUpdateProject={setProject}
                onGenerateAI={handleGenerateAI}
                isGenerating={isAiGenerating}
              />
            )}
            {activeTab === 'storyboard' && (
              <SidebarStoryboard
                project={project}
                selectedClipId={selectedClipId}
                onSelectClip={setSelectedClipId}
                onUpdateProject={setProject}
                onOpenNewShotModal={() => setIsNewShotModalOpen(true)}
              />
            )}
            {activeTab === 'filters' && (
              <SidebarFilters
                project={project}
                selectedClipId={selectedClipId}
                onUpdateProject={setProject}
              />
            )}
            {activeTab === 'audio' && (
              <SidebarAudio
                project={project}
                onUpdateProject={setProject}
              />
            )}
            {activeTab === 'typography' && (
              <SidebarTypography
                project={project}
                selectedClipId={selectedClipId}
                onUpdateProject={setProject}
              />
            )}
          </div>
        </div>
      </div>

      {/* Export Video Modal */}
      <ExportModal
        project={project}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* New Shot Modal */}
      <NewShotModal
        isOpen={isNewShotModalOpen}
        onClose={() => setIsNewShotModalOpen(false)}
        onAddShot={handleAddShot}
        defaultFilter={project.globalFilter}
        activeAgentId={project.activeAgentId}
      />

      {/* AI Generating Loading Screen */}
      <AIGeneratingModal
        isOpen={isAiGenerating}
        prompt={generatingPrompt}
        agentName={getAgentById(project.activeAgentId || 'google_veo_2').name}
      />

      {/* PWA Phone Install Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}
