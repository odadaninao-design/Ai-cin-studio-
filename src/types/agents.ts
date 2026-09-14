import { AspectRatio } from './video';

export type AiVideoAgentId =
  | 'google_veo_2'
  | 'openai_sora'
  | 'runway_gen3'
  | 'kling_1_5'
  | 'meta_movie_gen'
  | 'tencent_hunyuan'
  | 'luma_dream_machine'
  | 'minimax_hailuo'
  | 'genmo_mochi_1'
  | 'zhipu_cogvideox'
  | 'lightricks_ltx'
  | 'shengshu_vidu_2'
  | 'bytedance_jimeng'
  | 'pika_2'
  | 'wan_2_1'
  | 'stable_video'
  | 'cineai_neural';

export type AgentCategory = 'all' | 'cinema' | 'motion' | 'realism' | 'vfx' | 'open_source' | 'multimodal';

export interface AiAgentMetrics {
  motionQuality: number; // 1-100
  photorealism: number; // 1-100
  renderSpeed: number; // 1-100
  cameraControl: number; // 1-100
  temporalCoherence: number; // 1-100
}

export interface AiAgentConfig {
  motionScale: number; // 1 to 10
  promptAdherence: number; // 1 to 10 (CFG Scale)
  fps: 24 | 30 | 60;
  cameraMovement: 'auto' | 'dolly' | 'pan' | 'orbit' | 'fpv_drone' | 'handheld';
  generationMode: 'text_to_video' | 'image_to_video' | 'director_sequence';
  upscaling: boolean;
  enhancePrompt: boolean;
  negativePrompt: string;
}

export interface AiVideoAgent {
  id: AiVideoAgentId;
  name: string;
  version: string;
  provider: string;
  category: AgentCategory;
  badge: string;
  tagline: string;
  description: string;
  capabilities: string[];
  maxDurationSeconds: number;
  maxResolution: '1080p' | '4k';
  supportedAspectRatios: AspectRatio[];
  metrics: AiAgentMetrics;
  status: 'online' | 'ready' | 'high_demand';
  themeColor: {
    accent: string;
    border: string;
    bgGlow: string;
    badgeBg: string;
    badgeText: string;
  };
  samplePrompts: string[];
  defaultConfig: AiAgentConfig;
}
