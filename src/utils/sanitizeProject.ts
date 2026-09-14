import {
  ProjectState,
  VideoClip,
  ArtisticFilter,
  CameraMotion,
  SoundMood,
  TransitionType,
} from '../types/video';
import { DEFAULT_PROJECT } from '../data/defaultProject';

const VALID_FILTERS: Set<string> = new Set([
  'neo_noir',
  'blade_runner',
  'wes_anderson',
  'kodak_35mm',
  'nolan_imax',
  'golden_hour',
  'bw_noir',
  'matrix_phosphor',
  'vintage_vhs',
  'clean_cinema',
]);

const VALID_CAMERA_MOTIONS: Set<string> = new Set([
  'dolly_in',
  'dolly_out',
  'pan_left',
  'pan_right',
  'tilt_up',
  'tilt_down',
  'orbit',
  'zoom_in',
  'handheld',
  'static',
]);

const VALID_SOUND_MOODS: Set<string> = new Set([
  'cyberpunk_synth',
  'epic_orchestral',
  'lofi_ambient',
  'dark_suspense',
  'uplifting_cinema',
  'action_hybrid',
]);

export function sanitizeProject(raw: any): ProjectState {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PROJECT;
  }

  // Resolve global filter (handle colorGrade from legacy server response or fallback)
  let globalFilter: ArtisticFilter = 'neo_noir';
  const filterCandidate = raw.globalFilter || raw.colorGrade;
  if (typeof filterCandidate === 'string' && VALID_FILTERS.has(filterCandidate)) {
    globalFilter = filterCandidate as ArtisticFilter;
  }

  // Resolve soundtrack mood
  let mood: SoundMood = 'cyberpunk_synth';
  const moodCandidate = raw.soundtrack?.mood;
  if (typeof moodCandidate === 'string' && VALID_SOUND_MOODS.has(moodCandidate)) {
    mood = moodCandidate as SoundMood;
  }

  const bpm = typeof raw.soundtrack?.bpm === 'number' ? raw.soundtrack.bpm : 110;

  // Resolve clips
  const rawClips = Array.isArray(raw.clips) && raw.clips.length > 0 ? raw.clips : DEFAULT_PROJECT.clips;

  const clips: VideoClip[] = rawClips.map((c: any, i: number) => {
    const clipFilterCandidate = c?.filter || globalFilter;
    const clipFilter: ArtisticFilter =
      typeof clipFilterCandidate === 'string' && VALID_FILTERS.has(clipFilterCandidate)
        ? (clipFilterCandidate as ArtisticFilter)
        : globalFilter;

    const motionCandidate = c?.camera?.motion;
    const motion: CameraMotion =
      typeof motionCandidate === 'string' && VALID_CAMERA_MOTIONS.has(motionCandidate)
        ? (motionCandidate as CameraMotion)
        : 'dolly_in';

    const duration =
      typeof c?.duration === 'number' && !isNaN(c.duration) && c.duration > 0
        ? Number(c.duration.toFixed(1))
        : 4.5;

    const defaultClip = DEFAULT_PROJECT.clips[i % DEFAULT_PROJECT.clips.length];

    const voiceover = typeof c?.voiceover === 'string' ? c.voiceover : '';
    const captions = Array.isArray(c?.captions) && c.captions.length > 0
      ? c.captions
      : voiceover
      ? [{ id: `c_${i}_1`, text: voiceover, start: 0.5, end: Math.max(1, duration - 0.5) }]
      : [];

    return {
      id: typeof c?.id === 'string' && c.id ? c.id : `clip_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      title: typeof c?.title === 'string' && c.title ? c.title : `Plan ${i + 1}`,
      description: typeof c?.description === 'string' ? c.description : '',
      visualPrompt: typeof c?.visualPrompt === 'string' ? c.visualPrompt : '',
      imageUrl: typeof c?.imageUrl === 'string' && c.imageUrl ? c.imageUrl : defaultClip.imageUrl,
      duration,
      camera: {
        motion,
        speed: typeof c?.camera?.speed === 'number' ? c.camera.speed : 1.0,
        intensity: typeof c?.camera?.intensity === 'number' ? c.camera.intensity : 0.8,
      },
      filter: clipFilter,
      filterIntensity: typeof c?.filterIntensity === 'number' ? c.filterIntensity : 85,
      colorGrading: c?.colorGrading || {
        brightness: 0,
        contrast: 15,
        saturation: 15,
        temperature: 0,
        vignette: 40,
        grain: 30,
      },
      transitionIn: (c?.transitionIn as TransitionType) || (i === 0 ? 'none' : 'cross_dissolve'),
      transitionDuration: typeof c?.transitionDuration === 'number' ? c.transitionDuration : 0.6,
      voiceover,
      captions,
      sfxCue: c?.sfxCue && typeof c.sfxCue.type === 'string' ? c.sfxCue : undefined,
      generatedByAgent: c?.generatedByAgent || raw.activeAgentId || 'google_veo_2',
    };
  });

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : `proj_${Date.now()}`,
    title: typeof raw.title === 'string' && raw.title ? raw.title : 'NOUVELLE CRÉATION CINEAI',
    tagline: typeof raw.tagline === 'string' ? raw.tagline : '',
    directorNote: typeof raw.directorNote === 'string' ? raw.directorNote : '',
    aspectRatio: raw.aspectRatio || '16:9',
    globalFilter,
    activeAgentId: raw.activeAgentId || 'google_veo_2',
    vfxOverlays: {
      letterbox: raw.vfxOverlays?.letterbox ?? true,
      filmGrain: raw.vfxOverlays?.filmGrain ?? true,
      anamorphicFlares: raw.vfxOverlays?.anamorphicFlares ?? true,
      chromaticAberration: raw.vfxOverlays?.chromaticAberration ?? false,
      vhsScanlines: raw.vfxOverlays?.vhsScanlines ?? false,
    },
    clips,
    soundtrack: {
      mood,
      bpm,
      masterVolume: typeof raw.soundtrack?.masterVolume === 'number' ? raw.soundtrack.masterVolume : 0.85,
      autoDucking: raw.soundtrack?.autoDucking ?? true,
      stems: {
        melody: raw.soundtrack?.stems?.melody || { volume: 0.8, muted: false, label: 'Synth Pluck Arp' },
        bass: raw.soundtrack?.stems?.bass || { volume: 0.9, muted: false, label: 'Sub 808 Bass' },
        drums: raw.soundtrack?.stems?.drums || { volume: 0.75, muted: false, label: 'Cyber Drum Pulse' },
        atmos: raw.soundtrack?.stems?.atmos || { volume: 0.7, muted: false, label: 'Ambient Pad Drone' },
        sfx: raw.soundtrack?.stems?.sfx || { volume: 0.85, muted: false, label: 'Cinematic Risers & Booms' },
      },
    },
    resolution: raw.resolution || '1080p',
    fps: typeof raw.fps === 'number' ? raw.fps : 30,
  };
}
