import { Position } from '@/types'

// Armor Types
export enum ArmorType {
  LIGHT = 'light',           // Fast but fragile
  MEDIUM = 'medium',         // Balanced
  HEAVY = 'heavy',           // Slow but tough
  REACTIVE = 'reactive',     // Explosive reactive armor
  COMPOSITE = 'composite',   // Advanced layered armor
  ENERGY = 'energy',         // Energy shields
}

// Damage Types
export enum DamageType {
  KINETIC = 'kinetic',       // Standard projectiles
  EXPLOSIVE = 'explosive',   // Splash damage
  THERMAL = 'thermal',       // Fire/heat damage
  ELECTRIC = 'electric',     // EMP damage
  PLASMA = 'plasma',         // Energy damage
  PIERCING = 'piercing',     // Armor-piercing rounds
}

// Hit Location
export enum HitLocation {
  FRONT = 'front',
  BACK = 'back',
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom',
}

// Armor Configuration
export interface ArmorConfig {
  type: ArmorType
  name: string
  
  // Basic Stats
  maxHealth: number
  armorThickness: number
  
  // Resistance percentages (0-100)
  kineticResistance: number
  explosiveResistance: number
  thermalResistance: number
  electricResistance: number
  plasmaResistance: number
  piercingResistance: number
  
  // Special Properties
  regeneration: number        // Health per second
  energyShield: number       // Energy shield capacity
  shieldRegenRate: number    // Shield regen per second
  shieldRegenDelay: number   // Delay before shield starts regenerating
  
  // Movement Penalties
  speedPenalty: number       // Movement speed multiplier (0-1)
  turnPenalty: number        // Turn rate multiplier (0-1)
  
  // Special Abilities
  abilities: ArmorAbility[]
  
  // Visual
  color: string
  thickness: number          // Visual thickness
}

// Armor Abilities
export interface ArmorAbility {
  type: 'reactive' | 'adaptive' | 'stealth' | 'repair' | 'overcharge'
  cooldown: number
  duration: number
  effect: any
}

// Damage Instance
export interface DamageInstance {
  amount: number
  type: DamageType
  penetration: number
  hitLocation: HitLocation
  position: Position
  timestamp: number
  sourceId: string
  weaponType?: string
}

