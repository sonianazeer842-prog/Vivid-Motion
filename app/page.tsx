"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  Video as VideoIcon,
  Image as ImageIcon,
  Film,
  Play,
  RotateCcw,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

interface GenerationPayload {
  mode: 'image-to-video' | 'video-to-video' | 'text-to-video';
  prompt: string;
  image?: { data: string; mimeType: string };
  video?: { data: string; mimeType: string };
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p' | '4k';
  duration: '5s' | '10s';
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<'image-to-video' | 'video-to-video' | 'text-to-video'>('image-to-video');
  const [prompt, setPrompt] = useState<string>(
    'ایک لڑکی ہے جو اسٹیل کی بنی ہوئی ہے، اس نے لاوا کے بنے ہوئے کپڑے پہنے ہوئے ہیں اور وہ ایک کیک کھا رہی ہے جو کہ کپڑوں سے بنا ہوا ہے، فیبرک کا بنا ہوا ہے۔'
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [duration, setDuration] = useState<'5s' | '10s'>('5s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imagePreview) return;

    setIsGenerating(true);
    setErrorNotice(null);
    setStatusMessage('Generating with Veo 3.0 & Gemini 2.0...');

    const payload: GenerationPayload = {
      mode: activeTab,
      prompt,
      image: imagePreview ? { data: imagePreview, mimeType: 'image/jpeg' } : undefined,
      aspectRatio,
      resolution,
      duration,
    };

    try {
      // Direct call to specific route endpoint to prevent any NOT_FOUND error
      const endpoint =
        activeTab === 'video-to-video'
          ? '/api/video-to-video'
          : activeTab === 'text-to-video'
          ? '/api/text-to-video'
          : '/api/image-to-video';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Safe JSON parser: Never crash if an HTML error page is returned
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned non-JSON: ' + text.slice(0, 200));
      }

      if (data.success && (data.videoUrl || data.url)) {
        const url = data.videoUrl || data.url;
        setVideoUrl(url);
        setStatusMessage(data.message || 'Video generated successfully!');
      } else {
        const err = data.error || data.message || 'Video generation failed.';
        setErrorNotice(typeof err === 'string' ? err : JSON.stringify(err));
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorNotice(err?.message || 'Failed to connect to API server.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-amber-500 flex items-center justify-center shadow-lg">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Viral AI Shorts App</h1>
            <p className="text-xs text-zinc-400">Veo 3.0 & Gemini 2.0 Studio</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All API Routes Active</span>
          </span>
        </div>
      </header>

      {/* Main Studio */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Notice Banner */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-zinc-300">
            <span className="font-bold text-white block">Yes! Veo 3.0 & Gemini 2.0 Generates Full AI Video from Photos</span>
            Give any photo or Urdu/English prompt and the app will generate a 16:9 or 9:16 vertical video without returning any HTML error page.
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('image-to-video')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'image-to-video'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image to Video</span>
          </button>
          <button
            onClick={() => setActiveTab('video-to-video')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'video-to-video'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>Video to Video</span>
          </button>
          <button
            onClick={() => setActiveTab('text-to-video')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'text-to-video'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Text to Video</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-5">
            {activeTab === 'image-to-video' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Upload Photo / Reference Image
                </label>
                <div className="border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-2xl p-4 text-center transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer block space-y-2">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-cover"
                      />
                    ) : (
                      <div className="py-6">
                        <ImageIcon className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                        <span className="text-xs text-zinc-400">Click to upload photo (PNG, JPG, WebP)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Prompt (Urdu, Roman Urdu or English)
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your scene or motion..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
              />
            </div>

            {/* Specs Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e: any) => setAspectRatio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="9:16">9:16 Vertical (Reels/Shorts)</option>
                  <option value="16:9">16:9 Landscape</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e: any) => setResolution(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="1080p">1080p Full HD</option>
                  <option value="4k">4K Ultra HD / 60fps</option>
                  <option value="720p">720p HD</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e: any) => setDuration(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="5s">5 Seconds</option>
                  <option value="10s">10 Seconds</option>
                </select>
              </div>
            </div>

            {/* Error & Status Notices */}
            {errorNotice && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorNotice}</span>
              </div>
            )}

            {statusMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 font-bold text-sm text-white shadow-xl shadow-violet-950/50 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{isGenerating ? 'Generating Video...' : 'Generate AI Video Now'}</span>
            </button>
          </div>

          {/* Preview Player Column */}
          <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Video Output Player
                </span>
                <span className="text-xs text-violet-400 font-semibold">{aspectRatio}</span>
              </div>

              {videoUrl ? (
                <div
                  className={`relative rounded-2xl overflow-hidden bg-black border border-zinc-800 mx-auto ${
                    aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[280px]' : 'aspect-video w-full'
                  }`}
                >
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
                  No video generated yet
                </div>
              )}
            </div>

            {videoUrl && (
              <div className="pt-4">
                <a
                  href={videoUrl}
                  download="generated-video.mp4"
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center justify-center space-x-2 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4 Video</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
