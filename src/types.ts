export type GenerationMode =
  | 'viral-shorts'
  | 'image-to-video'
  | 'video-to-video'
  | 'text-to-video'
  | 'extend-video';

export type AspectRatio = '16:9' | '9:16';
export type VideoDuration =
  | '5s'
  | '10s'
  | '15s'
  | '20s'
  | '30s'
  | '1m'
  | '2m'
  | '3m'
  | '4m'
  | '5m';

export type VideoResolution = '360p' | '720p' | '1080p' | '4k';

export interface MediaReference {
  id: string;
  type: 'image' | 'video';
  name: string;
  previewUrl: string;
  data: string;
  mimeType: string;
  role: 'character' | 'scene' | 'motion' | 'style';
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  voiceType: string;
  avatarUrl: string;
  lockedAppearance: string;
  eyeColor: string;
  skinTexture: string;
  outfit: string;
  isLocked: boolean;
}

export interface ShortsDialogueLine {
  id: string;
  speaker: 'Aalu' | 'Aam' | string;
  dialogueUrdu: string;
  dialogueRomanUrdu: string;
  dialogueEnglish: string;
  emotion: 'emotional' | 'happy' | 'grateful' | 'crying' | 'surprised' | 'friendly';
  startTime: number; // seconds
  duration: number;  // seconds
  audioBase64?: string;
}

export interface ShortsScript {
  id: string;
  title: string;
  storyPrompt: string;
  characters: CharacterProfile[];
  durationSeconds: number; // 10, 15, 20
  dialogues: ShortsDialogueLine[];
  backgroundSetting: string;
  bgMusicStyle: string;
}

export interface GeneratedVideo {
  id: string;
  mode: GenerationMode;
  prompt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  sourceImageUrl?: string;
  sourceVideoUrl?: string;
  aspectRatio: AspectRatio;
  duration: VideoDuration;
  resolution: VideoResolution;
  createdAt: number;
  interactionId?: string;
  script?: ShortsScript;
  mediaReferences?: MediaReference[];
}

export interface SampleMedia {
  id: string;
  title: string;
  category: 'image-to-video' | 'video-to-video' | 'text-to-video' | 'viral-shorts';
  thumbnailUrl: string;
  mediaUrl: string;
  prompt: string;
  aspectRatio: AspectRatio;
  duration: VideoDuration;
  description: string;
}
