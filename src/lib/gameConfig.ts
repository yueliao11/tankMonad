import { GameConfig } from '@/types'

export const GAME_CONFIG: GameConfig = {
  // Player settings
  PLAYER_SPEED: 5,
  PLAYER_HEALTH: 100,
  PLAYER_MAX_HEALTH: 100,
  
  // Bullet settings
  BULLET_SPEED: 20,
  BULLET_DAMAGE: 10, // -10HP bullet damage as requested
  BULLET_LIFESPAN: 3000, // 3 seconds in milliseconds
  
  // Monster settings
  MONSTER_SPEED: 2,
  MONSTER_HEALTH: 50,
  MONSTER_DAMAGE: 15,
  MONSTER_COUNT: 10,
  
  // Combat settings
  SHOOT_COOLDOWN: 500, // 500ms between shots
  
  // Map settings
  MAP_SIZE: 100, // 100x100 units
  
  // Game settings
  ROUND_SECONDS: 180, // 3 minutes round duration
  GAME_DURATION: 180000, // 3 minutes in milliseconds (deprecated - use ROUND_SECONDS)
}

// MultiSynq Configuration
export const MULTISYNQ_CONFIG = {
  apiKey: import.meta.env.VITE_MULTISYNQ_API_KEY || '',
  appId: 'io.monad.tankbattle',
  // Session will be auto-generated or can be set manually
}

// Physics Constants
export const PHYSICS = {
  GRAVITY: -9.81,
  TANK_MASS: 1000,
  BULLET_MASS: 1,
  FRICTION: 0.95,
  RESTITUTION: 0.3,
  COLLISION_GROUPS: {
    PLAYER: 1,
    MONSTER: 2,
    BULLET: 4,
    TERRAIN: 8,
  }
}

// Visual Constants
export const VISUALS = {
  FOG_NEAR: 50,
  FOG_FAR: 150,
  SHADOW_MAP_SIZE: 2048,
  CAMERA_HEIGHT: 10,
  CAMERA_DISTANCE: 15,
  PARTICLE_COUNT: 100,
}

// Colors
export const COLORS = {
  TANK_COLORS: [
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#45b7d1', // Blue
    '#f9ca24', // Yellow
    '#f0932b', // Orange
    '#eb4d4b', // Dark Red
    '#6c5ce7', // Purple
    '#2ed573', // Green
    '#ffa502', // Amber
    '#3742fa', // Indigo
  ],
  MONSTER_COLOR: '#8b5a3c', // Brown
  BULLET_COLOR: '#ffd700', // Gold
  TERRAIN_COLOR: '#4a5d23', // Olive
  SKY_COLOR: '#87ceeb', // Sky Blue
}

// AI Constants
export const AI = {
  MONSTER_DETECTION_RADIUS: 15,
  MONSTER_ATTACK_RANGE: 3,
  MONSTER_WANDER_RADIUS: 20,
  MONSTER_DIRECTION_CHANGE_INTERVAL: 3000, // 3 seconds
  MONSTER_ATTACK_COOLDOWN: 1500, // 1.5 seconds
  MONSTER_CHASE_SPEED_MULTIPLIER: 1.5,
}

// Network Constants
export const NETWORK = {
  TICK_RATE: 20, // 20 FPS for physics simulation
  TICK_MS: 50, // 50ms per tick (20 FPS)
  INTERPOLATION_RATE: 60, // 60 FPS for visual interpolation
  LAG_COMPENSATION: 100, // 100ms lag compensation
  HEARTBEAT_INTERVAL: 5000, // 5 seconds
}

// Terrain Configuration
export const TERRAIN = [
  // Simple rectangular obstacles - can be replaced with Tiled JSON
  { x: 20, y: 20, width: 10, height: 10 }, // Top-left obstacle
  { x: -30, y: -20, width: 15, height: 8 }, // Bottom-left obstacle  
  { x: 25, y: -25, width: 12, height: 12 }, // Bottom-right obstacle
  { x: -25, y: 30, width: 8, height: 15 }, // Top-right obstacle
]

// Game States
export const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing', 
  FINISHED: 'finished',
  RESULTS: 'results',
} as const

export default {
  GAME_CONFIG,
  MULTISYNQ_CONFIG,
  PHYSICS,
  VISUALS,
  COLORS,
  AI,
  NETWORK,
}