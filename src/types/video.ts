import type { AiVideoAgentId } from './agents';

export type AspectRatio = '16:9' | '9:16' | '21:9' | '1:1';

export type CameraMotion =
  | 'dolly_in'
  | 'dolly_out'
  | 'pan_left'
  | 'pan_right'
  | 'tilt_up'
  | 'tilt_down'
  | 'orbit'
  | 'zoom_in'
  | 'handheld'
  | 'static';

export type ArtisticFilter =
  | 'neo_noir'
  | 'blade_runner'
  | 'wes_anderson'
  | 'kodak_35mm'
  | 'nolan_imax'
  | 'golden_hour'
  | 'bw_noir'
  | 'matrix_phosphor'
  | 'vintage_vhs'
  | 'clean_cinema';

export type TransitionType =
  | 'none'
  | 'cross_dissolve'
  | 'wipe_left'
  | 'whip_pan'
  | 'glitch'
  | 'flash_white'
  | 'zoom_in';

export type SoundMood =
  | 'cyberpunk_synth'
  | 'epic_orchestral'
  | 'lofi_ambient'
  | 'dark_suspense'
  | 'uplifting_cinema'
  | 'action_hybrid';

export interface SfxCue {
  type: 'boom' | 'whoosh' | 'riser' | 'glitch' | 'hit';
  time: number; // in seconds relative to clip start
}

export interface CaptionLine {
  id: string;
  text: string;
  start: number; // relative to clip
  end: number;
}

export interface ClipCamera {
  motion: CameraMotion;
  speed: number; // 0.5 to 2.0
  intensity: number; // 0.2 to 1.5
}

export interface ColorGrading {
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  saturation: number; // -50 to 50
  temperature: number; // -50 to 50
  vignette: number; // 0 to 100
  grain: number; // 0 to 100
}

export interface VideoClip {
  id: string;
  title: string;
  description: string;
  visualPrompt: string;
  imageUrl: string;
  duration: number; // in seconds
  camera: ClipCamera;
  filter: ArtisticFilter;
  filterIntensity: number; // 0 to 100
  colorGrading: ColorGrading;
  transitionIn: TransitionType;
  transitionDuration: number; // 0.2 to 1.0s
  voiceover: string;
  captions: CaptionLine[];
  sfxCue?: SfxCue;
  generatedByAgent?: AiVideoAgentId;
}

export interface StemControl {
  volume: number; // 0.0 to 1.0
  muted: boolean;
  label: string;
}

export interface AdaptiveSoundtrack {
  mood: SoundMood;
  bpm: number;
  masterVolume: number;
  autoDucking: boolean;
  stems: {
    melody: StemControl;
    bass: StemControl;
    drums: StemControl;
    atmos: StemControl;
    sfx: StemControl;
  };
}

export interface VfxOverlays {
  letterbox: boolean;
  filmGrain: boolean;
  anamorphicFlares: boolean;
  chromaticAberration: boolean;
  vhsScanlines: boolean;
}

export interface ProjectState {
  id: string;
  title: string;
  tagline: string;
  directorNote: string;
  aspectRatio: AspectRatio;
  globalFilter: ArtisticFilter;
  vfxOverlays: VfxOverlays;
  clips: VideoClip[];
  soundtrack: AdaptiveSoundtrack;
  resolution: '1080p' | '720p' | '4k';
  fps: number;
  activeAgentId?: AiVideoAgentId;
}
