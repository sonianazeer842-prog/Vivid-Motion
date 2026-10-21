import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Download,
  Lock,
  Mic,
  Music,
  Clock,
  Layers,
  CheckCircle2,
  Sliders,
  Volume2,
  Film,
  Zap,
  RotateCcw,
  Eye,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { CharacterProfile, ShortsScript, ShortsDialogueLine } from '../types';
import { ShortsCanvasRenderer } from './ShortsCanvasRenderer';
import { lipSyncEngine } from '../utils/audioLipSyncEngine';

// Default locked character profiles for Aalu and Aam
export const DEFAULT_CHARACTERS: CharacterProfile[] = [
  {
    id: 'Aalu',
    name: 'Aalu (Potato)',
    role: 'Young Male Protagonist',
    voiceType: 'Young male, emotional, friendly Urdu voice',
    avatarUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80',
    lockedAppearance: 'Round 3D Pixar golden-potato body, big expressive brown glass eyes, tiny red boots, explorer straw hat, gentle smile',
    eyeColor: 'Warm Brown Catchlight Glass',
    skinTexture: 'Golden Earthy Potato Tactile',
    outfit: 'Straw hat + Little Red Boots',
    isLocked: true,
  },
  {
    id: 'Aam',
    name: 'Aam (Mango)',
    role: 'Wise Elder Brother',
    voiceType: 'Deep, warm, emotional older male Urdu voice',
    avatarUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=300&q=80',
    lockedAppearance: 'Glossy teardrop ripe mango body, golden-orange peach gradients, green swaying leaf sprout hair, royal blue embroidered vest',
    eyeColor: 'Gentle Soulful Green-Brown',
    skinTexture: 'Glossy Ripe Fruit Shading',
    outfit: 'Royal Blue & Gold Embroidered Vest',
    isLocked: true,
  },
];

// Initial default script matching user's exact specification
export const DEFAULT_SHORTS_SCRIPT: ShortsScript = {
  id: 'shorts-aalu-aam-1',
  title: 'Aalu Aur Aam Ki Dosti (True Friendship)',
  storyPrompt: 'Aalu and Aam characters - Aalu returns to help Aam brother who helped him before in the village market',
  characters: DEFAULT_CHARACTERS,
  durationSeconds: 15,
  backgroundSetting: 'Vibrant sunlit fruit & vegetable marketplace, warm golden hour, 4K Pixar 3D cartoon style',
  bgMusicStyle: 'Soft emotional acoustic guitar and warm ambient strings',
  dialogues: [
    {
      id: 'd1',
      speaker: 'Aalu',
      dialogueUrdu: 'عام بھائی، تم نے میری مدد کی تھی، اب میری باری ہے!',
      dialogueRomanUrdu: 'Aam bhai, tumne meri madad ki thi, ab meri baari hai!',
      dialogueEnglish: 'Mango brother, you helped me before, now it is my turn!',
      emotion: 'emotional',
      startTime: 0.5,
      duration: 4.8,
    },
    {
      id: 'd2',
      speaker: 'Aam',
      dialogueUrdu: 'آلو، تم واقعی واپس آ گئے؟ مجھے تم پر فخر ہے میرے چھوٹے بھائی۔',
      dialogueRomanUrdu: 'Aalu, tum waqai wapis aa gaye? Mujhe tum par fakhr hai mere chhotay bhai.',
      dialogueEnglish: 'Aalu, did you really come back? I am so proud of you, my little brother.',
      emotion: 'grateful',
      startTime: 5.8,
      duration: 5.2,
    },
    {
      id: 'd3',
      speaker: 'Aalu',
      dialogueUrdu: 'ہم ہمیشہ ایک دوسرے کا ساتھ دیں گے!',
      dialogueRomanUrdu: 'Hum hamesha aik doosray ka saath dain ge!',
      dialogueEnglish: 'We will always stand by each other!',
      emotion: 'happy',
      startTime: 11.5,
      duration: 3.2,
    },
  ],
};

interface ViralShortsStudioProps {
  onSaveToHistory?: (script: ShortsScript) => void;
}

