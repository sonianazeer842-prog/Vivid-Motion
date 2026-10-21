import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Sliders,
  Camera,
  Film,
  Zap,
} from 'lucide-react';
import { AspectRatio, VideoDuration, VideoResolution } from '../types';
import { PromptEnhancer } from './PromptEnhancer';

interface TextToVideoProps {
  onGenerate: (payload: {
    mode: 'text-to-video';
    prompt: string;
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
    'A hyper-realistic close-up of a futuristic cybernetic hummingbird hovering near a bioluminescent orchid, droplets suspended in mid-air, slow cinematic camera tracking, 4k ultra-detailed.'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<VideoDuration>('5s');
  const [resolution, setResolution] = useState<VideoResolution>('720p');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    onGenerate({
      mode: 'text-to-video',
      prompt,
      aspectRatio,
      duration,
      resolution,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950/30 via-violet-950/20 to-zinc-900 border border-amber-800/30 rounded-2xl p-4 sm:p-5 text-sm flex items-start space-x-3.5 shadow-lg">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-zinc-100 flex items-center space-x-2">
            <span>Direct Text-to-Video Generation</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              Prompt Synthesis
            </span>
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Generate an entire cinematic video from scratch using detailed descriptive prompts with Google Gemini Omni Flash.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <Film className="w-4 h-4 text-amber-400" />
              <span>Cinematic Scene Description</span>
            </label>
            <span className="text-[11px] text-zinc-400">
              Include subject, environment, lighting, motion, and lens type
            </span>
          </div>

          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A hyper-realistic close-up of an elephant drinking a large cup of tea with porcelain reflections, afternoon sunlight..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
          />
        </div>

        {/* Prompt Enhancer */}
        <PromptEnhancer
          currentPrompt={prompt}
          onUpdatePrompt={(newPrompt) => setPrompt(newPrompt)}
        />

        {/* Settings */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span>Output Video Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                      : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
                  }`}
                >
                  16:9 Landscape
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                      : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
                  }`}
                >
                  9:16 Vertical
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDuration('5s')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    duration === '5s'
                      ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                      : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
                  }`}
                >
                  5 Seconds
                </button>
                <button
                  type="button"
                  onClick={() => setDuration('10s')}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    duration === '10s'
                      ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                      : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
                  }`}
                >
                  10 Seconds
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Resolution
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['720p', '1080p', '4k'] as VideoResolution[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                      resolution === res
                        ? 'bg-violet-600/25 border-violet-500 text-violet-200'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:via-indigo-500 hover:to-amber-400 text-white shadow-xl shadow-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Generate Text-to-Video Clip</span>
        </button>
      </div>
    </form>
  );
};
