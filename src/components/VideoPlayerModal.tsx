import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Maximize2,
  Sparkles,
  Columns,
  Eye,
  Film,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoPlayerModalProps {
  video: GeneratedVideo;
  onClose: () => void;
  onExtendVideo?: (video: GeneratedVideo) => void;
  onUseAsSource?: (video: GeneratedVideo) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onExtendVideo,
  onUseAsSource,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'video' | 'comparison' | 'source'>(
    video.sourceImageUrl || video.sourceVideoUrl ? 'comparison' : 'video'
  );

  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = video.videoUrl;
    a.download = `vividmotion-${video.mode}-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top bar */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-violet-600/20 text-violet-300">
              <Film className="w-4 h-4 text-amber-400" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>AI Video Player</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase font-semibold">
                  {video.resolution} • {video.aspectRatio} • {video.duration}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle if source image/video is available */}
            {(video.sourceImageUrl || video.sourceVideoUrl) && (
              <div className="flex items-center p-0.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('comparison')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    viewMode === 'comparison'
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Columns className="w-3 h-3 inline mr-1" />
                  Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('video')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    viewMode === 'video'
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  Video Only
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download MP4</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Screen Area */}
        <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 sm:p-4 min-h-[300px]">
          {viewMode === 'comparison' && (video.sourceImageUrl || video.sourceVideoUrl) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-full max-h-[550px]">
              {/* Before */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col">
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-zinc-300 border border-zinc-700/60">
                  {video.sourceImageUrl ? 'Original Picture (Keyframe)' : 'Original Source Video'}
                </div>
                {video.sourceImageUrl ? (
                  <img
                    src={video.sourceImageUrl}
                    alt="Original starting image"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={video.sourceVideoUrl}
                    controls
                    loop
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* After: AI Generated Video */}
              <div className="relative rounded-2xl overflow-hidden border border-violet-500/40 bg-zinc-950 flex flex-col shadow-xl">
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-violet-950/80 backdrop-blur-md text-[11px] font-bold text-violet-200 border border-violet-500/50 flex items-center space-x-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Gemini Omni Flash Video Result</span>
                </div>
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  autoPlay
                  loop={isLooping}
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="relative w-full max-h-[580px] flex items-center justify-center">
              <video
                ref={videoRef}
                src={video.videoUrl}
                autoPlay
                loop={isLooping}
                playsInline
                controls
                className="max-h-[580px] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
          )}
        </div>

        {/* Video Controls & Information Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Speed & Loop toggles */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-zinc-500 font-medium">Speed:</span>
              {[0.5, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => changeSpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    playbackRate === speed
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}

              <div className="h-4 w-px bg-zinc-800 mx-1" />

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  isLooping
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                Looping: {isLooping ? 'On' : 'Off'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {onExtendVideo && (
                <button
                  onClick={() => onExtendVideo(video)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Extend Scene (+5s)</span>
                </button>
              )}
              {onUseAsSource && (
                <button
                  onClick={() => onUseAsSource(video)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Restyle This Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Prompt description */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <span className="font-semibold text-zinc-400 block mb-1">
              Generation Prompt:
            </span>
            <p className="text-zinc-200 leading-relaxed font-mono text-[11px]">
              "{video.prompt}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
