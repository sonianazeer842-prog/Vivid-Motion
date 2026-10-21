import React, { useState, useRef } from 'react';
import {
  Video as VideoIcon,
  Upload,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Zap,
  FastForward,
  Film,
} from 'lucide-react';
import { SAMPLE_VIDEOS } from '../data/samples';
import { PromptEnhancer } from './PromptEnhancer';

interface VideoToVideoProps {
  onGenerate: (payload: {
    mode: 'video-to-video' | 'extend-video';
    prompt: string;
    video?: { data: string; mimeType: string };
    previousInteractionId?: string;
  }) => Promise<void>;
  isGenerating: boolean;
}

export const VideoToVideo: React.FC<VideoToVideoProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [videoPreview, setVideoPreview] = useState<string | null>(SAMPLE_VIDEOS[0].mediaUrl);
  const [videoMimeType, setVideoMimeType] = useState<string>('video/mp4');
  const [prompt, setPrompt] = useState<string>(SAMPLE_VIDEOS[0].prompt);
  const [isExtendMode, setIsExtendMode] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file (MP4, WebM).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setVideoPreview(reader.result as string);
      setVideoMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_VIDEOS[0]) => {
    setVideoPreview(sample.mediaUrl);
    setVideoMimeType('video/mp4');
    setPrompt(sample.prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPreview || !prompt.trim() || isGenerating) return;

    let base64Data = videoPreview;
    let mimeType = videoMimeType;

    if (videoPreview.startsWith('http')) {
      try {
        const resp = await fetch(videoPreview);
        const blob = await resp.blob();
        mimeType = blob.type || 'video/mp4';
        const reader = new FileReader();
        base64Data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Could not fetch sample video directly, passing preview', err);
      }
    }

    onGenerate({
      mode: isExtendMode ? 'extend-video' : 'video-to-video',
      prompt,
      video: { data: base64Data, mimeType },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informational Answer Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-zinc-900 border border-indigo-800/40 rounded-2xl p-4 sm:p-5 text-sm flex items-start space-x-3.5 shadow-lg">
        <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5">
          <Film className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-zinc-100 flex items-center space-x-2">
            <span>Video-to-Video Editing & Scene Extension</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              Video Transformation
            </span>
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Upload an existing video and give instructions to restyle the visuals (e.g. anime, cyberpunk, vintage 16mm), alter weather or lighting, or extend the scene duration seamlessly!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Source Video (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <VideoIcon className="w-4 h-4 text-indigo-400" />
              <span>Source Video Input</span>
            </label>
            {videoPreview && (
              <button
                type="button"
                onClick={() => {
                  setVideoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                Clear Video
              </button>
            )}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !videoPreview && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 transition-all overflow-hidden flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px] ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-950/20'
                : videoPreview
                ? 'border-zinc-800 bg-zinc-950'
                : 'border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/40 cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {videoPreview ? (
              <div className="relative w-full h-full flex flex-col justify-between">
                <video
                  src={videoPreview}
                  controls
                  loop
                  playsInline
                  className="w-full h-[260px] sm:h-[300px] object-cover rounded-xl"
                />
                <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[200px]">
                    Input Video Loaded
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Change Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-indigo-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    Upload video or drag & drop clip
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports MP4, WebM (up to 40MB recommended)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preset Sample Videos */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Or test with sample video clips
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_VIDEOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className={`group relative rounded-xl overflow-hidden border text-left transition-all p-2 bg-zinc-900/70 hover:bg-zinc-800/80 cursor-pointer ${
                    videoPreview === s.mediaUrl
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                      : 'border-zinc-800'
                  }`}
                >
                  <p className="text-xs font-semibold text-zinc-100 group-hover:text-indigo-300 line-clamp-1">
                    {s.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                    {s.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt & Editing Modes (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setIsExtendMode(false)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                !isExtendMode
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Restyle / Edit Video
            </button>
            <button
              type="button"
              onClick={() => setIsExtendMode(true)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                isExtendMode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Extend Video Length</span>
            </button>
          </div>

          {/* Prompt Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {isExtendMode ? 'Scene Continuation Instruction' : 'Video Transformation Prompt'}
                </span>
              </label>
              <span className="text-[11px] text-zinc-400">
                {isExtendMode ? 'Describe how the scene continues' : 'Describe the edit or style changes'}
              </span>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isExtendMode
                  ? 'e.g. Continue the scene: the camera pans across the horizon as sunset turns into night with glowing stars...'
                  : 'e.g. Turn the scene into cyberpunk night with rain and neon reflections, anime aesthetic...'
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Prompt Enhancer */}
          <PromptEnhancer
            currentPrompt={prompt}
            onUpdatePrompt={(newPrompt) => setPrompt(newPrompt)}
          />

          {/* Quick Idea Presets */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5 text-xs">
            <span className="font-semibold text-zinc-300">Quick Transform Ideas:</span>
            <div className="flex flex-wrap gap-2">
              {[
                'Restyle to Studio Ghibli Anime watercolor',
                'Change daytime to rainy neon cyberpunk',
                'Add cinematic lens flare & golden hour glow',
                'Transform into vintage 1970s 16mm film stock',
                'Convert to dark moody cinematic film noir',
              ].map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(idea)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[11px] transition-all cursor-pointer"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!videoPreview || !prompt.trim() || isGenerating}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 hover:from-indigo-500 hover:via-violet-500 hover:to-amber-400 text-white shadow-xl shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {isExtendMode ? 'Extend Video with Gemini Omni Flash' : 'Apply AI Video Transformation'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};