// Armor Presets
export const ARMOR_CONFIGS: Record<ArmorType, ArmorConfig> = {
  [ArmorType.LIGHT]: {
    type: ArmorType.LIGHT,
    name: 'Light Armor',
    maxHealth: 80,
    armorThickness: 15,
    
    kineticResistance: 10,
    explosiveResistance: 5,
    thermalResistance: 15,
    electricResistance: 20,
    plasmaResistance: 10,
    piercingResistance: 5,
    
    regeneration: 2,
    energyShield: 0,
    shieldRegenRate: 0,
    shieldRegenDelay: 0,
    
    speedPenalty: 1.0,
    turnPenalty: 1.0,
    
    abilities: [],
    
    color: '#4CAF50',
    thickness: 0.8
  },

  [ArmorType.MEDIUM]: {
    type: ArmorType.MEDIUM,
    name: 'Medium Armor',
    maxHealth: 120,
    armorThickness: 25,
    
    kineticResistance: 25,
    explosiveResistance: 20,
    thermalResistance: 20,
    electricResistance: 15,
    plasmaResistance: 20,
    piercingResistance: 15,
    
    regeneration: 1,
    energyShield: 0,
    shieldRegenRate: 0,
    shieldRegenDelay: 0,
    
    speedPenalty: 0.9,
    turnPenalty: 0.95,
    
    abilities: [],
    
    color: '#FF9800',
    thickness: 1.0
  },

  [ArmorType.HEAVY]: {
    type: ArmorType.HEAVY,
    name: 'Heavy Armor',
    maxHealth: 180,
    armorThickness: 40,
    
    kineticResistance: 40,
    explosiveResistance: 35,
    thermalResistance: 30,
    electricResistance: 25,
    plasmaResistance: 30,
    piercingResistance: 25,
    
    regeneration: 0.5,
    energyShield: 0,
    shieldRegenRate: 0,
    shieldRegenDelay: 0,
    
    speedPenalty: 0.7,
    turnPenalty: 0.8,
    
    abilities: [],
    
    color: '#9E9E9E',
    thickness: 1.5
  },

  [ArmorType.REACTIVE]: {
    type: ArmorType.REACTIVE,
    name: 'Reactive Armor',
    maxHealth: 100,
    armorThickness: 30,
    
    kineticResistance: 30,
    explosiveResistance: 60, // Strong against explosives
    thermalResistance: 25,
    electricResistance: 20,
    plasmaResistance: 25,
    piercingResistance: 35,
    
    regeneration: 1,
    energyShield: 0,
    shieldRegenRate: 0,
    shieldRegenDelay: 0,
    
    speedPenalty: 0.85,
    turnPenalty: 0.9,
    
    abilities: [
      {
        type: 'reactive',
        cooldown: 5000,
        duration: 0,
        effect: { explosionRadius: 3, explosionDamage: 30 }
      }
    ],
    
    color: '#F44336',
    thickness: 1.2
  },

  [ArmorType.COMPOSITE]: {
    type: ArmorType.COMPOSITE,
    name: 'Composite Armor',
    maxHealth: 150,
    armorThickness: 35,
    
    kineticResistance: 35,
    explosiveResistance: 30,
    thermalResistance: 40,
    electricResistance: 35,
    plasmaResistance: 45,
    piercingResistance: 40,
    
    regeneration: 1.5,
    energyShield: 0,
    shieldRegenRate: 0,
    shieldRegenDelay: 0,
    
    speedPenalty: 0.8,
    turnPenalty: 0.85,
    
    abilities: [
      {
        type: 'adaptive',
        cooldown: 10000,
        duration: 5000,
        effect: { resistanceBonus: 25 }
      }
    ],
    
    color: '#3F51B5',
    thickness: 1.3
  },

  [ArmorType.ENERGY]: {
    type: ArmorType.ENERGY,
    name: 'Energy Shields',
    maxHealth: 90,
    armorThickness: 20,
    
    kineticResistance: 15,
    explosiveResistance: 20,
    thermalResistance: 50,
    electricResistance: 10, // Weak to electric
    plasmaResistance: 60,
    piercingResistance: 20,
    
    regeneration: 3,
    energyShield: 60,
    shieldRegenRate: 8,
    shieldRegenDelay: 3000,
    
    speedPenalty: 0.95,
    turnPenalty: 1.0,
    
    abilities: [
      {
        type: 'overcharge',
        cooldown: 15000,
        duration: 8000,
        effect: { shieldBoost: 100, regenBoost: 5 }
      }
    ],
    
    color: '#00BCD4',
    thickness: 0.9
  }
}

// Hit Location Modifiers
const HIT_LOCATION_MODIFIERS: Record<HitLocation, number> = {
  [HitLocation.FRONT]: 1.0,    // Standard damage
  [HitLocation.BACK]: 1.5,     // Rear armor is weaker
  [HitLocation.LEFT]: 1.1,     // Side armor
  [HitLocation.RIGHT]: 1.1,    // Side armor
  [HitLocation.TOP]: 1.3,      // Top armor is thinner
  [HitLocation.BOTTOM]: 0.8,   // Bottom has tracks/engine
}

// Armor System Class
export class ArmorSystem {
  public config: ArmorConfig
  public currentHealth: number
  public currentShield: number
  public lastDamageTime: number
  public damageTaken: DamageInstance[]
  public abilities: Map<string, { lastUsed: number; active: boolean; endTime: number }>
  public adaptiveResistances: Record<DamageType, number>

  constructor(armorType: ArmorType = ArmorType.MEDIUM) {
    this.config = { ...ARMOR_CONFIGS[armorType] }
    this.currentHealth = this.config.maxHealth
    this.currentShield = this.config.energyShield
    this.lastDamageTime = 0
    this.damageTaken = []
    this.abilities = new Map()
    this.adaptiveResistances = {
      [DamageType.KINETIC]: 0,
      [DamageType.EXPLOSIVE]: 0,
      [DamageType.THERMAL]: 0,
      [DamageType.ELECTRIC]: 0,
      [DamageType.PLASMA]: 0,
      [DamageType.PIERCING]: 0,
    }

    // Initialize abilities
    this.config.abilities.forEach(ability => {
      this.abilities.set(ability.type, {
        lastUsed: 0,
        active: false,
        endTime: 0
      })
    })
  }

