// Audio System for Tank Game
import { Position } from '@/types'

// Audio Categories
export enum AudioCategory {
  MASTER = 'master',
  SFX = 'sfx',
  MUSIC = 'music',
  UI = 'ui',
  AMBIENT = 'ambient',
}

// Sound Effect Types
export enum SoundEffect {
  // Weapon Sounds
  CANNON_FIRE = 'cannon_fire',
  MACHINE_GUN_FIRE = 'machine_gun_fire',
  ROCKET_FIRE = 'rocket_fire',
  PLASMA_FIRE = 'plasma_fire',
  SHOTGUN_FIRE = 'shotgun_fire',
  SNIPER_FIRE = 'sniper_fire',
  
  // Impact Sounds
  BULLET_HIT_METAL = 'bullet_hit_metal',
  BULLET_HIT_GROUND = 'bullet_hit_ground',
  EXPLOSION_SMALL = 'explosion_small',
  EXPLOSION_MEDIUM = 'explosion_medium',
  EXPLOSION_LARGE = 'explosion_large',
  
  // Tank Sounds
  ENGINE_IDLE = 'engine_idle',
  ENGINE_MOVING = 'engine_moving',
  TRACK_MOVEMENT = 'track_movement',
  TURRET_ROTATE = 'turret_rotate',
  TANK_DESTROYED = 'tank_destroyed',
  
  // Armor/Damage Sounds
  ARMOR_HIT = 'armor_hit',
  ARMOR_PENETRATE = 'armor_penetrate',
  SHIELD_HIT = 'shield_hit',
  SHIELD_BREAK = 'shield_break',
  SHIELD_RECHARGE = 'shield_recharge',
  
  // UI Sounds
  MENU_CLICK = 'menu_click',
  MENU_HOVER = 'menu_hover',
  WEAPON_SWITCH = 'weapon_switch',
  RELOAD_START = 'reload_start',
  RELOAD_COMPLETE = 'reload_complete',
  
  // Ambient Sounds
  WIND = 'wind',
  DISTANT_BATTLE = 'distant_battle',
  
  // Special Effects
  EMP_BLAST = 'emp_blast',
  REACTIVE_ARMOR = 'reactive_armor',
  ENERGY_CHARGE = 'energy_charge',
}

// Sound Configuration
interface SoundConfig {
  category: AudioCategory
  volume: number
  loop: boolean
  fadeIn?: number
  fadeOut?: number
  randomPitch?: boolean
  pitchRange?: [number, number]
  maxDistance?: number // 3D spatial audio
  cooldown?: number // Minimum time between plays
}

