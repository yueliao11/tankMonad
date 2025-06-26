import * as THREE from 'three'
import { Position } from '@/types'

// Weapon Types
export enum WeaponType {
  CANNON = 'cannon',           // Standard tank cannon
  MACHINE_GUN = 'machineGun',  // Rapid fire, low damage
  ROCKET = 'rocket',           // High damage, splash damage
  PLASMA = 'plasma',           // Energy weapon, piercing
  SHOTGUN = 'shotgun',         // Multiple projectiles
  SNIPER = 'sniper',           // High damage, long range
}

// Ammunition Types
export enum AmmoType {
  STANDARD = 'standard',       // Basic ammunition
  ARMOR_PIERCING = 'ap',       // High penetration, less splash
  HIGH_EXPLOSIVE = 'he',       // High splash damage
  INCENDIARY = 'incendiary',   // Fire damage over time
  EMP = 'emp',                 // Disable electronics
  CLUSTER = 'cluster',         // Splits into multiple projectiles
}

// Weapon Configuration
export interface WeaponConfig {
  type: WeaponType
  name: string
  damage: number
  range: number
  fireRate: number // shots per second
  reloadTime: number // milliseconds
  magazineSize: number
  ammoType: AmmoType
  projectileSpeed: number
  splashRadius: number
  penetration: number // armor penetration value
  spread: number // accuracy spread in degrees
  weight: number // affects tank mobility
  energyCost: number // energy per shot
  soundEffect: string
  visualEffect: string
}

// Projectile Interface
export interface Projectile {
  id: string
  weaponType: WeaponType
  ammoType: AmmoType
  ownerId: string
  position: Position
  velocity: THREE.Vector3
  damage: number
  splashRadius: number
  penetration: number
  createdAt: number
  lifespan: number
  hasExploded: boolean
  trail: Position[] // For visual effects
  specialEffects?: {
    fire?: { duration: number; tickDamage: number }
    emp?: { duration: number; disableTime: number }
    cluster?: { count: number; spread: number }
  }
}

// Weapon Definitions
export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  [WeaponType.CANNON]: {
    type: WeaponType.CANNON,
    name: 'Tank Cannon',
    damage: 45,
    range: 80,
    fireRate: 0.8, // 0.8 shots per second
    reloadTime: 1250,
    magazineSize: 1,
    ammoType: AmmoType.STANDARD,
    projectileSpeed: 60,
    splashRadius: 3,
    penetration: 25,
    spread: 1,
    weight: 100,
    energyCost: 10,
    soundEffect: 'cannon_fire',
    visualEffect: 'muzzle_flash_large'
  },

  [WeaponType.MACHINE_GUN]: {
    type: WeaponType.MACHINE_GUN,
    name: 'Machine Gun',
    damage: 12,
    range: 40,
    fireRate: 8, // 8 shots per second
    reloadTime: 125,
    magazineSize: 50,
    ammoType: AmmoType.STANDARD,
    projectileSpeed: 80,
    splashRadius: 0,
    penetration: 8,
    spread: 3,
    weight: 30,
    energyCost: 2,
    soundEffect: 'machine_gun_fire',
    visualEffect: 'muzzle_flash_small'
  },

  [WeaponType.ROCKET]: {
    type: WeaponType.ROCKET,
    name: 'Rocket Launcher',
    damage: 80,
    range: 100,
    fireRate: 0.3, // 0.3 shots per second
    reloadTime: 3333,
    magazineSize: 1,
    ammoType: AmmoType.HIGH_EXPLOSIVE,
    projectileSpeed: 40,
    splashRadius: 8,
    penetration: 15,
    spread: 0.5,
    weight: 150,
    energyCost: 25,
    soundEffect: 'rocket_fire',
    visualEffect: 'rocket_trail'
  },

  [WeaponType.PLASMA]: {
    type: WeaponType.PLASMA,
    name: 'Plasma Cannon',
    damage: 35,
    range: 60,
    fireRate: 2, // 2 shots per second
    reloadTime: 500,
    magazineSize: 10,
    ammoType: AmmoType.STANDARD,
    projectileSpeed: 100,
    splashRadius: 1,
    penetration: 50, // Pierces through armor
    spread: 0,
    weight: 80,
    energyCost: 15,
    soundEffect: 'plasma_fire',
    visualEffect: 'plasma_bolt'
  },

  [WeaponType.SHOTGUN]: {
    type: WeaponType.SHOTGUN,
    name: 'Tank Shotgun',
    damage: 20, // Per pellet
    range: 25,
    fireRate: 1.5, // 1.5 shots per second
    reloadTime: 667,
    magazineSize: 8,
    ammoType: AmmoType.STANDARD,
    projectileSpeed: 50,
    splashRadius: 0,
    penetration: 12,
    spread: 15, // Wide spread
    weight: 60,
    energyCost: 8,
    soundEffect: 'shotgun_fire',
    visualEffect: 'shotgun_spread'
  },

  [WeaponType.SNIPER]: {
    type: WeaponType.SNIPER,
    name: 'Sniper Cannon',
    damage: 120,
    range: 150,
    fireRate: 0.2, // 0.2 shots per second
    reloadTime: 5000,
    magazineSize: 1,
    ammoType: AmmoType.ARMOR_PIERCING,
    projectileSpeed: 200,
    splashRadius: 0,
    penetration: 100,
    spread: 0,
    weight: 200,
    energyCost: 30,
    soundEffect: 'sniper_fire',
    visualEffect: 'sniper_trail'
  }
}

