/**
 * Hyper-Realistic Scene Environments Library for Storybook Studio
 *
 * Defines 8 rich procedural children's book environments with multi-layer atmospheres,
 * time-of-day lighting palettes, weather particle presets, and spread layouts.
 */

export const SCENE_ENVIRONMENTS = [
  {
    id: 'cosmic_nebula',
    name: 'Starlight Cosmos & Nebula',
    subtitle:
      'Deep space galaxy with orbiting ringed gas giant, shooting comets, and glowing nebula clouds',
    category: 'space',
    badge: 'Cosmic Quest',
    palette: ['#030712', '#1e1b4b', '#4338ca', '#38bdf8'],
    particles: 'stars',
    defaultTimeOfDay: 'midnight',
    accentColor: '#38bdf8',
    description:
      'Drift through interstellar gas clouds, luminous constellations, and orbiting ringed planets.',
  },
  {
    id: 'enchanted_forest',
    name: 'Enchanted Whispering Woods',
    subtitle:
      'Ancient fairy forest with sunbeams streaming through canopy, mossy oak hollows, and floating fireflies',
    category: 'fantasy',
    badge: 'Fairytale Woods',
    palette: ['#052e16', '#14532d', '#166534', '#ca8a04'],
    particles: 'fireflies',
    defaultTimeOfDay: 'twilight',
    accentColor: '#4ade80',
    description:
      'Ancient hollow oak trees, bioluminescent mushrooms, and magical glowing fireflies.',
  },
  {
    id: 'jurassic_valley',
    name: 'Prehistoric Valley & Waterfalls',
    subtitle:
      'Lush misty dinosaur valley with cascading waterfalls, volcanic peaks, and giant ferns',
    category: 'adventure',
    badge: 'Dino Sanctuary',
    palette: ['#143823', '#2d5a27', '#785923', '#eab308'],
    particles: 'spores',
    defaultTimeOfDay: 'golden_hour',
    accentColor: '#eab308',
    description:
      'Towering volcanic peaks, twin waterfalls, lush cycads, and soaring pterodactyl silhouettes.',
  },
  {
    id: 'neon_metropolis',
    name: 'Cyberpunk Sneaker Sky City',
    subtitle:
      'Futuristic skyline with soaring holographic towers, hovering airships, and neon cloudscapes',
    category: 'city',
    badge: 'Future City',
    palette: ['#090d16', '#1e1b4b', '#0891b2', '#ec4899'],
    particles: 'dust',
    defaultTimeOfDay: 'midnight',
    accentColor: '#f43f5e',
    description:
      'Gleaming holographic towers, sneaker airships cruising sky-lanes, and vibrant neon beams.',
  },
  {
    id: 'coral_kingdom',
    name: 'Deep Ocean Mermaid Reef',
    subtitle:
      'Turquoise undersea world with dancing light caustics, vibrant coral shelves, and glowing jellyfish',
    category: 'ocean',
    badge: 'Coral Kingdom',
    palette: ['#082f49', '#0e7490', '#06b6d4', '#67e8f9'],
    particles: 'bubbles',
    defaultTimeOfDay: 'day',
    accentColor: '#06b6d4',
    description:
      'Sunlight rays dancing through clear ocean waters, swaying kelp, and bioluminescent jellyfish.',
  },
  {
    id: 'dreamland_castle',
    name: 'Bedtime Cloud Kingdom & Moon',
    subtitle:
      'Cozy twilight dreamland with fluffy pastel clouds, smiling golden crescent moon, and castle turrets',
    category: 'bedtime',
    badge: 'Dreamland',
    palette: ['#1e1b4b', '#3b0764', '#701a75', '#fde047'],
    particles: 'stardust',
    defaultTimeOfDay: 'twilight',
    accentColor: '#fde047',
    description:
      'Fluffy cloud pillows, a sleeping golden crescent moon, and hanging brass starlight lanterns.',
  },
  {
    id: 'rainbow_meadow',
    name: 'Sunlit Meadow & Rainbow Haven',
    subtitle:
      'Cheerful fantasy landscape with vibrant 7-color rainbow arch, rolling emerald hills, and butterflies',
    category: 'fantasy',
    badge: 'Rainbow Haven',
    palette: ['#0284c7', '#38bdf8', '#22c55e', '#facc15'],
    particles: 'pollen',
    defaultTimeOfDay: 'day',
    accentColor: '#22c55e',
    description:
      'A glowing 7-color rainbow arch spanning rolling emerald hills, wildflowers, and fluttering butterflies.',
  },
  {
    id: 'winter_aurora',
    name: 'Frost Peak & Northern Lights',
    subtitle:
      'Crystalline arctic landscape with waving emerald and violet Aurora Borealis, snow pines, and falling flakes',
    category: 'winter',
    badge: 'Arctic Aurora',
    palette: ['#022c22', '#064e3b', '#047857', '#10b981'],
    particles: 'snow',
    defaultTimeOfDay: 'midnight',
    accentColor: '#10b981',
    description:
      'Shimmering Northern Lights ribbons in emerald and violet over snow-capped firs and gentle snowflakes.',
  },
];

export const TIME_OF_DAY_OPTIONS = [
  {
    id: 'day',
    label: 'Morning Sun',
    tint: 'rgba(255, 247, 237, 0.12)',
    brightness: 1.05,
  },
  {
    id: 'golden_hour',
    label: 'Golden Sunset',
    tint: 'rgba(245, 158, 11, 0.22)',
    brightness: 1.0,
  },
  {
    id: 'twilight',
    label: 'Twilight Dusk',
    tint: 'rgba(99, 102, 241, 0.22)',
    brightness: 0.88,
  },
  {
    id: 'midnight',
    label: 'Starry Night',
    tint: 'rgba(15, 23, 42, 0.38)',
    brightness: 0.76,
  },
];

export const WEATHER_EFFECT_OPTIONS = [
  { id: 'none', label: 'Clear Atmosphere', icon: 'clear' },
  { id: 'fireflies', label: 'Floating Fireflies', icon: 'fireflies' },
  { id: 'stars', label: 'Twinkling Stardust', icon: 'stars' },
  { id: 'bubbles', label: 'Rising Ocean Bubbles', icon: 'bubbles' },
  { id: 'snow', label: 'Gentle Snowfall', icon: 'snow' },
  { id: 'sunbeams', label: 'Radiant Sunbeams', icon: 'sunbeams' },
];

/**
 * Get scene configuration by ID with fallback
 */
export function getSceneById(sceneId) {
  return (
    SCENE_ENVIRONMENTS.find((s) => s.id === sceneId) || SCENE_ENVIRONMENTS[0]
  );
}

/**
 * Map high-level book themes to default scene environments
 */
export function getDefaultSceneForTheme(theme) {
  switch (theme) {
    case 'space':
      return 'cosmic_nebula';
    case 'magic':
      return 'enchanted_forest';
    case 'sneaker':
      return 'neon_metropolis';
    case 'dino':
      return 'jurassic_valley';
    default:
      return 'cosmic_nebula';
  }
}
