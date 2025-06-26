import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Position } from '@/types'

// Particle System Types
export enum ParticleType {
  EXPLOSION = 'explosion',
  FIRE = 'fire',
  SMOKE = 'smoke',
  SPARKS = 'sparks',
  DUST = 'dust',
  DEBRIS = 'debris',
  MUZZLE_FLASH = 'muzzle_flash',
  SHIELD_HIT = 'shield_hit',
  BULLET_IMPACT = 'bullet_impact',
  ENGINE_EXHAUST = 'engine_exhaust',
  ENERGY_BEAM = 'energy_beam',
  EMP_WAVE = 'emp_wave'
}

// Particle Configuration
interface ParticleConfig {
  count: number
  lifetime: number
  size: number
  sizeVariation: number
  speed: number
  speedVariation: number
  gravity: number
  spread: number
  color: THREE.Color
  colorVariation: number
  opacity: number
  opacityDecay: number
  texture?: THREE.Texture
  blending: THREE.Blending
  emissionRate: number
  burstCount?: number
  continuous?: boolean
}

// Particle Presets
const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
  [ParticleType.EXPLOSION]: {
    count: 50,
    lifetime: 2000,
    size: 0.5,
    sizeVariation: 0.3,
    speed: 8,
    speedVariation: 4,
    gravity: -2,
    spread: 360,
    color: new THREE.Color('#FF4400'),
    colorVariation: 0.3,
    opacity: 1,
    opacityDecay: 0.8,
    blending: THREE.AdditiveBlending,
    emissionRate: 0,
    burstCount: 50,
    continuous: false
  },

  [ParticleType.FIRE]: {
    count: 30,
    lifetime: 1500,
    size: 0.3,
    sizeVariation: 0.2,
    speed: 3,
    speedVariation: 1,
    gravity: -1,
    spread: 45,
    color: new THREE.Color('#FF6600'),
    colorVariation: 0.4,
    opacity: 0.8,
    opacityDecay: 0.9,
    blending: THREE.AdditiveBlending,
    emissionRate: 20,
    continuous: true
  },

  [ParticleType.SMOKE]: {
    count: 25,
    lifetime: 3000,
    size: 0.8,
    sizeVariation: 0.4,
    speed: 1,
    speedVariation: 0.5,
    gravity: -0.5,
    spread: 30,
    color: new THREE.Color('#666666'),
    colorVariation: 0.2,
    opacity: 0.6,
    opacityDecay: 0.95,
    blending: THREE.NormalBlending,
    emissionRate: 10,
    continuous: true
  },

  [ParticleType.SPARKS]: {
    count: 20,
    lifetime: 800,
    size: 0.1,
    sizeVariation: 0.05,
    speed: 12,
    speedVariation: 6,
    gravity: -8,
    spread: 180,
    color: new THREE.Color('#FFFF00'),
    colorVariation: 0.2,
    opacity: 1,
    opacityDecay: 0.7,
    blending: THREE.AdditiveBlending,
    emissionRate: 0,
    burstCount: 20,
    continuous: false
  },

  [ParticleType.DUST]: {
    count: 15,
    lifetime: 2000,
    size: 0.2,
    sizeVariation: 0.1,
    speed: 2,
    speedVariation: 1,
    gravity: -0.2,
    spread: 90,
    color: new THREE.Color('#CCAA88'),
    colorVariation: 0.3,
    opacity: 0.4,
    opacityDecay: 0.9,
    blending: THREE.NormalBlending,
    emissionRate: 8,
    continuous: true
  },

  [ParticleType.DEBRIS]: {
    count: 12,
    lifetime: 2500,
    size: 0.15,
    sizeVariation: 0.1,
    speed: 6,
    speedVariation: 3,
    gravity: -5,
    spread: 120,
    color: new THREE.Color('#888888'),
    colorVariation: 0.4,
    opacity: 1,
    opacityDecay: 0.85,
    blending: THREE.NormalBlending,
    emissionRate: 0,
    burstCount: 12,
    continuous: false
  },

  [ParticleType.MUZZLE_FLASH]: {
    count: 8,
    lifetime: 150,
    size: 0.4,
    sizeVariation: 0.2,
    speed: 2,
    speedVariation: 1,
    gravity: 0,
    spread: 30,
    color: new THREE.Color('#FFFFFF'),
    colorVariation: 0.1,
    opacity: 1,
    opacityDecay: 0.3,
    blending: THREE.AdditiveBlending,
    emissionRate: 0,
    burstCount: 8,
    continuous: false
  },

  [ParticleType.SHIELD_HIT]: {
    count: 15,
    lifetime: 500,
    size: 0.2,
    sizeVariation: 0.1,
    speed: 4,
    speedVariation: 2,
    gravity: 0,
    spread: 60,
    color: new THREE.Color('#00FFFF'),
    colorVariation: 0.2,
    opacity: 0.8,
    opacityDecay: 0.6,
    blending: THREE.AdditiveBlending,
    emissionRate: 0,
    burstCount: 15,
    continuous: false
  },

  [ParticleType.BULLET_IMPACT]: {
    count: 10,
    lifetime: 300,
    size: 0.1,
    sizeVariation: 0.05,
    speed: 8,
    speedVariation: 4,
    gravity: -2,
    spread: 90,
    color: new THREE.Color('#FFAA00'),
    colorVariation: 0.3,
    opacity: 1,
    opacityDecay: 0.5,
    blending: THREE.AdditiveBlending,
    emissionRate: 0,
    burstCount: 10,
    continuous: false
  },

  [ParticleType.ENGINE_EXHAUST]: {
    count: 20,
    lifetime: 1000,
    size: 0.3,
    sizeVariation: 0.1,
    speed: 2,
    speedVariation: 0.5,
    gravity: 0,
    spread: 15,
    color: new THREE.Color('#4444FF'),
    colorVariation: 0.2,
    opacity: 0.6,
    opacityDecay: 0.8,
    blending: THREE.AdditiveBlending,
    emissionRate: 20,
    continuous: true
  },

  [ParticleType.ENERGY_BEAM]: {
    count: 25,
    lifetime: 200,
    size: 0.15,
    sizeVariation: 0.05,
    speed: 15,
    speedVariation: 2,
    gravity: 0,
    spread: 5,
    color: new THREE.Color('#00AAFF'),
    colorVariation: 0.1,
    opacity: 0.9,
    opacityDecay: 0.4,
    blending: THREE.AdditiveBlending,
    emissionRate: 0,
    burstCount: 25,
    continuous: false
  },

  [ParticleType.EMP_WAVE]: {
    count: 30,
    lifetime: 1000,
    size: 0.3,
    sizeVariation: 0.1,
    speed: 5,
    speedVariation: 1,
    gravity: 0,
    spread: 360,
    color: new THREE.Color('#00FFFF'),
    colorVariation: 0.1,
    opacity: 0.7,
    opacityDecay: 0.7,
    blending: THREE.AdditiveBlending,
    emissionRate: 0,
    burstCount: 30,
    continuous: false
  }
}