// Sound Library Configuration
const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  // Weapon Sounds
  [SoundEffect.CANNON_FIRE]: {
    category: AudioCategory.SFX,
    volume: 0.8,
    loop: false,
    randomPitch: true,
    pitchRange: [0.9, 1.1],
    maxDistance: 50,
    cooldown: 100
  },
  [SoundEffect.MACHINE_GUN_FIRE]: {
    category: AudioCategory.SFX,
    volume: 0.6,
    loop: false,
    randomPitch: true,
    pitchRange: [0.95, 1.05],
    maxDistance: 30,
    cooldown: 50
  },
  [SoundEffect.ROCKET_FIRE]: {
    category: AudioCategory.SFX,
    volume: 0.9,
    loop: false,
    randomPitch: true,
    pitchRange: [0.8, 1.2],
    maxDistance: 60,
    cooldown: 200
  },
  [SoundEffect.PLASMA_FIRE]: {
    category: AudioCategory.SFX,
    volume: 0.7,
    loop: false,
    randomPitch: true,
    pitchRange: [0.9, 1.1],
    maxDistance: 40,
    cooldown: 100
  },
  [SoundEffect.SHOTGUN_FIRE]: {
    category: AudioCategory.SFX,
    volume: 0.8,
    loop: false,
    randomPitch: true,
    pitchRange: [0.9, 1.1],
    maxDistance: 35,
    cooldown: 150
  },
  [SoundEffect.SNIPER_FIRE]: {
    category: AudioCategory.SFX,
    volume: 0.9,
    loop: false,
    randomPitch: true,
    pitchRange: [0.95, 1.05],
    maxDistance: 80,
    cooldown: 300
  },

  // Impact Sounds
  [SoundEffect.BULLET_HIT_METAL]: {
    category: AudioCategory.SFX,
    volume: 0.5,
    loop: false,
    randomPitch: true,
    pitchRange: [0.8, 1.2],
    maxDistance: 25
  },
  [SoundEffect.BULLET_HIT_GROUND]: {
    category: AudioCategory.SFX,
    volume: 0.4,
    loop: false,
    randomPitch: true,
    pitchRange: [0.9, 1.1],
    maxDistance: 20
  },
  [SoundEffect.EXPLOSION_SMALL]: {
    category: AudioCategory.SFX,
    volume: 0.7,
    loop: false,
    randomPitch: true,
    pitchRange: [0.9, 1.1],
    maxDistance: 40
  },
  [SoundEffect.EXPLOSION_MEDIUM]: {
    category: AudioCategory.SFX,
    volume: 0.8,
    loop: false,
    randomPitch: true,
    pitchRange: [0.8, 1.2],
    maxDistance: 60
  },
  [SoundEffect.EXPLOSION_LARGE]: {
    category: AudioCategory.SFX,
    volume: 1.0,
    loop: false,
    randomPitch: true,
    pitchRange: [0.7, 1.3],
    maxDistance: 100
  },

  // Tank Sounds
  [SoundEffect.ENGINE_IDLE]: {
    category: AudioCategory.SFX,
    volume: 0.3,
    loop: true,
    maxDistance: 15
  },
  [SoundEffect.ENGINE_MOVING]: {
    category: AudioCategory.SFX,
    volume: 0.5,
    loop: true,
    maxDistance: 20
  },
  [SoundEffect.TRACK_MOVEMENT]: {
    category: AudioCategory.SFX,
    volume: 0.4,
    loop: true,
    maxDistance: 15
  },
  [SoundEffect.TURRET_ROTATE]: {
    category: AudioCategory.SFX,
    volume: 0.3,
    loop: false,
    maxDistance: 10
  },
  [SoundEffect.TANK_DESTROYED]: {
    category: AudioCategory.SFX,
    volume: 0.9,
    loop: false,
    maxDistance: 50
  },

  // Armor/Damage Sounds
  [SoundEffect.ARMOR_HIT]: {
    category: AudioCategory.SFX,
    volume: 0.6,
    loop: false,
    randomPitch: true,
    pitchRange: [0.9, 1.1],
    maxDistance: 25
  },
  [SoundEffect.ARMOR_PENETRATE]: {
    category: AudioCategory.SFX,
    volume: 0.7,
    loop: false,
    randomPitch: true,
    pitchRange: [0.8, 1.2],
    maxDistance: 30
  },
  [SoundEffect.SHIELD_HIT]: {
    category: AudioCategory.SFX,
    volume: 0.5,
    loop: false,
    randomPitch: true,
    pitchRange: [0.9, 1.1],
    maxDistance: 20
  },
  [SoundEffect.SHIELD_BREAK]: {
    category: AudioCategory.SFX,
    volume: 0.8,
    loop: false,
    maxDistance: 30
  },
  [SoundEffect.SHIELD_RECHARGE]: {
    category: AudioCategory.SFX,
    volume: 0.4,
    loop: false,
    maxDistance: 15
  },

  // UI Sounds
  [SoundEffect.MENU_CLICK]: {
    category: AudioCategory.UI,
    volume: 0.6,
    loop: false
  },
  [SoundEffect.MENU_HOVER]: {
    category: AudioCategory.UI,
    volume: 0.3,
    loop: false
  },
  [SoundEffect.WEAPON_SWITCH]: {
    category: AudioCategory.UI,
    volume: 0.5,
    loop: false
  },
  [SoundEffect.RELOAD_START]: {
    category: AudioCategory.SFX,
    volume: 0.4,
    loop: false,
    maxDistance: 15
  },
  [SoundEffect.RELOAD_COMPLETE]: {
    category: AudioCategory.SFX,
    volume: 0.5,
    loop: false,
    maxDistance: 15
  },

  // Ambient Sounds
  [SoundEffect.WIND]: {
    category: AudioCategory.AMBIENT,
    volume: 0.2,
    loop: true,
    fadeIn: 2000,
    fadeOut: 2000
  },
  [SoundEffect.DISTANT_BATTLE]: {
    category: AudioCategory.AMBIENT,
    volume: 0.1,
    loop: true,
    fadeIn: 3000,
    fadeOut: 3000
  },

  // Special Effects
  [SoundEffect.EMP_BLAST]: {
    category: AudioCategory.SFX,
    volume: 0.8,
    loop: false,
    maxDistance: 50
  },
  [SoundEffect.REACTIVE_ARMOR]: {
    category: AudioCategory.SFX,
    volume: 0.7,
    loop: false,
    maxDistance: 35
  },
  [SoundEffect.ENERGY_CHARGE]: {
    category: AudioCategory.SFX,
    volume: 0.5,
    loop: false,
    maxDistance: 20
  },
}

