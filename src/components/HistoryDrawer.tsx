import React from 'react';
import { X, Play, Trash2, Download, Film, Sparkles, ExternalLink } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  videos: GeneratedVideo[];
  onSelectVideo: (video: GeneratedVideo) => void;
  onDeleteVideo: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  videos,
  onSelectVideo,
  onDeleteVideo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center space-x-2">
              <Film className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">
                Creations History ({videos.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {videos.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 space-y-3">
                <Film className="w-10 h-10 mx-auto text-zinc-600 opacity-60" />
                <p className="text-sm">No videos generated yet.</p>
                <p className="text-xs text-zinc-400">
                  Select a photo or prompt to render your first AI video!
                </p>
              </div>
            ) : (
              videos.map((vid) => (
                <div
                  key={vid.id}
                  className="group relative bg-zinc-900/80 border border-zinc-800 hover:border-violet-500/50 rounded-2xl p-3 transition-all space-y-2.5 shadow-md"
                >
                  <div
                    onClick={() => onSelectVideo(vid)}
                    className="relative aspect-video rounded-xl overflow-hidden bg-black cursor-pointer group-hover:ring-1 group-hover:ring-violet-500/50"
                  >
                    <video
                      src={vid.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-zinc-300">
                      {vid.duration} • {vid.resolution}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span className="capitalize font-semibold text-violet-400">
                        {vid.mode.replace(/-/g, ' ')}
                      </span>
                      <span>
                        {new Date(vid.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 line-clamp-2 font-mono">
                      "{vid.prompt}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-xs">
                    <button
                      onClick={() => onSelectVideo(vid)}
                      className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Play Video</span>
                    </button>
                    <button
                      onClick={() => onDeleteVideo(vid.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
