import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Play,
  Sliders,
  Camera,
  Film,
  Zap,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Lock,
  Plus,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { AspectRatio, VideoDuration, VideoResolution, MediaReference } from '../types';
import { PromptEnhancer } from './PromptEnhancer';
import { SAMPLE_IMAGES, SAMPLE_VIDEOS } from '../data/samples';

// Sample reference presets that users can test immediately
const PRESET_REFERENCES: Array<{
  name: string;
  type: 'image' | 'video';
  url: string;
  role: 'character' | 'scene';
  tag: string;
}> = [
  {
    name: 'Aalu (3D Potato Character)',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
    role: 'character',
    tag: 'Aalu 3D Pixar character anchor',
  },
  {
    name: 'Aam (3D Golden Mango)',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80',
    role: 'character',
    tag: 'Aam 3D Pixar character anchor',
  },
  {
    name: 'Cyberpunk Character Face',
    type: 'image',
    url: SAMPLE_IMAGES[0].imageUrl,
    role: 'character',
    tag: 'Cyberpunk character face and neon aesthetics',
  },
  {
    name: 'Alpine Waterfall Scene',
    type: 'image',
    url: SAMPLE_IMAGES[1].imageUrl,
    role: 'scene',
    tag: 'Alpine nature environment reference',
  },
  {
    name: 'Cinematic Ocean Motion',
    type: 'video',
    url: SAMPLE_VIDEOS[0].mediaUrl,
    role: 'scene',
    tag: 'Fluid wave motion reference video',
  },
];

interface TextToVideoProps {
  onGenerate: (payload: {
    mode: 'text-to-video';
    prompt: string;
    references?: MediaReference[];
    aspectRatio: AspectRatio;
    duration: VideoDuration;
    resolution: VideoResolution;
  }) => Promise<void>;
  isGenerating: boolean;
}

