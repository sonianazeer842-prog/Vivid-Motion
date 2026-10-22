import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Film,
  Zap,
  Play,
  HelpCircle,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { GeneratedVideo, GenerationMode, AspectRatio, VideoDuration, VideoResolution, MediaReference } from './types';
import { SAMPLE_IMAGES, SAMPLE_VIDEOS } from './data/samples';
import { Header } from './components/Header';
import { ImageToVideo } from './components/ImageToVideo';
import { VideoToVideo } from './components/VideoToVideo';
import { TextToVideo } from './components/TextToVideo';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { GenerationProgress } from './components/GenerationProgress';
import { ViralShortsStudio } from './components/ViralShortsStudio';
import { Flame } from 'lucide-react';

// Initial showcase video to demonstrate playback immediately
const INITIAL_SHOWCASE: GeneratedVideo[] = [
  {
    id: 'showcase-steel-girl',
    mode: 'text-to-video',
    prompt: 'ایک لڑکی ہے جو اسٹیل کی بنی ہوئی ہے، اس نے لاوا کے بنے ہوئے کپڑے پہنے ہوئے ہیں اور وہ ایک کیک کھا رہی ہے جو کہ کپڑوں سے بنا ہوا ہے، فیبرک کا بنا ہوا ہے۔ (Chrome steel girl in flowing molten lava gown eating fabric cake)',
    sourceImageUrl: '/src/assets/images/steel_girl_lava_cake_1792579378644.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    aspectRatio: '9:16',
    duration: '15s',
    resolution: '1080p',
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'showcase-1',
    mode: 'image-to-video',
    prompt: 'Gentle raindrops falling, neon lights reflecting in puddles, cinematic slow push in, atmospheric steam rising.',
    sourceImageUrl: SAMPLE_IMAGES[0].imageUrl,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    aspectRatio: '16:9',
    duration: '5s',
    resolution: '720p',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'showcase-2',
    mode: 'video-to-video',
    prompt: 'Transform waves into bioluminescent glowing neon cyan ripples under midnight starlight.',
    sourceVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    aspectRatio: '16:9',
    duration: '5s',
    resolution: '720p',
    createdAt: Date.now() - 7200000,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<GenerationMode>('viral-shorts');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedVideo[]>(() => {
    try {
      const saved = localStorage.getItem('vividmotion_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SHOWCASE;
  });

  const [activeVideo, setActiveVideo] = useState<GeneratedVideo | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vividmotion_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  const handleGenerate = async (payload: {
    mode: GenerationMode;
    prompt: string;
    image?: { data: string; mimeType: string };
    video?: { data: string; mimeType: string };
    references?: MediaReference[];
    previousInteractionId?: string;
    aspectRatio?: AspectRatio;
    duration?: VideoDuration;
    resolution?: VideoResolution;
    preGeneratedVideoUrl?: string;
  }) => {
    // If pre-generated via fast client/canvas synthesis, display immediately!
    if (payload.preGeneratedVideoUrl) {
      const sourceImg =
        payload.references && payload.references.length > 0
          ? payload.references[0].previewUrl
          : payload.image?.data || '/src/assets/images/steel_girl_lava_cake_1792579378644.jpg';

      const fastVideo: GeneratedVideo = {
        id: `gen-${Date.now()}`,
        mode: payload.mode,
        prompt: payload.prompt,
        videoUrl: payload.preGeneratedVideoUrl,
        sourceImageUrl: sourceImg,
        mediaReferences: payload.references,
        aspectRatio: payload.aspectRatio || '9:16',
        duration: payload.duration || '15s',
        resolution: payload.resolution || '1080p',
        createdAt: Date.now(),
      };
      setHistory((prev) => [fastVideo, ...prev]);
      setActiveVideo(fastVideo);
      return;
    }

    setIsGenerating(true);
    setErrorNotice(null);

    try {
      const endpoint =
        payload.mode === 'video-to-video'
          ? '/api/video-to-video'
          : payload.mode === 'text-to-video'
          ? '/api/text-to-video'
          : '/api/image-to-video';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned non-JSON: ' + text.slice(0, 200));
      }

      const generatedUrl = data.videoUrl || data.url;

      if (data.success && generatedUrl) {
        const newVideo: GeneratedVideo = {
          id: `gen-${Date.now()}`,
          mode: payload.mode,
          prompt: payload.prompt,
          videoUrl: generatedUrl,
          sourceImageUrl: payload.image?.data ? (payload.image.data.startsWith('http') || payload.image.data.startsWith('data:') ? payload.image.data : `data:${payload.image.mimeType};base64,${payload.image.data}`) : undefined,
          sourceVideoUrl: payload.video?.data ? (payload.video.data.startsWith('http') || payload.video.data.startsWith('data:') ? payload.video.data : `data:${payload.video.mimeType};base64,${payload.video.data}`) : undefined,
          mediaReferences: payload.references,
          aspectRatio: payload.aspectRatio || '16:9',
          duration: payload.duration || '5s',
          resolution: payload.resolution || '720p',
          createdAt: Date.now(),
          interactionId: data.interactionId,
        };

        setHistory((prev) => [newVideo, ...prev]);
        setActiveVideo(newVideo);
      } else {
        // Handle server message / fallback sample preview
        const msg = data.error || data.message || 'Generation returned an unexpected response.';
        setErrorNotice(msg);

        // Fallback video result so user can still experience the playback interface
        const fallbackVideo: GeneratedVideo = {
          id: `sim-${Date.now()}`,
          mode: payload.mode,
          prompt: payload.prompt,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          sourceImageUrl: payload.image?.data,
          sourceVideoUrl: payload.video?.data,
          mediaReferences: payload.references,
          aspectRatio: payload.aspectRatio || '16:9',
          duration: payload.duration || '5s',
          resolution: payload.resolution || '720p',
          createdAt: Date.now(),
        };
        setHistory((prev) => [fallbackVideo, ...prev]);
        setActiveVideo(fallbackVideo);
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorNotice(err?.message || 'Could not complete video generation request.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteVideo = (id: string) => {
    setHistory((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white">
      {/* Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSelectSampleImage={() => setActiveTab('image-to-video')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Direct Answer Hero Banner */}
        <section className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-600/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-700/50 text-xs font-semibold text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Veo (veo-3.0-generate-preview) & Gemini 2.0 Video Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Generate & Edit AI Videos from{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                Pictures, Videos & Prompts
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Yes! Give the AI any photo to animate it into a video, upload existing video clips to restyle them with custom prompts, or create full cinematic scenes directly from text descriptions.
            </p>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Input Formats
                </span>
                <span className="text-sm font-bold text-zinc-100">
                  Photo, Video, Text
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Model Engine
                </span>
                <span className="text-sm font-bold text-violet-300">
                  Veo 3.0 & Gemini 2.0
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Aspect Ratios
                </span>
                <span className="text-sm font-bold text-zinc-100">
                  16:9 & 9:16 Reels
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Resolution
                </span>
                <span className="text-sm font-bold text-amber-300">
                  Up to 4K / 60fps
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Error / Notice Display */}
        {errorNotice && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-100">Notice</p>
              <p className="text-amber-200/90 leading-relaxed">{errorNotice}</p>
            </div>
          </div>
        )}

        {/* Generation Mode Switcher */}
        <div className="flex flex-wrap border-b border-zinc-800 gap-1 sm:gap-0">
          <button
            type="button"
            onClick={() => setActiveTab('viral-shorts')}
            className={`flex items-center space-x-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'viral-shorts'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Viral AI Shorts (Aalu & Aam Studio)</span>
            <span className="text-[10px] bg-amber-400 text-zinc-950 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ml-1">
              Lip-Sync 4K
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image-to-video')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'image-to-video'
                ? 'border-violet-500 text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-violet-400" />
            <span>Image to Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video-to-video')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'video-to-video'
                ? 'border-indigo-500 text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <VideoIcon className="w-4 h-4 text-indigo-400" />
            <span>Video to Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text-to-video')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'text-to-video'
                ? 'border-violet-500 text-white bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Text to Video</span>
          </button>
        </div>

        {/* Active Generation Progress Screen */}
        {isGenerating && (
          <GenerationProgress
            mode={activeTab}
            onCancel={() => setIsGenerating(false)}
          />
        )}

        {/* Active Studio Tab */}
        {!isGenerating && (
          <div className="bg-zinc-950 rounded-3xl">
            {activeTab === 'viral-shorts' && (
              <ViralShortsStudio />
            )}
            {activeTab === 'image-to-video' && (
              <ImageToVideo
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
            {activeTab === 'video-to-video' && (
              <VideoToVideo
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
            {activeTab === 'text-to-video' && (
              <TextToVideo
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
          </div>
        )}

        {/* Recent Creations Showcase Gallery */}
        <section className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Film className="w-4 h-4 text-violet-400" />
              <h2 className="text-base font-bold text-white">
                Showcase Video Generations & History
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              Click any video to play, inspect side-by-side, or download
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveVideo(item)}
                className="group relative bg-zinc-900 border border-zinc-800 hover:border-violet-500/60 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-md hover:shadow-violet-950/20"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <video
                    src={item.videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    muted
                    loop
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-zinc-200">
                    {item.duration} • {item.resolution}
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-violet-400 uppercase tracking-wider text-[10px]">
                      {item.mode.replace(/-/g, ' ')}
                    </span>
                    <span className="text-zinc-500 font-mono">
                      {item.aspectRatio}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                    "{item.prompt}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works & Capabilities Guide */}
        <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-2 text-white">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold">
              How Gemini Omni Flash Video Generation Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-sm font-semibold text-white">
                Image-to-Video Animation
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Gemini Omni Flash maps the starting frame pixels into a continuous latent diffusion trajectory, applying optical flow and physics according to your motion prompt.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-sm font-semibold text-white">
                Video-to-Video & Restyling
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Transform existing video clips by keeping key motion vectors intact while re-rendering visual surfaces, character designs, weather, or art styles.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-sm font-semibold text-white">
                Multi-Turn Scene Extension
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                By maintaining interaction state, Gemini can extend generated video clips by generating seamless subsequent 5-10 second sequences up to 40 seconds total!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onExtendVideo={(v) => {
            setActiveVideo(null);
            setActiveTab('video-to-video');
          }}
          onUseAsSource={(v) => {
            setActiveVideo(null);
            setActiveTab('video-to-video');
          }}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        videos={history}
        onSelectVideo={(v) => {
          setIsHistoryOpen(false);
          setActiveVideo(v);
        }}
        onDeleteVideo={handleDeleteVideo}
      />
    </div>
  );
}
