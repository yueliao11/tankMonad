import { Vector3 } from 'three'

// Game Types
export interface Position {
  x: number
  y: number
  z: number
}

export interface GameState {
  // Round system state
  gameState?: string
  roundStartTime?: number
  roundDuration?: number
  roundTimeRemaining?: number
  champion?: string
  finalLeaderboard?: LeaderboardEntry[]
  
  // Legacy compatibility
  isActive: boolean
  startTime: number
  duration: number // 3 minutes = 180000ms
  
  // Entity collections
  players: Map<string, Player>
  monsters: Map<string, Monster>
  bullets: Map<string, Bullet>
  leaderboard: LeaderboardEntry[]
}

export interface Player {
  id: string
  viewId: string
  address: string
  position: Position
  rotation: number
  health: number
  maxHealth: number
  score: number
  color: string
  isAlive: boolean
  lastShot: number
  kills?: number
  inputsLocked?: boolean
}

export interface Monster {
  id: string
  position: Position
  rotation: number
  health: number
  maxHealth: number
  state: 'idle' | 'chasing' | 'attacking'
  target?: string // player id
  lastAttack: number
  aiData: {
    wanderDirection: number
    lastDirectionChange: number
    detectionRadius: number
    attackRange: number
  }
}

export interface Bullet {
  id: string
  ownerId: string
  position: Position
  velocity: Vector3
  damage: number
  createdAt: number
  lifespan: number
}

export interface LeaderboardEntry {
  address: string
  score: number
  isAlive: boolean
  kills?: number
}

// MultiSynq Types
export interface MultiSynqConfig {
  apiKey: string
  appId: string
  name?: string
  password?: string
}

export interface ViewData {
  address: string
  color: string
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  address?: string
  error?: string
}

// Game Config
export interface GameConfig {
  PLAYER_SPEED: number
  PLAYER_HEALTH: number
  PLAYER_MAX_HEALTH: number
  BULLET_SPEED: number
  BULLET_DAMAGE: number
  BULLET_LIFESPAN: number
  MONSTER_SPEED: number
  MONSTER_HEALTH: number
  MONSTER_DAMAGE: number
  MONSTER_COUNT: number
  SHOOT_COOLDOWN: number
  MAP_SIZE: number
  ROUND_SECONDS: number
  GAME_DURATION: number // Legacy compatibility
}

// UI Types
export interface HUDData {
  health: number
  maxHealth: number
  score: number
  kills?: number
  timeRemaining: number
  roundTimeRemaining?: number
  monstersRemaining: number
  playersOnline: number
  gameState?: string
  champion?: string
}

// Input Types
export interface InputState {
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  shoot: boolean
  mouseX: number
  mouseY: number
}

// Network Types
export interface NetworkMessage {
  type: 'player-input' | 'player-hit' | 'monster-hit' | 'bullet-fired'
  data: any
  timestamp: number
}