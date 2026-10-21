import React, { useState } from 'react';
import { Sparkles, Camera, Palette, Sun, Loader2, Check } from 'lucide-react';
import { CAMERA_MOVEMENTS, VISUAL_STYLES, LIGHTING_PRESETS } from '../data/samples';

interface PromptEnhancerProps {
  currentPrompt: string;
  onUpdatePrompt: (newPrompt: string) => void;
}

export const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  currentPrompt,
  onUpdatePrompt,
}) => {
  const [selectedMotion, setSelectedMotion] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedLighting, setSelectedLighting] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEnhanceWithAI = async () => {
    if (!currentPrompt.trim()) return;
    setIsEnhancing(true);

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          cameraMotion: selectedMotion,
          style: selectedStyle,
          lighting: selectedLighting,
        }),
      });

      const data = await response.json();
      if (data.enhancedPrompt) {
        onUpdatePrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Enhance error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyPreset = (type: 'motion' | 'style' | 'lighting', value: string, textToAppend: string) => {
    if (type === 'motion') {
      setSelectedMotion(selectedMotion === value ? '' : value);
    } else if (type === 'style') {
      setSelectedStyle(selectedStyle === value ? '' : value);
    } else {
      setSelectedLighting(selectedLighting === value ? '' : value);
    }

    // Append to prompt if not already there
    const trimmed = currentPrompt.trim();
    if (!trimmed.toLowerCase().includes(textToAppend.toLowerCase())) {
      const updated = trimmed ? `${trimmed}, ${textToAppend}` : textToAppend;
      onUpdatePrompt(updated);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Cinematic Director & Prompt Enhancer
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {isExpanded ? 'Hide Director Controls' : 'Show Camera & Style Presets'}
          </button>
          <button
            type="button"
            onClick={handleEnhanceWithAI}
            disabled={isEnhancing || !currentPrompt.trim()}
            className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium shadow-md shadow-violet-500/10 transition-all cursor-pointer"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Directing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Enhance Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-2 border-t border-zinc-800/60 space-y-3 text-xs">
          {/* Camera Motion */}
          <div>
            <div className="flex items-center space-x-1.5 text-zinc-400 mb-1.5 font-medium">
              <Camera className="w-3 h-3 text-indigo-400" />
              <span>Camera Movement</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CAMERA_MOVEMENTS.map((m) => {
                const active = selectedMotion === m.name;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleApplyPreset('motion', m.name, `camera ${m.name.toLowerCase()}`)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      active
                        ? 'bg-violet-600/30 text-violet-200 border border-violet-500/50'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50'
                    }`}
                  >
                    {active && <Check className="w-2.5 h-2.5 inline mr-1 text-violet-400" />}
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Style */}
          <div>
            <div className="flex items-center space-x-1.5 text-zinc-400 mb-1.5 font-medium">
              <Palette className="w-3 h-3 text-violet-400" />
              <span>Cinematic Style</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VISUAL_STYLES.map((s) => {
                const active = selectedStyle === s.name;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleApplyPreset('style', s.name, s.promptChunk)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      active
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50'
                    }`}
                  >
                    {active && <Check className="w-2.5 h-2.5 inline mr-1 text-indigo-400" />}
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lighting */}
          <div>
            <div className="flex items-center space-x-1.5 text-zinc-400 mb-1.5 font-medium">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Atmospheric Lighting</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {LIGHTING_PRESETS.map((l) => {
                const active = selectedLighting === l.name;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleApplyPreset('lighting', l.name, l.promptChunk)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      active
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50'
                    }`}
                  >
                    {active && <Check className="w-2.5 h-2.5 inline mr-1 text-amber-400" />}
                    {l.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