// Enhanced Weapon Class
export class Weapon {
  public config: WeaponConfig
  public currentAmmo: number
  public lastFireTime: number
  public isReloading: boolean
  public reloadStartTime: number
  public overheated: boolean
  public heat: number
  public maxHeat: number

  constructor(type: WeaponType) {
    this.config = { ...WEAPON_CONFIGS[type] }
    this.currentAmmo = this.config.magazineSize
    this.lastFireTime = 0
    this.isReloading = false
    this.reloadStartTime = 0
    this.overheated = false
    this.heat = 0
    this.maxHeat = 100
  }

  canFire(currentTime: number): boolean {
    if (this.isReloading || this.overheated) return false
    if (this.currentAmmo <= 0) return false
    
    const timeSinceLastShot = currentTime - this.lastFireTime
    const fireInterval = 1000 / this.config.fireRate
    
    return timeSinceLastShot >= fireInterval
  }

  fire(currentTime: number): boolean {
    if (!this.canFire(currentTime)) return false

    this.currentAmmo--
    this.lastFireTime = currentTime
    this.heat += 10 // Heat buildup

    // Check for overheat
    if (this.heat >= this.maxHeat) {
      this.overheated = true
      setTimeout(() => {
        this.overheated = false
        this.heat = 0
      }, 3000) // 3 second cooldown
    }

    // Auto-reload if magazine empty
    if (this.currentAmmo <= 0) {
      this.startReload(currentTime)
    }

    return true
  }

  startReload(currentTime: number): void {
    if (this.isReloading || this.currentAmmo === this.config.magazineSize) return
    
    this.isReloading = true
    this.reloadStartTime = currentTime
    
    setTimeout(() => {
      this.currentAmmo = this.config.magazineSize
      this.isReloading = false
    }, this.config.reloadTime)
  }

  update(deltaTime: number): void {
    // Cool down heat over time
    if (this.heat > 0 && !this.overheated) {
      this.heat = Math.max(0, this.heat - deltaTime * 20) // Heat dissipation
    }
  }

  getReloadProgress(currentTime: number): number {
    if (!this.isReloading) return 1
    
    const reloadElapsed = currentTime - this.reloadStartTime
    return Math.min(1, reloadElapsed / this.config.reloadTime)
  }
}

// Projectile Factory
export class ProjectileFactory {
  static createProjectile(
    weapon: Weapon,
    ownerId: string,
    startPosition: Position,
    direction: THREE.Vector3,
    currentTime: number
  ): Projectile[] {
    const config = weapon.config
    const projectiles: Projectile[] = []

    switch (config.type) {
      case WeaponType.SHOTGUN:
        // Create multiple pellets for shotgun
        const pelletCount = 8
        for (let i = 0; i < pelletCount; i++) {
          const spread = (Math.random() - 0.5) * config.spread * (Math.PI / 180)
          const spreadDirection = direction.clone()
          spreadDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), spread)
          
          projectiles.push(this.createSingleProjectile(
            weapon, ownerId, startPosition, spreadDirection, currentTime
          ))
        }
        break

