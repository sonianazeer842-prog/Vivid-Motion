import React, { useEffect, useState } from 'react';
import { Film, Sparkles, Loader2, Cpu, Video, CheckCircle2 } from 'lucide-react';

interface GenerationProgressProps {
  mode: string;
  onCancel?: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  mode,
  onCancel,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Injesting Media & Motion Vectors', desc: 'Pre-processing source visual anchors' },
    { title: 'Invoking Gemini Omni Flash (1.1)', desc: 'Generating 3D spatial & temporal coherence' },
    { title: 'Synthesizing High-FPS Frames', desc: 'Rendering lighting physics, depth & motion curves' },
    { title: 'Encoding Final MP4 Stream', desc: 'Assembling seamless video container' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (next < 8) setCurrentStep(0);
        else if (next < 20) setCurrentStep(1);
        else if (next < 35) setCurrentStep(2);
        else setCurrentStep(3);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-zinc-900/90 border border-violet-500/30 rounded-2xl p-6 text-center space-y-5 shadow-2xl shadow-violet-950/40 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header icon */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 p-0.5 animate-spin [animation-duration:8s]">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
            <Film className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 bg-violet-500 text-white rounded-full p-1 shadow-md">
          <Sparkles className="w-3 h-3" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Generating AI Video with Gemini Omni Flash
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
          AI video synthesis computes optical flow, physics, and fluid motion frame-by-frame.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-2">
        {steps.map((s, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                isCurrent
                  ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-900/20'
                  : isDone
                  ? 'bg-zinc-900/60 border-emerald-500/30'
                  : 'bg-zinc-950/40 border-zinc-800/60 opacity-50'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 shrink-0" />
                )}
                <span className={`text-[11px] font-semibold truncate ${
                  isCurrent ? 'text-violet-200' : isDone ? 'text-emerald-300' : 'text-zinc-400'
                }`}>
                  {s.title}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 line-clamp-1">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Progress timer & cancel */}
      <div className="flex items-center justify-center space-x-4 text-xs text-zinc-400 pt-1">
        <span className="font-mono bg-zinc-800/70 px-2.5 py-1 rounded-md text-zinc-300">
          Elapsed: {secondsElapsed}s
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-200 underline text-xs"
          >
            Cancel Generation
          </button>
        )}
      </div>
    </div>
  );
};