export const TextToVideo: React.FC<TextToVideoProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'A hyper-realistic 3D Pixar cartoon scene featuring Aalu and Aam in a vibrant village marketplace at sunset, 4K resolution, cinematic camera push in, beautiful warm lighting and sharp character consistency.'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [duration, setDuration] = useState<VideoDuration>('15s');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [references, setReferences] = useState<MediaReference[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available durations depend on aspect ratio
  // 9:16 Vertical (Shorts/Reels): 5s, 10s, 15s, 20s, 30s
  // 16:9 Landscape: 15s, 30s, 1m, 2m, 3m, 4m, 5m
  const verticalDurations: VideoDuration[] = ['5s', '10s', '15s', '20s', '30s'];
  const landscapeDurations: VideoDuration[] = ['15s', '30s', '1m', '2m', '3m', '4m', '5m'];

  const currentDurationList = aspectRatio === '9:16' ? verticalDurations : landscapeDurations;

  // Handle switching aspect ratio
  const handleSelectAspectRatio = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    if (ratio === '9:16') {
      if (!verticalDurations.includes(duration)) setDuration('15s');
    } else {
      if (!landscapeDurations.includes(duration)) setDuration('3m');
    }
  };

  const handleFileUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please upload an image (PNG, JPG, WebP) or video clip (MP4, WebM).');
      return;
    }

    if (references.length >= 3) {
      alert('You can attach up to 3 references at a time.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newRef: MediaReference = {
        id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: isImage ? 'image' : 'video',
        name: file.name,
        previewUrl: reader.result as string,
        data: reader.result as string,
        mimeType: file.type,
        role: isImage ? 'character' : 'motion',
      };

      setReferences((prev) => [...prev, newRef]);

      // Automatically append reference lock note to prompt for accuracy
      const lockNote = `[Character/Style Anchor: Strictly preserve facial features, clothes, and aesthetics from attached reference <${file.name}> without distortion]`;
      if (!prompt.includes('Character/Style Anchor')) {
        setPrompt((p) => `${p.trim()} ${lockNote}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPresetReference = async (preset: typeof PRESET_REFERENCES[0]) => {
    if (references.length >= 3) return;

    let base64Data = preset.url;
    try {
      const resp = await fetch(preset.url);
      const blob = await resp.blob();
      const reader = new FileReader();
      base64Data = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Preset fetch fallback to url', e);
    }

    const newRef: MediaReference = {
      id: `ref-preset-${Date.now()}`,
      type: preset.type,
      name: preset.name,
      previewUrl: preset.url,
      data: base64Data,
      mimeType: preset.type === 'image' ? 'image/jpeg' : 'video/mp4',
      role: preset.role,
    };

    setReferences((prev) => [...prev, newRef]);

    const lockTag = `[Consistent Character Lock: Exactly match ${preset.name} visual identity]`;
    if (!prompt.includes(preset.name)) {
      setPrompt((p) => `${p.trim()} ${lockTag}`);
    }
  };

  const handleRemoveReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    onGenerate({
      mode: 'text-to-video',
      prompt,
      references,
      aspectRatio,
      duration,
      resolution,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-violet-950/30 to-zinc-900 border border-amber-800/40 rounded-2xl p-4 sm:p-5 text-sm flex items-start space-x-3.5 shadow-lg">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-zinc-100 flex items-center space-x-2">
            <span>Multimodal Text-to-Video with Picture & Video References</span>
            <span className="text-[10px] bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Character Anchor
            </span>
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Attach picture or video references (e.g. character faces, clothes, or camera motion) alongside your text prompt so Gemini Omni Flash locks the exact character identity in every frame without deformation!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Multimodal Reference Uploads & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-200 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Picture / Video References ({references.length}/3)</span>
            </label>
            <span className="text-[11px] text-zinc-400">Locks Character Identity</span>
          </div>

          {/* Reference Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              isDragOver
                ? 'border-violet-500 bg-violet-950/20'
                : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-violet-400 mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-zinc-200">
              Upload Character Photo or Video Clip
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              PNG, JPG, WebP, MP4, WebM (Anchor reference)
            </p>
          </div>

          {/* Attached References List */}
          {references.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Active Reference Anchors
              </span>
              <div className="space-y-2">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-zinc-700">
                        {ref.type === 'video' ? (
                          <video
                            src={ref.previewUrl}
                            muted
                            loop
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={ref.previewUrl}
                            alt={ref.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-violet-600/30 text-violet-300 border border-violet-500/40">
                            {ref.type === 'image' ? 'Picture Ref' : 'Video Ref'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>100% Locked</span>
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">
                          {ref.name}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveReference(ref.id)}
                      className="p-1 rounded-md text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Preset References */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Or pick sample character reference
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_REFERENCES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPresetReference(p)}
                  className="p-2 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-violet-500/50 text-left transition-all flex items-center space-x-2 cursor-pointer group"
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-8 h-8 rounded-lg object-cover shrink-0 border border-zinc-700"
                  />
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-zinc-200 group-hover:text-violet-300 truncate">
                      {p.name}
                    </p>
                    <span className="text-[9px] text-zinc-500 capitalize">
                      {p.type} anchor
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt & Video Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 flex items-center space-x-1.5">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Text Prompt with Character Directives</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Describe scene, action, emotion & story
              </span>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 3D Pixar cartoon style scene of Aalu and Aam in the market, camera slow push in, character emotions happy and realistic..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
            />
          </div>

          {/* Prompt Enhancer */}
          <PromptEnhancer
            currentPrompt={prompt}
            onUpdatePrompt={(newPrompt) => setPrompt(newPrompt)}
          />

          {/* Output Video Parameters */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <span>Format & Duration Controls</span>
              </div>
              {aspectRatio === '16:9' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                  Long-Form (Up to 5 min)
                </span>
              )}
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAspectRatio('9:16')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center space-x-2 ${
                    aspectRatio === '9:16'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>9:16 Vertical (Shorts/Reels)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAspectRatio('16:9')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center space-x-2 ${
                    aspectRatio === '16:9'
                      ? 'bg-violet-600/25 border-violet-500 text-violet-200 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>16:9 Landscape (YouTube 3–5 min)</span>
                </button>
              </div>
            </div>

            {/* Dynamic Duration Control */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-zinc-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Duration Options ({aspectRatio === '9:16' ? 'Short-form: 5s to 30s' : 'Landscape: 15s to 5 min'})
                  </span>
                </label>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  Selected: {duration}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentDurationList.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      duration === dur
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                {aspectRatio === '9:16'
                  ? 'Vertical 9:16 formats: 5s, 10s, 15s, 20s, or 30s for viral short-form video.'
                  : 'Landscape 16:9 formats: supports long-form cinematic scenes from 15s up to 3–5 minutes with continuous camera tracking.'}
              </p>
            </div>

            {/* Resolution */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Output Resolution
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['720p', '1080p', '4k'] as VideoResolution[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      resolution === res
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:via-indigo-500 hover:to-amber-400 text-white shadow-xl shadow-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              Generate Video with Reference Anchors ({duration} • {aspectRatio})
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};
