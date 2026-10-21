import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Download, Eye, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { ShortsScript, ShortsDialogueLine } from '../types';
import { lipSyncEngine, VisemeFrame } from '../utils/audioLipSyncEngine';

interface ShortsCanvasRendererProps {
  script: ShortsScript;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  currentTime: number;
  showSubtitles?: boolean;
  showSafeZones?: boolean;
}

export const ShortsCanvasRenderer: React.FC<ShortsCanvasRendererProps> = ({
  script,
  isPlaying,
  onTogglePlay,
  onSeek,
  currentTime,
  showSubtitles = true,
  showSafeZones = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Directly derive active dialogue, speaker, and word index without setState
  const currentDialogue = script.dialogues.find(
    (d) => currentTime >= d.startTime && currentTime <= d.startTime + d.duration
  ) || null;

  const activeSpeaker: 'Aalu' | 'Aam' | 'None' = currentDialogue
    ? (currentDialogue.speaker as 'Aalu' | 'Aam')
    : 'None';

  const activeWordIndex = currentDialogue
    ? (() => {
        const words = currentDialogue.dialogueRomanUrdu.split(' ');
        const elapsed = currentTime - currentDialogue.startTime;
        const progress = Math.min(1, Math.max(0, elapsed / currentDialogue.duration));
        return Math.min(words.length - 1, Math.floor(progress * words.length));
      })()
    : 0;

  // Main rendering function for 9:16 Canvas (1080x1920 logical, scaled to element)
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const t = currentTime;

    // Camera sway / smooth dolly motion
    const camY = Math.sin(t * 0.8) * 15;
    const camZoom = 1 + Math.sin(t * 0.4) * 0.02;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(camZoom, camZoom);
    ctx.translate(-width / 2, -height / 2 + camY);

    // 1. Pixar 3D Vibrant Background
    drawPixarBackground(ctx, width, height, t);

    // 2. Draw Aam Character (Right, slightly behind or side)
    const isAamSpeaking = activeSpeaker === 'Aam';
    const aamViseme = lipSyncEngine.calculateViseme(
      t,
      isAamSpeaking,
      'Aam',
      currentDialogue?.dialogueRomanUrdu || ''
    );
    drawAamCharacter(ctx, 720, 1180, t, isAamSpeaking, aamViseme);

    // 3. Draw Aalu Character (Left, center foreground)
    const isAaluSpeaking = activeSpeaker === 'Aalu';
    const aaluViseme = lipSyncEngine.calculateViseme(
      t,
      isAaluSpeaking,
      'Aalu',
      currentDialogue?.dialogueRomanUrdu || ''
    );
    drawAaluCharacter(ctx, 360, 1260, t, isAaluSpeaking, aaluViseme);

    // 4. Floating atmospheric light particles / dust motes
    drawAtmosphereParticles(ctx, width, height, t);

    ctx.restore();

    // 5. Draw Animated Viral Shorts Subtitles (Rendered onto Canvas for MP4 recording)
    if (showSubtitles && currentDialogue) {
      drawViralSubtitles(ctx, width, height, currentDialogue, activeWordIndex, t);
    }

    // 6. YouTube Shorts UI Safe Zone Overlay
    if (showSafeZones) {
      drawSafeZones(ctx, width, height);
    }
  }, [currentTime, activeSpeaker, currentDialogue, activeWordIndex, showSubtitles, showSafeZones]);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  // Export Canvas + Audio to MP4/WebM Video
  const handleExportMP4 = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isExporting) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const stream = canvas.captureStream(30);

      // Web Audio stream integration
      const audioCtx = lipSyncEngine.getContext();
      const dest = audioCtx.createMediaStreamDestination();
      lipSyncEngine.startBackgroundMusic(0.18);

      const combinedTracks = [
        ...stream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps high quality
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        a.download = `Aalu_Aam_Shorts_1080x1920_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsExporting(false);
      };

      recorder.start();

      // Play through timeline to record every frame
      const totalDur = script.durationSeconds;
      let recTime = 0;
      const step = 0.033; // 30 fps

      const recordInterval = setInterval(() => {
        recTime += step;
        onSeek(recTime);
        setExportProgress(Math.min(100, Math.round((recTime / totalDur) * 100)));

        if (recTime >= totalDur) {
          clearInterval(recordInterval);
          recorder.stop();
          lipSyncEngine.stopBackgroundMusic();
        }
      }, 33);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 9:16 Vertical Video Frame Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-zinc-800 bg-zinc-950 shadow-2xl shadow-violet-950/50 group">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          onClick={onTogglePlay}
        />

        {/* Live Lip-Sync Active Indicator Badge */}
        {activeSpeaker !== 'None' && (
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>AI Lip-Sync: {activeSpeaker} Speaking</span>
          </div>
        )}

        {/* Play/Pause Overlay Button */}
        {!isPlaying && (
          <div
            onClick={onTogglePlay}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-10 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-violet-600/90 hover:bg-violet-600 text-white flex items-center justify-center shadow-2xl scale-100 hover:scale-105 transition-transform">
              <Play className="w-7 h-7 fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Safe Zones Watermark Preview */}
        {showSafeZones && (
          <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center space-y-4 opacity-75 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-white text-[11px] font-bold">
              Like
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-white text-[11px] font-bold">
              Chat
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-white text-[11px] font-bold">
              Share
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-500/80 animate-spin flex items-center justify-center text-zinc-950 text-[10px] font-extrabold">
              Urdu
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: Play/Pause, Seek & Export MP4 */}
      <div className="w-full max-w-[380px] flex items-center justify-between gap-3">
        <button
          onClick={onTogglePlay}
          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{isPlaying ? 'Pause Preview' : 'Play Shorts'}</span>
        </button>

        <button
          onClick={handleExportMP4}
          disabled={isExporting}
          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? `Exporting ${exportProgress}%` : 'Export Final MP4'}</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================================
// PIXAR 3D RENDERING LOGIC FOR AALU, AAM, BACKGROUND & VIRAL SUBTITLES
// ==========================================================

function drawPixarBackground(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Sunset sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#1e1136');    // Deep twilight purple
  skyGrad.addColorStop(0.35, '#541c49'); // Warm magenta sunset
  skyGrad.addColorStop(0.65, '#b84d34'); // Amber horizon
  skyGrad.addColorStop(1, '#2c1626');    // Ground shadow
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Distant warm sun orb
  const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.45, 380);
  sunGrad.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
  sunGrad.addColorStop(0.3, 'rgba(255, 170, 70, 0.4)');
  sunGrad.addColorStop(1, 'rgba(255, 120, 50, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, w, h);

  // Village wooden marketplace stalls in soft bokeh
  ctx.fillStyle = 'rgba(40, 20, 30, 0.7)';
  ctx.fillRect(100, h * 0.55, 300, 400);
  ctx.fillRect(680, h * 0.52, 320, 450);

  // Wooden fruit crate textures
  ctx.fillStyle = '#6d4229';
  ctx.fillRect(180, h * 0.72, 220, 160);
  ctx.fillStyle = '#54321e';
  ctx.fillRect(190, h * 0.74, 200, 30);
  ctx.fillRect(190, h * 0.80, 200, 30);

  // Cobblestone / Earthy ground with warm specular light
  const groundGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
  groundGrad.addColorStop(0, '#3a1f18');
  groundGrad.addColorStop(0.5, '#22110e');
  groundGrad.addColorStop(1, '#110807');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, h * 0.75, w, h * 0.25);
}

/**
 * Draw 3D Pixar Aalu (Potato Character)
 * Features:
 * - Round organic potato body with tactile earthy shading
 * - Emotive Pixar glass eyes with blinks and highlights
 * - Eyebrows showing gratitude/emotion
 * - Lip-sync mouth with teeth and open/closed phoneme shapes
 * - Little boots and straw explorer hat
 */
function drawAaluCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  isSpeaking: boolean,
  viseme: VisemeFrame
) {
  ctx.save();
  ctx.translate(x, y);

  // Natural breathing & talking bounce
  const talkBounce = isSpeaking ? Math.sin(t * 12) * 8 : Math.sin(t * 2) * 4;
  ctx.translate(0, talkBounce);

  // 1. Drop shadow on ground
  ctx.beginPath();
  ctx.ellipse(0, 140, 140, 35, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  // 2. Little Red Boots
  ctx.fillStyle = '#c52828';
  // Left boot
  ctx.beginPath();
  ctx.roundRect(-75, 110, 55, 35, 14);
  ctx.fill();
  // Right boot
  ctx.beginPath();
  ctx.roundRect(20, 110, 55, 35, 14);
  ctx.fill();

  // 3. Potato Body (3D Sphere with organic potato bumps)
  const bodyGrad = ctx.createRadialGradient(-35, -40, 20, 0, 0, 150);
  bodyGrad.addColorStop(0, '#deb078');   // Highlight
  bodyGrad.addColorStop(0.5, '#c28b50'); // Midtone
  bodyGrad.addColorStop(0.85, '#8c5929'); // Shadow
  bodyGrad.addColorStop(1, '#532e0e');    // Rim occlusion

  ctx.beginPath();
  // Slightly asymmetrical cute potato shape
  ctx.ellipse(0, 0, 135, 155, 0.05, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Subtle potato skin texture freckles / spots
  ctx.fillStyle = 'rgba(80, 40, 15, 0.25)';
  ctx.beginPath();
  ctx.arc(-65, -30, 6, 0, Math.PI * 2);
  ctx.arc(75, 40, 8, 0, Math.PI * 2);
  ctx.arc(-40, 70, 7, 0, Math.PI * 2);
  ctx.arc(60, -75, 5, 0, Math.PI * 2);
  ctx.fill();

  // 4. Little Hands (waving emotionally)
  const leftHandY = isSpeaking ? -40 + Math.sin(t * 10) * 15 : -10;
  ctx.fillStyle = '#c28b50';
  ctx.beginPath();
  ctx.arc(-145, leftHandY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(145, 10, 22, 0, Math.PI * 2);
  ctx.fill();

  // 5. Blinking Animation
  const isBlinking = Math.sin(t * 1.5) > 0.96;

  // 6. Pixar Glass Eyes
  const eyeOffsetX = 45;
  const eyeOffsetY = -25;
  const eyeRadius = 32;

  [-eyeOffsetX, eyeOffsetX].forEach((ex) => {
    // Sclera (White)
    ctx.beginPath();
    ctx.ellipse(ex, eyeOffsetY, eyeRadius, eyeRadius * (isBlinking ? 0.1 : 1.15), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#603515';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (!isBlinking) {
      // Big Iris (Warm expressive brown)
      ctx.beginPath();
      ctx.arc(ex + (ex > 0 ? 3 : -3), eyeOffsetY + 2, 17, 0, Math.PI * 2);
      ctx.fillStyle = '#4a2508';
      ctx.fill();

      // Pupil
      ctx.beginPath();
      ctx.arc(ex + (ex > 0 ? 3 : -3), eyeOffsetY + 2, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0502';
      ctx.fill();

      // Pixar Catchlight specular reflection
      ctx.beginPath();
      ctx.arc(ex - 4, eyeOffsetY - 6, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 4, eyeOffsetY + 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 7. Expressive Eyebrows (Tilted upwards for emotional warmth)
  ctx.strokeStyle = '#522b0f';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  // Left brow (angled up emotionally)
  ctx.beginPath();
  ctx.moveTo(-75, -70);
  ctx.quadraticCurveTo(-45, -82, -20, -68);
  ctx.stroke();
  // Right brow
  ctx.beginPath();
  ctx.moveTo(20, -68);
  ctx.quadraticCurveTo(45, -82, 75, -70);
  ctx.stroke();

  // 8. Cute Rosy Cheeks
  ctx.fillStyle = 'rgba(240, 100, 110, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-70, 20, 24, 15, 0, 0, Math.PI * 2);
  ctx.ellipse(70, 20, 24, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // 9. ACCURATE LIP-SYNC MOUTH
  const mouthY = 40;
  const mouthOpen = viseme.openness * 35; // 0 to 35px height
  const mouthW = viseme.width * 55;      // width

  ctx.save();
  ctx.translate(0, mouthY);

  if (viseme.openness < 0.12) {
    // Closed / Friendly smile line
    ctx.strokeStyle = '#4a220b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -5, 24, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else {
    // Open animated mouth with teeth & tongue
    ctx.beginPath();
    ctx.ellipse(0, 0, mouthW, Math.max(8, mouthOpen), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3a0808'; // Dark oral cavity
    ctx.fill();
    ctx.strokeStyle = '#4a220b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Top teeth
    ctx.beginPath();
    ctx.roundRect(-mouthW * 0.6, -mouthOpen * 0.8, mouthW * 1.2, mouthOpen * 0.45, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Cute pink tongue
    ctx.beginPath();
    ctx.arc(0, mouthOpen * 0.45, mouthW * 0.5, 0, Math.PI);
    ctx.fillStyle = '#e86d79';
    ctx.fill();
  }
  ctx.restore();

  // 10. Little Straw Hat on top
  ctx.fillStyle = '#e8c46a';
  ctx.beginPath();
  ctx.ellipse(0, -145, 95, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cf9d40';
  ctx.beginPath();
  ctx.ellipse(0, -160, 50, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hat band
  ctx.fillStyle = '#3a86c8';
  ctx.beginPath();
  ctx.ellipse(0, -148, 52, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw 3D Pixar Aam (Mango Character)
 * Features:
 * - Glossy golden ripe mango body with warm amber/orange peach gradient
 * - Green leaf sprout on top swaying with gentle physics
 * - Wise, grandfatherly/elder brother eyes
 * - Embroidered waistcoat
 * - Lip-sync mouth for deep Urdu voice
 */
function drawAamCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  isSpeaking: boolean,
  viseme: VisemeFrame
) {
  ctx.save();
  ctx.translate(x, y);

  const breathSway = isSpeaking ? Math.sin(t * 8) * 5 : Math.sin(t * 1.5) * 3;
  ctx.translate(0, breathSway);

  // 1. Drop shadow
  ctx.beginPath();
  ctx.ellipse(0, 175, 160, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fill();

  // 2. Mango Body (Teardrop / Curvy Mango Silhouette)
  const mangoGrad = ctx.createRadialGradient(-40, -60, 30, 0, 0, 190);
  mangoGrad.addColorStop(0, '#ffe566');   // Golden ripe yellow
  mangoGrad.addColorStop(0.45, '#f59e0b'); // Warm mango orange
  mangoGrad.addColorStop(0.85, '#dc2626'); // Sunset red blush
  mangoGrad.addColorStop(1, '#7f1d1d');    // Deep rim

  ctx.beginPath();
  ctx.moveTo(0, -170);
  // Curved right mango cheek
  ctx.bezierCurveTo(130, -140, 170, 40, 120, 140);
  // Bottom rounded base
  ctx.bezierCurveTo(70, 180, -70, 180, -120, 140);
  // Curved left contour
  ctx.bezierCurveTo(-160, 40, -120, -140, 0, -170);
  ctx.closePath();
  ctx.fillStyle = mangoGrad;
  ctx.fill();
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 3. Embroidered Royal Waistcoat / Scarf
  ctx.fillStyle = '#1e3a8a'; // Royal blue
  ctx.beginPath();
  ctx.roundRect(-85, 75, 170, 75, 12);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24'; // Gold border
  ctx.lineWidth = 4;
  ctx.stroke();

  // 4. Eyes (Wise, gentle, slightly moist with happiness)
  const isBlinking = Math.sin(t * 1.2) > 0.96;
  const eyeX = 42;
  const eyeY = -40;

  [-eyeX, eyeX].forEach((ex) => {
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, 26, isBlinking ? 3 : 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (!isBlinking) {
      // Warm dark green-brown iris
      ctx.beginPath();
      ctx.arc(ex, eyeY + 1, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#2e4a1a';
      ctx.fill();

      // Pupil
      ctx.beginPath();
      ctx.arc(ex, eyeY + 1, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#080d04';
      ctx.fill();

      // Catchlights
      ctx.beginPath();
      ctx.arc(ex - 3, eyeY - 5, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  });

  // 5. Wise gentle eyebrows
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-65, -80);
  ctx.quadraticCurveTo(-40, -92, -18, -80);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, -80);
  ctx.quadraticCurveTo(40, -92, 65, -80);
  ctx.stroke();

  // 6. ACCURATE LIP-SYNC MOUTH (Aam - Deep male voice)
  const mouthY = 22;
  const mouthOpen = viseme.openness * 32;
  const mouthW = viseme.width * 50;

  ctx.save();
  ctx.translate(0, mouthY);

  if (viseme.openness < 0.12) {
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -6, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, mouthW, Math.max(6, mouthOpen), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#320b0b';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Teeth
    ctx.beginPath();
    ctx.roundRect(-mouthW * 0.5, -mouthOpen * 0.75, mouthW, mouthOpen * 0.4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  ctx.restore();

  // 7. Green Leaf Sprout Hair on Top (Swaying in gentle wind)
  const leafSway = Math.sin(t * 3) * 0.12;
  ctx.save();
  ctx.translate(0, -170);
  ctx.rotate(leafSway);

  // Brown stem
  ctx.strokeStyle = '#5c3d19';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(0, -25);
  ctx.stroke();

  // Vibrant glossy green leaf
  const leafGrad = ctx.createLinearGradient(-30, -70, 30, 0);
  leafGrad.addColorStop(0, '#4ade80');
  leafGrad.addColorStop(1, '#15803d');
  ctx.fillStyle = leafGrad;
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.bezierCurveTo(45, -55, 45, -95, 0, -115);
  ctx.bezierCurveTo(-45, -95, -45, -55, 0, -25);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Atmospheric magical golden dust particles
 */
function drawAtmosphereParticles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = 'rgba(255, 220, 140, 0.45)';
  for (let i = 0; i < 24; i++) {
    const px = (Math.sin(i * 123 + t * 0.3) * 0.5 + 0.5) * w;
    const py = ((i * 85 + t * 40) % h);
    const rad = 2 + (i % 4);
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw Viral YouTube Shorts Subtitles
 * - Dual Language: Urdu Nastaliq Script + Bold English/Roman Urdu
 * - Bouncy Active Word Highlight in Bright Yellow/White with Black Outline
 */
function drawViralSubtitles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dialogue: ShortsDialogueLine,
  activeIdx: number,
  t: number
) {
  ctx.save();

  // Position in center lower third (safe from YouTube Shorts bottom bar)
  const subY = h * 0.73;

  // Background subtle pill
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.beginPath();
  ctx.roundRect(w * 0.08, subY - 140, w * 0.84, 175, 24);
  ctx.fill();

  // 1. Urdu Script Line (Nasta'liq / Arabic typography)
  ctx.font = 'bold 44px "Noto Nastaliq Urdu", serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24'; // Amber gold
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 8;
  ctx.fillText(dialogue.dialogueUrdu, w / 2, subY - 75);

  // 2. Roman Urdu Karaoke Subtitle (Viral Shorts style with active word bounce)
  const words = dialogue.dialogueRomanUrdu.split(' ');
  const totalWords = words.length;

  ctx.font = '900 48px "Montserrat", sans-serif';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'miter';

  // Measure word positions
  const wordWidths = words.map((word) => ctx.measureText(word + ' ').width);
  const totalTextWidth = wordWidths.reduce((a, b) => a + b, 0);
  let currentX = (w - totalTextWidth) / 2;

  words.forEach((word, idx) => {
    const isCurrent = idx === activeIdx;
    const bounceScale = isCurrent ? 1.18 + Math.sin(t * 15) * 0.05 : 1.0;
    const wordWidth = wordWidths[idx];

    ctx.save();
    ctx.translate(currentX + wordWidth / 2, subY - 10);
    ctx.scale(bounceScale, bounceScale);

    // Stroke
    ctx.strokeText(word, -wordWidth / 2, 0);

    // Fill color: Active word is vibrant yellow/cyan, other words are crisp white
    ctx.fillStyle = isCurrent ? '#fde047' : '#ffffff';
    ctx.fillText(word, -wordWidth / 2, 0);

    ctx.restore();
    currentX += wordWidth;
  });

  ctx.restore();
}

/**
 * Draw YouTube Shorts Safe Zones Overlay
 */
function drawSafeZones(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);

  // Top header zone (Shorts search & camera icons)
  ctx.strokeRect(40, 40, w - 80, 160);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
  ctx.fillRect(40, 40, w - 80, 160);

  // Bottom action bar (Comments, subscribe, sound title)
  ctx.strokeRect(40, h - 280, w - 80, 240);
  ctx.fillRect(40, h - 280, w - 80, 240);

  // Right side engagement buttons (Like, dislike, comment, share)
  ctx.strokeRect(w - 180, h * 0.45, 140, 460);
  ctx.fillRect(w - 180, h * 0.45, 140, 460);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YouTube Shorts UI Safe Zone', w / 2, 130);

  ctx.restore();
}