// Audio Instance
interface AudioInstance {
  audio: HTMLAudioElement
  config: SoundConfig
  startTime: number
  position?: Position
  isPlaying: boolean
  fadeDirection?: 'in' | 'out'
  targetVolume: number
}

// Main Audio System Class
export class AudioSystem {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private categoryGains: Map<AudioCategory, GainNode> = new Map()
  private audioInstances: Map<string, AudioInstance> = new Map()
  private loadedSounds: Map<SoundEffect, HTMLAudioElement> = new Map()
  private lastPlayTimes: Map<SoundEffect, number> = new Map()
  private listenerPosition: Position = { x: 0, y: 0, z: 0 }
  private enabled = true
  
  // Volume levels for each category
  private volumes: Record<AudioCategory, number> = {
    [AudioCategory.MASTER]: 0.8,
    [AudioCategory.SFX]: 0.9,
    [AudioCategory.MUSIC]: 0.7,
    [AudioCategory.UI]: 0.8,
    [AudioCategory.AMBIENT]: 0.6,
  }

  constructor() {
    this.initializeAudioContext()
    this.loadSounds()
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (this.audioContext.state === 'suspended') {
        // Auto-resume on user interaction
        const resumeAudio = () => {
          this.audioContext?.resume()
          document.removeEventListener('click', resumeAudio)
          document.removeEventListener('keydown', resumeAudio)
        }
        document.addEventListener('click', resumeAudio)
        document.addEventListener('keydown', resumeAudio)
      }

      // Create master gain node
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = this.volumes[AudioCategory.MASTER]

      // Create category gain nodes
      Object.values(AudioCategory).forEach(category => {
        if (this.audioContext && this.masterGain) {
          const gainNode = this.audioContext.createGain()
          gainNode.connect(this.masterGain)
          gainNode.gain.value = this.volumes[category]
          this.categoryGains.set(category, gainNode)
        }
      })

    } catch (error) {
      console.warn('Failed to initialize audio context:', error)
      this.enabled = false
    }
  }

  private async loadSounds() {
    // In a real implementation, you would load actual audio files
    // For now, we'll create dummy audio elements that could be replaced with real files
    Object.entries(SoundEffect).forEach(([_key, effect]) => {
      const audio = new Audio()
      
      // You would set audio.src to the actual file path
      // audio.src = `/sounds/${effect}.mp3`
      
      audio.preload = 'auto'
      audio.volume = 0 // Will be controlled by gain nodes
      
      this.loadedSounds.set(effect, audio)
    })
  }

  // Play a sound effect
  playSound(
    effect: SoundEffect, 
    position?: Position, 
    volumeMultiplier: number = 1,
    pitchMultiplier: number = 1
  ): string | null {
    if (!this.enabled || !this.audioContext) return null

    const config = SOUND_CONFIGS[effect]
    const audio = this.loadedSounds.get(effect)
    
    if (!audio) return null

    // Check cooldown
    const lastPlayTime = this.lastPlayTimes.get(effect) || 0
    const now = Date.now()
    if (config.cooldown && now - lastPlayTime < config.cooldown) {
      return null
    }

    // Create unique instance ID
    const instanceId = `${effect}_${now}_${Math.random()}`

    try {
      // Clone audio for concurrent playback
      const audioClone = audio.cloneNode() as HTMLAudioElement
      
      // Apply pitch variation
      if (config.randomPitch && config.pitchRange) {
        const [min, max] = config.pitchRange
        const randomPitch = min + Math.random() * (max - min)
        audioClone.playbackRate = randomPitch * pitchMultiplier
      } else {
        audioClone.playbackRate = pitchMultiplier
      }

      // Calculate volume based on distance (if 3D)
      let finalVolume = config.volume * volumeMultiplier
      if (position && config.maxDistance) {
        const distance = this.calculateDistance(this.listenerPosition, position)
        const attenuatedVolume = Math.max(0, 1 - (distance / config.maxDistance))
        finalVolume *= attenuatedVolume
      }

      // Create audio instance
      const instance: AudioInstance = {
        audio: audioClone,
        config,
        startTime: now,
        position,
        isPlaying: false,
        targetVolume: finalVolume
      }

      // Set up Web Audio API nodes for better control
      if (this.audioContext) {
        const source = this.audioContext.createMediaElementSource(audioClone)
        const gainNode = this.audioContext.createGain()
        const categoryGain = this.categoryGains.get(config.category)

        if (categoryGain) {
          source.connect(gainNode)
          gainNode.connect(categoryGain)
          gainNode.gain.value = finalVolume
        }
      }

      // Handle fade in
      if (config.fadeIn) {
        audioClone.volume = 0
        this.fadeVolume(instanceId, 0, finalVolume, config.fadeIn)
      } else {
        audioClone.volume = finalVolume
      }

      // Set up event listeners
      audioClone.addEventListener('ended', () => {
        this.audioInstances.delete(instanceId)
      })

      audioClone.addEventListener('error', () => {
        this.audioInstances.delete(instanceId)
      })

      // Store instance
      this.audioInstances.set(instanceId, instance)

      // Play audio
      audioClone.play().then(() => {
        instance.isPlaying = true
      }).catch(error => {
        console.warn(`Failed to play sound ${effect}:`, error)
        this.audioInstances.delete(instanceId)
      })

      // Update last play time
      this.lastPlayTimes.set(effect, now)

      return instanceId

    } catch (error) {
      console.warn(`Error playing sound ${effect}:`, error)
      return null
    }
  }

  // Stop a specific sound instance
  stopSound(instanceId: string, fadeOut: boolean = false) {
    const instance = this.audioInstances.get(instanceId)
    if (!instance) return

    if (fadeOut && instance.config.fadeOut) {
      this.fadeVolume(instanceId, instance.audio.volume, 0, instance.config.fadeOut, () => {
        instance.audio.pause()
        this.audioInstances.delete(instanceId)
      })
    } else {
      instance.audio.pause()
      this.audioInstances.delete(instanceId)
    }
  }

  // Stop all sounds of a specific type
  stopSoundType(effect: SoundEffect, fadeOut: boolean = false) {
    this.audioInstances.forEach((_instance, instanceId) => {
      if (instanceId.startsWith(effect)) {
        this.stopSound(instanceId, fadeOut)
      }
    })
  }

  // Update listener position for 3D audio
  updateListenerPosition(position: Position) {
    this.listenerPosition = position
    
    // Update volumes for all 3D sounds
    this.audioInstances.forEach((instance, _instanceId) => {
      if (instance.position && instance.config.maxDistance) {
        const distance = this.calculateDistance(position, instance.position)
        const attenuatedVolume = Math.max(0, 1 - (distance / instance.config.maxDistance))
        const newVolume = instance.targetVolume * attenuatedVolume
        
        instance.audio.volume = newVolume
      }
    })
  }

  // Set volume for a category
  setVolume(category: AudioCategory, volume: number) {
    this.volumes[category] = Math.max(0, Math.min(1, volume))
    
    const gainNode = this.categoryGains.get(category)
    if (gainNode) {
      gainNode.gain.value = this.volumes[category]
    }
  }

  // Get volume for a category
  getVolume(category: AudioCategory): number {
    return this.volumes[category]
  }

  // Fade volume of a specific instance
  private fadeVolume(
    instanceId: string, 
    fromVolume: number, 
    toVolume: number, 
    duration: number,
    onComplete?: () => void
  ) {
    const instance = this.audioInstances.get(instanceId)
    if (!instance) return

    const startTime = Date.now()
    const volumeDiff = toVolume - fromVolume

    const fade = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      
      const currentVolume = fromVolume + (volumeDiff * progress)
      instance.audio.volume = currentVolume

      if (progress < 1) {
        requestAnimationFrame(fade)
      } else if (onComplete) {
        onComplete()
      }
    }

    requestAnimationFrame(fade)
  }

  // Calculate distance between two positions
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    const dz = pos1.z - pos2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  // Enable/disable audio system
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    
    if (!enabled) {
      // Stop all sounds
      this.audioInstances.forEach((_, instanceId) => {
        this.stopSound(instanceId)
      })
    }
  }

  // Get system status
  getStatus() {
    return {
      enabled: this.enabled,
      audioContext: !!this.audioContext,
      activeSounds: this.audioInstances.size,
      volumes: { ...this.volumes }
    }
  }
}

// Global audio system instance
export const audioSystem = new AudioSystem()

export default {
  AudioSystem,
  AudioCategory,
  SoundEffect,
  audioSystem
}