export const ViralShortsStudio: React.FC<ViralShortsStudioProps> = () => {
  const [prompt, setPrompt] = useState<string>(DEFAULT_SHORTS_SCRIPT.storyPrompt);
  const [duration, setDuration] = useState<number>(15); // 10, 15, 20
  const [script, setScript] = useState<ShortsScript>(DEFAULT_SHORTS_SCRIPT);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [characters, setCharacters] = useState<CharacterProfile[]>(DEFAULT_CHARACTERS);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(true);

  // Animation timeline loop (only runs when playing)
  useEffect(() => {
    if (!isPlaying) return;

    let animationId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= script.durationSeconds) {
          return 0; // Loop back to start
        }
        return next;
      });

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, script.durationSeconds]);

  // Audio speech sync during playback
  useEffect(() => {
    if (isPlaying && bgMusicEnabled) {
      lipSyncEngine.startBackgroundMusic(0.15);
    } else {
      lipSyncEngine.stopBackgroundMusic();
    }
  }, [isPlaying, bgMusicEnabled]);

  // Trigger speech on dialogue start
  const prevDialogueIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!isPlaying) {
      prevDialogueIdRef.current = null;
      return;
    }

    if (currentTime < 0.4) {
      prevDialogueIdRef.current = null;
    }

    const currentLine = script.dialogues.find(
      (d) => currentTime >= d.startTime && currentTime <= d.startTime + 0.35
    );

    if (currentLine && currentLine.id !== prevDialogueIdRef.current) {
      prevDialogueIdRef.current = currentLine.id;
      lipSyncEngine.speakLine(
        currentLine.dialogueUrdu,
        currentLine.dialogueRomanUrdu,
        currentLine.speaker
      );
    }
  }, [currentTime, isPlaying, script.dialogues]);

  // Generate new script from prompt
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setIsPlaying(false);

    try {
      const response = await fetch('/api/generate-shorts-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyPrompt: prompt,
          durationSeconds: duration,
        }),
      });

      const data = await response.json();
      if (data.script && data.script.dialogues) {
        const newScript: ShortsScript = {
          id: `shorts-${Date.now()}`,
          title: data.script.title || 'Aalu & Aam Shorts',
          storyPrompt: prompt,
          characters,
          durationSeconds: duration,
          backgroundSetting: data.script.backgroundSetting || 'Village fruit marketplace, Pixar 3D',
          bgMusicStyle: data.script.bgMusicStyle || 'Emotional strings',
          dialogues: data.script.dialogues.map((d: any, idx: number) => ({
            id: d.id || `line-${idx}`,
            speaker: d.speaker || (idx % 2 === 0 ? 'Aalu' : 'Aam'),
            dialogueUrdu: d.dialogueUrdu || '',
            dialogueRomanUrdu: d.dialogueRomanUrdu || '',
            dialogueEnglish: d.dialogueEnglish || '',
            emotion: d.emotion || 'emotional',
            startTime: typeof d.startTime === 'number' ? d.startTime : idx * 5,
            duration: typeof d.duration === 'number' ? d.duration : 4.5,
          })),
        };

        setScript(newScript);
        setCurrentTime(0);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Script generation error:', err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleTestVoice = (line: ShortsDialogueLine) => {
    lipSyncEngine.speakLine(line.dialogueUrdu, line.dialogueRomanUrdu, line.speaker);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: YouTube Shorts Viral Engine */}
      <div className="rounded-3xl border border-violet-800/40 bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-zinc-950 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>100% Character Consistency • Perfect Lip-Sync • Urdu Voice-Over</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              YouTube Viral Shorts Studio: <span className="text-amber-400">Aalu & Aam</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Ultra-realistic 3D Pixar animation with locked character sheets, word-accurate AI lip-sync, auto Urdu dialogues & voiceovers, emotional background music, and 1080x1920 vertical export!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                setPrompt(DEFAULT_SHORTS_SCRIPT.storyPrompt);
                setScript(DEFAULT_SHORTS_SCRIPT);
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset to Official Test Prompt</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Script, Prompt & Character Consistency (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Character Consistency Locks (Aalu and Aam) */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Character Consistency Engine (100% Locked)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Zero Face/Clothes Drift</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 space-y-2 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${char.id === 'Aalu' ? 'bg-amber-500' : 'bg-orange-500'}`} />
                      <span className="text-sm font-bold text-white">{char.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {char.id === 'Aalu' ? 'Young Male' : 'Deep Male'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                    {char.lockedAppearance}
                  </p>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{char.outfit}</span>
                    </span>
                    <span className="font-mono text-zinc-500">Urdu TTS Synced</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Story Prompt & Controls */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Story Prompt (Characters & Scene Action)</span>
              </label>
              <span className="text-xs text-zinc-400">
                Pixar 3D • 4K Quality • Ultra Realistic
              </span>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Aalu and Aam characters - Aalu repays Aam for helping him in the marketplace with emotional dialogue..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none"
            />

            {/* Duration Selector: 10s, 15s, 20s (Min 10s to Max 20s) */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-zinc-300 block mb-1.5 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  <span>Duration Control (Min 10s — Max 20s)</span>
                </span>
                <div className="flex items-center space-x-2">
                  {[10, 15, 20].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        duration === dur
                          ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {dur}s Shorts
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateScript}
                disabled={isGeneratingScript || !prompt.trim()}
                className="py-2.5 px-5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white shadow-lg shadow-violet-950/40 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isGeneratingScript ? 'Writing Script...' : 'Auto Generate Urdu Dialogues & Voices'}</span>
              </button>
            </div>
          </div>

          {/* 3. Generated Urdu Dialogues & Lip-Sync Timeline */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">
                  Urdu Dialogues & Character Lip-Sync Timeline
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <button
                  type="button"
                  onClick={() => setBgMusicEnabled(!bgMusicEnabled)}
                  className={`flex items-center space-x-1 font-semibold ${
                    bgMusicEnabled ? 'text-amber-400' : 'text-zinc-500'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>BG Music: {bgMusicEnabled ? 'On (Ducked)' : 'Off'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {script.dialogues.map((d, index) => {
                const isCurrent =
                  currentTime >= d.startTime && currentTime <= d.startTime + d.duration;

                return (
                  <div
                    key={d.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                      isCurrent
                        ? 'bg-violet-950/40 border-violet-500/60 shadow-lg'
                        : 'bg-zinc-950/80 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            d.speaker === 'Aalu'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          }`}
                        >
                          {d.speaker} ({d.speaker === 'Aalu' ? 'Young Voice' : 'Deep Voice'})
                        </span>
                        <span className="text-zinc-500 text-[11px] font-mono">
                          {d.startTime.toFixed(1)}s - {(d.startTime + d.duration).toFixed(1)}s
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTestVoice(d)}
                        className="text-violet-400 hover:text-violet-300 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Test Voice</span>
                      </button>
                    </div>

                    {/* Urdu Nastaliq Line */}
                    <p className="text-lg font-bold text-amber-300 font-serif leading-loose text-right dir-rtl">
                      "{d.dialogueUrdu}"
                    </p>

                    {/* Roman Urdu & English */}
                    <div className="text-xs text-zinc-300 font-mono space-y-0.5">
                      <p className="text-zinc-200">"{d.dialogueRomanUrdu}"</p>
                      <p className="text-[11px] text-zinc-500 italic font-sans">{d.dialogueEnglish}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 9:16 Shorts Canvas Player & Exporter (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col items-center">
          {/* Player Configuration Toggles */}
          <div className="w-full max-w-[380px] flex items-center justify-between px-2 text-xs text-zinc-400">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSubtitles}
                onChange={(e) => setShowSubtitles(e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span>Viral Animated Subtitles</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSafeZones}
                onChange={(e) => setShowSafeZones(e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span>YouTube Safe Zones</span>
            </label>
          </div>

          {/* 9:16 Shorts Canvas Renderer */}
          <ShortsCanvasRenderer
            script={script}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onSeek={(t) => setCurrentTime(t)}
            currentTime={currentTime}
            showSubtitles={showSubtitles}
            showSafeZones={showSafeZones}
          />

          {/* Progress Timeline Slider */}
          <div className="w-full max-w-[380px] bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Time: {currentTime.toFixed(1)}s</span>
              <span>Total: {script.durationSeconds}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={script.durationSeconds}
              step={0.1}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
          </div>

          {/* Feature Guarantee Badges */}
          <div className="w-full max-w-[380px] grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pixel-Perfect Lip-Sync</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>1080x1920 9:16 Shorts</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Urdu Dialogues & BGM</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pixar 3D No Distortion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