  // Take damage with full armor calculation
  takeDamage(damage: DamageInstance): {
    actualDamage: number
    shieldDamage: number
    healthDamage: number
    penetrated: boolean
    deflected: boolean
    special: string[]
  } {
    const currentTime = Date.now()
    this.lastDamageTime = currentTime

    // Calculate hit location modifier
    const locationModifier = HIT_LOCATION_MODIFIERS[damage.hitLocation]
    
    // Get resistance for this damage type
    const baseResistance = this.getResistance(damage.type)
    const adaptiveBonus = this.adaptiveResistances[damage.type]
    const totalResistance = Math.min(90, baseResistance + adaptiveBonus)

    // Check penetration
    const effectiveArmor = this.config.armorThickness / locationModifier
    const penetrationChance = Math.min(0.95, damage.penetration / effectiveArmor)
    const penetrated = Math.random() < penetrationChance

    let finalDamage = damage.amount * locationModifier
    let deflected = false

    if (!penetrated) {
      // Damage is reduced by armor
      finalDamage *= (100 - totalResistance) / 100
      if (finalDamage < damage.amount * 0.1) {
        deflected = true
        finalDamage = 0
      }
    }

    // Special effects
    const special: string[] = []

    // Apply damage to shield first
    let shieldDamage = 0
    let healthDamage = 0

    if (this.currentShield > 0) {
      shieldDamage = Math.min(finalDamage, this.currentShield)
      this.currentShield -= shieldDamage
      finalDamage -= shieldDamage
    }

    // Apply remaining damage to health
    if (finalDamage > 0) {
      healthDamage = finalDamage
      this.currentHealth = Math.max(0, this.currentHealth - healthDamage)
    }

    // Trigger armor abilities
    this.triggerArmorAbilities(damage, currentTime, special)

    // Update adaptive resistances
    this.updateAdaptiveResistances(damage.type)

    // Store damage for analysis
    this.damageTaken.push({ ...damage, timestamp: currentTime })
    if (this.damageTaken.length > 20) {
      this.damageTaken.shift() // Keep only recent damage
    }

    return {
      actualDamage: shieldDamage + healthDamage,
      shieldDamage,
      healthDamage,
      penetrated,
      deflected,
      special
    }
  }

  private getResistance(damageType: DamageType): number {
    switch (damageType) {
      case DamageType.KINETIC: return this.config.kineticResistance
      case DamageType.EXPLOSIVE: return this.config.explosiveResistance
      case DamageType.THERMAL: return this.config.thermalResistance
      case DamageType.ELECTRIC: return this.config.electricResistance
      case DamageType.PLASMA: return this.config.plasmaResistance
      case DamageType.PIERCING: return this.config.piercingResistance
      default: return 0
    }
  }

  private triggerArmorAbilities(damage: DamageInstance, currentTime: number, special: string[]) {
    for (const ability of this.config.abilities) {
      const abilityState = this.abilities.get(ability.type)
      if (!abilityState) continue

      const canTrigger = currentTime - abilityState.lastUsed > ability.cooldown

      switch (ability.type) {
        case 'reactive':
          if (canTrigger && damage.type === DamageType.EXPLOSIVE) {
            // Reactive armor explodes outward
            special.push(`Reactive armor detonated! (${ability.effect.explosionDamage} damage in ${ability.effect.explosionRadius}m radius)`)
            abilityState.lastUsed = currentTime
          }
          break

        case 'adaptive':
          if (canTrigger && this.currentHealth < this.config.maxHealth * 0.5) {
            // Adaptive armor increases resistance
            special.push('Adaptive armor activated! (+25% resistance for 5s)')
            abilityState.lastUsed = currentTime
            abilityState.active = true
            abilityState.endTime = currentTime + ability.duration
          }
          break

        case 'stealth':
          if (canTrigger && this.currentHealth < this.config.maxHealth * 0.3) {
            special.push('Stealth systems activated!')
            abilityState.lastUsed = currentTime
            abilityState.active = true
            abilityState.endTime = currentTime + ability.duration
          }
          break
      }
    }
  }