// Individual Particle
interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  size: number
  opacity: number
  color: THREE.Color
  active: boolean
}

// Particle System Props
interface ParticleSystemProps {
  type: ParticleType
  position: Position
  direction?: THREE.Vector3
  intensity?: number
  active?: boolean
  onComplete?: () => void
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  type,
  position,
  direction = new THREE.Vector3(0, 1, 0),
  intensity = 1,
  active = true,
  onComplete
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const config = PARTICLE_CONFIGS[type]
  const lastEmissionTime = useRef(0)
  const systemStartTime = useRef(Date.now())

  // Create particles array
  const particles = useMemo(() => {
    const particleArray: Particle[] = []
    const count = Math.floor(config.count * intensity)
    
    for (let i = 0; i < count; i++) {
      particleArray.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: config.lifetime,
        size: config.size,
        opacity: 0,
        color: config.color.clone(),
        active: false
      })
    }
    
    return particleArray
  }, [config, intensity])

  // Create geometry and material
  const { geometry, material } = useMemo(() => {
    const particleCount = particles.length
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const opacities = new Float32Array(particleCount)

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geom.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1))

    const mat = new THREE.PointsMaterial({
      size: config.size,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      blending: config.blending,
      alphaTest: 0.01
    })

    return { geometry: geom, material: mat }
  }, [particles.length, config])

  // Emit new particles
  const emitParticles = (count: number, _currentTime: number) => {
    let emitted = 0
    
    for (let i = 0; i < particles.length && emitted < count; i++) {
      const particle = particles[i]
      
      if (!particle.active) {
        // Reset particle
        particle.position.set(position.x, position.y, position.z)
        
        // Calculate random direction within spread
        const spreadRad = (config.spread * Math.PI) / 180
        const angle = (Math.random() - 0.5) * spreadRad
        const elevation = (Math.random() - 0.5) * spreadRad
        
        const baseDirection = direction.clone().normalize()
        const randomDirection = new THREE.Vector3()
        
        randomDirection.copy(baseDirection)
        randomDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
        randomDirection.applyAxisAngle(new THREE.Vector3(1, 0, 0), elevation)
        
        const speed = config.speed + (Math.random() - 0.5) * config.speedVariation
        particle.velocity.copy(randomDirection.multiplyScalar(speed))
        
        // Set particle properties
        particle.life = 0
        particle.maxLife = config.lifetime + (Math.random() - 0.5) * config.lifetime * 0.3
        particle.size = config.size + (Math.random() - 0.5) * config.sizeVariation
        particle.opacity = config.opacity
        
        // Color variation
        const colorVariation = config.colorVariation
        particle.color.copy(config.color)
        particle.color.r += (Math.random() - 0.5) * colorVariation
        particle.color.g += (Math.random() - 0.5) * colorVariation
        particle.color.b += (Math.random() - 0.5) * colorVariation
        particle.color.r = Math.max(0, Math.min(1, particle.color.r))
        particle.color.g = Math.max(0, Math.min(1, particle.color.g))
        particle.color.b = Math.max(0, Math.min(1, particle.color.b))
        
        particle.active = true
        emitted++
      }
    }
  }

  // Update particles
  useFrame((_state, delta) => {
    if (!active) return

    const currentTime = Date.now()
    const deltaMs = delta * 1000

    // Emit particles
    if (config.continuous) {
      const timeSinceLastEmission = currentTime - lastEmissionTime.current
      const emissionInterval = 1000 / config.emissionRate
      
      if (timeSinceLastEmission >= emissionInterval) {
        emitParticles(1, currentTime)
        lastEmissionTime.current = currentTime
      }
    } else if (config.burstCount && currentTime - systemStartTime.current < 100) {
      // Emit burst
      emitParticles(config.burstCount, currentTime)
      systemStartTime.current = currentTime + 1000 // Prevent re-emission
    }

    // Update existing particles
    let activeCount = 0
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute
    const colors = geometry.getAttribute('color') as THREE.BufferAttribute
    const sizes = geometry.getAttribute('size') as THREE.BufferAttribute
    const opacities = geometry.getAttribute('opacity') as THREE.BufferAttribute

    particles.forEach((particle, index) => {
      if (particle.active) {
        // Update physics
        particle.velocity.y += config.gravity * (deltaMs / 1000)
        particle.position.add(particle.velocity.clone().multiplyScalar(deltaMs / 1000))
        
        // Update life
        particle.life += deltaMs
        const lifeRatio = particle.life / particle.maxLife
        
        if (lifeRatio >= 1) {
          particle.active = false
        } else {
          // Update opacity
          particle.opacity = config.opacity * Math.pow(1 - lifeRatio, config.opacityDecay)
          
          // Update size (can grow or shrink over time)
          const sizeMultiplier = 1 + lifeRatio * 0.5 // Slightly grow over time
          const currentSize = particle.size * sizeMultiplier
          
          activeCount++
          
          // Update buffer attributes
          positions.setXYZ(index, particle.position.x, particle.position.y, particle.position.z)
          colors.setXYZ(index, particle.color.r, particle.color.g, particle.color.b)
          sizes.setX(index, currentSize)
          opacities.setX(index, particle.opacity)
        }
      } else {
        // Hide inactive particles
        positions.setXYZ(index, 0, 0, 0)
        colors.setXYZ(index, 0, 0, 0)
        sizes.setX(index, 0)
        opacities.setX(index, 0)
      }
    })

    // Mark attributes as needing update
    positions.needsUpdate = true
    colors.needsUpdate = true
    sizes.needsUpdate = true
    opacities.needsUpdate = true

    // Check if system is complete
    if (!config.continuous && activeCount === 0 && currentTime - systemStartTime.current > 1000) {
      onComplete?.()
    }
  })

  // Update position when prop changes
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position.x, position.y, position.z)
    }
  }, [position])

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}

// Particle Effect Manager Component
interface ParticleEffectManagerProps {
  effects: Array<{
    id: string
    type: ParticleType
    position: Position
    direction?: THREE.Vector3
    intensity?: number
    duration?: number
  }>
  onEffectComplete?: (id: string) => void
}

export const ParticleEffectManager: React.FC<ParticleEffectManagerProps> = ({
  effects,
  onEffectComplete
}) => {
  const [activeEffects, setActiveEffects] = React.useState<typeof effects>([])

  React.useEffect(() => {
    setActiveEffects(effects)
  }, [effects])

  const handleEffectComplete = (id: string) => {
    setActiveEffects(prev => prev.filter(effect => effect.id !== id))
    onEffectComplete?.(id)
  }

  return (
    <>
      {activeEffects.map(effect => (
        <ParticleSystem
          key={effect.id}
          type={effect.type}
          position={effect.position}
          direction={effect.direction}
          intensity={effect.intensity}
          onComplete={() => handleEffectComplete(effect.id)}
        />
      ))}
    </>
  )
}

export default ParticleSystem