      default:
        // Single projectile for other weapons
        const spreadAngle = (Math.random() - 0.5) * config.spread * (Math.PI / 180)
        const spreadDirection = direction.clone()
        spreadDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle)
        
        projectiles.push(this.createSingleProjectile(
          weapon, ownerId, startPosition, spreadDirection, currentTime
        ))
        break
    }

    return projectiles
  }

  private static createSingleProjectile(
    weapon: Weapon,
    ownerId: string,
    startPosition: Position,
    direction: THREE.Vector3,
    currentTime: number
  ): Projectile {
    const config = weapon.config
    const velocity = direction.normalize().multiplyScalar(config.projectileSpeed)

    const projectile: Projectile = {
      id: `projectile_${ownerId}_${currentTime}_${Math.random()}`,
      weaponType: config.type,
      ammoType: config.ammoType,
      ownerId,
      position: { ...startPosition },
      velocity,
      damage: config.damage,
      splashRadius: config.splashRadius,
      penetration: config.penetration,
      createdAt: currentTime,
      lifespan: (config.range / config.projectileSpeed) * 1000, // Convert to milliseconds
      hasExploded: false,
      trail: [{ ...startPosition }]
    }

    // Add special effects based on ammo type
    switch (config.ammoType) {
      case AmmoType.INCENDIARY:
        projectile.specialEffects = {
          fire: { duration: 5000, tickDamage: 5 }
        }
        break
      
      case AmmoType.EMP:
        projectile.specialEffects = {
          emp: { duration: 3000, disableTime: 2000 }
        }
        break
      
      case AmmoType.CLUSTER:
        projectile.specialEffects = {
          cluster: { count: 6, spread: 30 }
        }
        break
    }

    return projectile
  }
}

// Weapon Loadout System
export interface WeaponLoadout {
  primary: Weapon
  secondary: Weapon
  activeWeapon: 'primary' | 'secondary'
}

export class WeaponSystem {
  public loadout: WeaponLoadout
  public energy: number
  public maxEnergy: number

  constructor(primaryType: WeaponType = WeaponType.CANNON, secondaryType: WeaponType = WeaponType.MACHINE_GUN) {
    this.loadout = {
      primary: new Weapon(primaryType),
      secondary: new Weapon(secondaryType),
      activeWeapon: 'primary'
    }
    this.energy = 100
    this.maxEnergy = 100
  }

  getActiveWeapon(): Weapon {
    return this.loadout[this.loadout.activeWeapon]
  }

  switchWeapon(): void {
    this.loadout.activeWeapon = this.loadout.activeWeapon === 'primary' ? 'secondary' : 'primary'
  }

  canFire(currentTime: number): boolean {
    const weapon = this.getActiveWeapon()
    return weapon.canFire(currentTime) && this.energy >= weapon.config.energyCost
  }

  fire(
    ownerId: string,
    startPosition: Position,
    direction: THREE.Vector3,
    currentTime: number
  ): Projectile[] {
    const weapon = this.getActiveWeapon()
    
    if (!this.canFire(currentTime)) return []

    if (weapon.fire(currentTime)) {
      this.energy = Math.max(0, this.energy - weapon.config.energyCost)
      return ProjectileFactory.createProjectile(weapon, ownerId, startPosition, direction, currentTime)
    }

    return []
  }

  update(deltaTime: number): void {
    // Update both weapons
    this.loadout.primary.update(deltaTime)
    this.loadout.secondary.update(deltaTime)

    // Regenerate energy over time
    this.energy = Math.min(this.maxEnergy, this.energy + deltaTime * 10) // 10 energy per second
  }

  startReload(currentTime: number): void {
    this.getActiveWeapon().startReload(currentTime)
  }
}

export default {
  WeaponType,
  AmmoType,
  WEAPON_CONFIGS,
  Weapon,
  ProjectileFactory,
  WeaponSystem
}