  private updateAdaptiveResistances(damageType: DamageType) {
    // Gradually build resistance to frequently used damage types
    this.adaptiveResistances[damageType] = Math.min(20, this.adaptiveResistances[damageType] + 0.5)
    
    // Decay other resistances slightly
    Object.keys(this.adaptiveResistances).forEach(type => {
      if (type !== damageType) {
        this.adaptiveResistances[type as DamageType] = Math.max(0, this.adaptiveResistances[type as DamageType] - 0.1)
      }
    })
  }

  // Update armor system (regeneration, shields, abilities)
  update(deltaTime: number) {
    const currentTime = Date.now()
    
    // Health regeneration
    if (this.config.regeneration > 0) {
      const regenAmount = this.config.regeneration * (deltaTime / 1000)
      this.currentHealth = Math.min(this.config.maxHealth, this.currentHealth + regenAmount)
    }

    // Shield regeneration
    if (this.config.energyShield > 0) {
      const timeSinceLastDamage = currentTime - this.lastDamageTime
      if (timeSinceLastDamage > this.config.shieldRegenDelay) {
        const regenAmount = this.config.shieldRegenRate * (deltaTime / 1000)
        this.currentShield = Math.min(this.config.energyShield, this.currentShield + regenAmount)
      }
    }

    // Update abilities
    this.abilities.forEach((state, _type) => {
      if (state.active && currentTime > state.endTime) {
        state.active = false
      }
    })
  }

  // Get current armor status
  getStatus() {
    return {
      health: this.currentHealth,
      maxHealth: this.config.maxHealth,
      healthPercent: (this.currentHealth / this.config.maxHealth) * 100,
      shield: this.currentShield,
      maxShield: this.config.energyShield,
      shieldPercent: this.config.energyShield > 0 ? (this.currentShield / this.config.energyShield) * 100 : 0,
      isAlive: this.currentHealth > 0,
      armorType: this.config.type,
      armorName: this.config.name,
      abilities: Array.from(this.abilities.entries()).map(([type, state]) => ({
        type,
        ready: Date.now() - state.lastUsed > (this.config.abilities.find(a => a.type === type)?.cooldown || 0),
        active: state.active,
        cooldownRemaining: Math.max(0, (this.config.abilities.find(a => a.type === type)?.cooldown || 0) - (Date.now() - state.lastUsed))
      }))
    }
  }

  // Determine hit location based on angle and position
  static determineHitLocation(
    targetPosition: Position,
    targetRotation: number,
    impactPosition: Position
  ): HitLocation {
    // Calculate relative angle of impact
    const dx = impactPosition.x - targetPosition.x
    const dz = impactPosition.z - targetPosition.z
    const impactAngle = Math.atan2(dx, dz)
    
    // Normalize the angle relative to target's facing direction
    let relativeAngle = impactAngle - targetRotation
    while (relativeAngle < 0) relativeAngle += Math.PI * 2
    while (relativeAngle > Math.PI * 2) relativeAngle -= Math.PI * 2

    // Determine hit location based on angle
    if (relativeAngle < Math.PI / 4 || relativeAngle > (7 * Math.PI) / 4) {
      return HitLocation.FRONT
    } else if (relativeAngle < (3 * Math.PI) / 4) {
      return HitLocation.RIGHT
    } else if (relativeAngle < (5 * Math.PI) / 4) {
      return HitLocation.BACK
    } else {
      return HitLocation.LEFT
    }
  }

  // Manually activate an ability (if available)
  activateAbility(abilityType: string): boolean {
    const ability = this.config.abilities.find(a => a.type === abilityType)
    const state = this.abilities.get(abilityType)
    
    if (!ability || !state) return false
    
    const currentTime = Date.now()
    const canActivate = currentTime - state.lastUsed > ability.cooldown && !state.active
    
    if (canActivate) {
      state.lastUsed = currentTime
      state.active = true
      state.endTime = currentTime + ability.duration
      return true
    }
    
    return false
  }
}

export default {
  ArmorType,
  DamageType,
  HitLocation,
  ARMOR_CONFIGS,
  ArmorSystem
}