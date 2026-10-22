import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Check,
  Zap,
  Info,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { AspectRatio, VideoDuration, VideoResolution } from '../types';
import { SAMPLE_IMAGES } from '../data/samples';
import { PromptEnhancer } from './PromptEnhancer';

interface ImageToVideoProps {
  onGenerate: (payload: {
    mode: 'image-to-video';
    prompt: string;
    image: { data: string; mimeType: string };
    aspectRatio: AspectRatio;
    duration: VideoDuration;
    resolution: VideoResolution;
  }) => Promise<void>;
  isGenerating: boolean;
}

export const ImageToVideo: React.FC<ImageToVideoProps> = ({
  onGenerate,
  isGenerating,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(SAMPLE_IMAGES[0].imageUrl);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState<string>(SAMPLE_IMAGES[0].recommendedPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<VideoDuration>('5s');
  const [resolution, setResolution] = useState<VideoResolution>('720p');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setImageMimeType(file.type);
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

  const handleSelectSample = (sample: typeof SAMPLE_IMAGES[0]) => {
    setImagePreview(sample.imageUrl);
    setImageMimeType('image/jpeg');
    setPrompt(sample.recommendedPrompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview || !prompt.trim() || isGenerating) return;

    // Convert image preview to base64 if it's an external url
    let base64Data = imagePreview;
    let mimeType = imageMimeType;

    if (imagePreview.startsWith('http')) {
      try {
        // Fetch and convert sample image to base64
        const resp = await fetch(imagePreview);
        const blob = await resp.blob();
        mimeType = blob.type || 'image/jpeg';
        const reader = new FileReader();
        base64Data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Could not fetch sample directly, passing url or placeholder', err);
      }
    }

    onGenerate({
      mode: 'image-to-video',
      prompt,
      image: { data: base64Data, mimeType },
      aspectRatio,
      duration,
      resolution,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informational Answer Card */}
      <div className="bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-zinc-900 border border-violet-800/40 rounded-2xl p-4 sm:p-5 text-sm flex items-start space-x-3.5 shadow-lg">
        <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 shrink-0 mt-0.5">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-zinc-100 flex items-center space-x-2">
            <span>Yes! Veo 3.0 & Gemini 2.0 Generates Full AI Video from Photos</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Image-to-Video Mode
            </span>
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Provide any still photograph or artwork with a motion prompt. The AI calculates depth maps, optical flow, and volumetric lighting to synthesize smooth 5s or 10s video continuations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-violet-400" />
              <span>Input Starting Image</span>
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                Clear Image
              </button>
            )}
          </div>

          {/* Upload Dropzone / Preview */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 transition-all overflow-hidden flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px] ${
              isDragOver
                ? 'border-violet-500 bg-violet-950/20'
                : imagePreview
                ? 'border-zinc-800 bg-zinc-950'
                : 'border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/40 cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {imagePreview ? (
              <div className="relative w-full h-full group">
                <img
                  src={imagePreview}
                  alt="Source for video generation"
                  className="w-full h-[280px] sm:h-[320px] object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-black/30 opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-between p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-900/80 backdrop-blur-md rounded-lg text-zinc-200 border border-zinc-700/60">
                      Starting Keyframe
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-violet-600/90 hover:bg-violet-600 text-white rounded-lg shadow-md transition-all cursor-pointer"
                    >
                      Change Photo
                    </button>
                  </div>
                  <div className="text-left text-xs text-zinc-300">
                    <p className="font-semibold text-white">Source Visual Anchor</p>
                    <p className="text-[11px] text-zinc-400">
                      The AI will animate this exact subject, lighting, and palette.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-violet-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    Click to upload photo or drag & drop
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports PNG, JPG, WebP up to 30MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sample Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Or pick a curated sample photo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className={`group relative rounded-xl overflow-hidden border text-left transition-all aspect-video cursor-pointer ${
                    imagePreview === s.imageUrl
                      ? 'border-violet-500 ring-2 ring-violet-500/40'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] font-medium text-white line-clamp-1">
                      {s.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt & Video Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Prompt Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Motion & Action Prompt</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                Describe the camera movement and motion
              </span>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Camera push in, cherry blossom petals falling gently in the spring breeze, soft golden morning light..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
            />
          </div>

          {/* Prompt Enhancer with Camera Motion & Styles */}
          <PromptEnhancer
            currentPrompt={prompt}
            onUpdatePrompt={(newPrompt) => setPrompt(newPrompt)}
          />

          {/* Video Parameters */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Video Generation Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Aspect Ratio */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    16:9 Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      aspectRatio === '9:16'
                        ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    9:16 Reels/TikTok
                  </button>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Duration
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDuration('5s')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      duration === '5s'
                        ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    5 Seconds
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration('10s')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      duration === '10s'
                        ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    10 Seconds
                  </button>
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Resolution
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['720p', '1080p', '4k'] as VideoResolution[]).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setResolution(res)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        resolution === res
                          ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                          : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!imagePreview || !prompt.trim() || isGenerating}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:via-indigo-500 hover:to-amber-400 text-white shadow-xl shadow-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Generate Video from Picture & Prompt</span>
          </button>
        </div>
      </div>
    </form>
  );
};
