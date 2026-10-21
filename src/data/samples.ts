import { SampleMedia } from '../types';

export const SAMPLE_IMAGES: Array<{
  id: string;
  title: string;
  imageUrl: string;
  recommendedPrompt: string;
  category: string;
}> = [
  {
    id: 'sample-img-1',
    title: 'Cyberpunk Geisha in Rain',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    recommendedPrompt: 'Raindrops falling gently, neon lights flickering in reflection, slow cinematic camera push in, atmospheric steam rising.',
    category: 'Cyberpunk & Sci-Fi',
  },
  {
    id: 'sample-img-2',
    title: 'Alpine Waterfall & Lake',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    recommendedPrompt: 'Majestic waterfall rushing into crystal turquoise water, mist swirling in the morning light, drone ascending slowly.',
    category: 'Nature & Landscape',
  },
  {
    id: 'sample-img-3',
    title: 'Astronaut on Alien Dunes',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    recommendedPrompt: 'Astronaut turning head toward camera, cosmic dust particles swirling across orange sand dunes, distant nebula pulsing.',
    category: 'Space & Fantasy',
  },
  {
    id: 'sample-img-4',
    title: 'Cherry Blossom Pagoda',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
    recommendedPrompt: 'Pink cherry blossom petals fluttering down through gentle spring breeze, warm golden sunrise illumination, slow dolly right.',
    category: 'Atmospheric',
  },
  {
    id: 'sample-img-5',
    title: 'Bengal Tiger in Mist',
    imageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
    recommendedPrompt: 'Tiger pacing smoothly through misty jungle, breathing visibly in morning fog, intense focused stare, 60fps slow motion.',
    category: 'Wildlife',
  },
  {
    id: 'sample-img-6',
    title: 'Futuristic Sports Car',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    recommendedPrompt: 'Car accelerating down wet highway at twilight, headlamps illuminating asphalt spray, camera tracking alongside door panel.',
    category: 'Vehicles',
  },
];

export const SAMPLE_VIDEOS: SampleMedia[] = [
  {
    id: 'sample-vid-1',
    title: 'Ocean Waves on Black Sand',
    category: 'video-to-video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    prompt: 'Transform into bioluminescent glowing neon blue waves crashing on an alien obsidian beach at midnight.',
    aspectRatio: '16:9',
    duration: '5s',
    description: 'High contrast water motion ideal for restyling & lighting changes.',
  },
  {
    id: 'sample-vid-2',
    title: 'City Traffic Sunset Timelapse',
    category: 'video-to-video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    prompt: 'Change daytime to Blade Runner synthwave style with flying vehicles and holographic advertisements.',
    aspectRatio: '16:9',
    duration: '5s',
    description: 'Urban footage perfect for sci-fi atmosphere transforms.',
  },
];

export const CAMERA_MOVEMENTS = [
  { id: 'dolly-in', name: 'Dolly Push In', desc: 'Smooth forward zoom towards focal subject' },
  { id: 'pan-horizontal', name: 'Cinematic Pan', desc: 'Slow horizontal sweep across the landscape' },
  { id: 'drone-crane', name: 'Drone Aerial', desc: 'Ascending crane lift looking down' },
  { id: 'orbit-360', name: 'Orbit Arc', desc: 'Parallax circular camera rotation around subject' },
  { id: 'slow-mo', name: '60fps Slow Motion', desc: 'Fluid high-framerate temporal dilation' },
  { id: 'fpv-rush', name: 'FPV Flythrough', desc: 'Dynamic energetic camera dive' },
];

export const VISUAL_STYLES = [
  { id: 'photoreal', name: 'Photorealistic 35mm', promptChunk: 'shot on 35mm anamorphic lens, Arri Alexa, photorealistic textures, shallow depth of field' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', promptChunk: 'high contrast neon noir, rain reflections, volumetric smog, chromatic aberration' },
  { id: 'anime', name: 'Makoto Shinkai Anime', promptChunk: 'vibrant anime aesthetic, emotive cloudscapes, hand-painted luminous lighting, pastel grading' },
  { id: 'claymation', name: 'Claymation Stop-Motion', promptChunk: 'tactile clay textures, stop motion 12fps animation feel, handcrafted miniature lighting' },
  { id: 'vintage-film', name: '1970s Vintage Film', promptChunk: 'grainy 16mm kodachrome film stock, warm color bleed, retro nostalgia' },
  { id: 'fantasy-unreal', name: 'Fantasy Unreal Engine 5', promptChunk: 'subsurface scattering, lumen global illumination, magical particle dust, epic fantasy' },
];

export const LIGHTING_PRESETS = [
  { id: 'golden-hour', name: 'Golden Hour Sunset', promptChunk: 'warm horizontal golden hour sunlight, lens flare, glowing dust motes' },
  { id: 'bioluminescent', name: 'Bioluminescent Glow', promptChunk: 'ethereal deep cyan and magenta glowing light sources in darkness' },
  { id: 'moody-noir', name: 'Moody Film Noir', promptChunk: 'harsh chiascuro shadows, venetian blind light slits, dramatic mist' },
  { id: 'studio-rim', name: 'High-Fashion Rim Light', promptChunk: 'clean crisp edge lighting, silhouette separation, dark backdrop' },
];
