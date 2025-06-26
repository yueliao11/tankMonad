import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ExplosionEffectProps {
  position: [number, number, number]
  size?: number
  duration?: number
  onComplete?: () => void
}

const ExplosionEffect: React.FC<ExplosionEffectProps> = ({ 
  position, 
  size = 1, 
  duration = 1000,
  onComplete 
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const [startTime] = useState(Date.now())
  const [particles] = useState(() => {
    // Generate random particles
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4
      ),
      size: Math.random() * 0.3 + 0.1,
      life: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      color: ['#ff4400', '#ff8800', '#ffaa00', '#ffff00'][Math.floor(Math.random() * 4)]
    }))
  })

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Update particle positions
    particles.forEach((particle, index) => {
      const mesh = groupRef.current?.children[index] as THREE.Mesh
      if (!mesh) return

      // Apply gravity and velocity
      particle.velocity.y -= delta * 8 // Gravity
      mesh.position.add(particle.velocity.clone().multiplyScalar(delta))

      // Scale and fade based on life and progress
      const lifeProgress = Math.min(progress / particle.life, 1)
      const scale = (1 - lifeProgress) * particle.size * size
      mesh.scale.setScalar(Math.max(0, scale))

      // Fade out
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = Math.max(0, 1 - lifeProgress)
    })

    // Complete explosion
    if (progress >= 1 && onComplete) {
      onComplete()
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Core explosion flash */}
      <mesh>
        <sphereGeometry args={[size * 0.8]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent
          opacity={Math.max(0, 1 - (Date.now() - startTime) / 200)}
        />
      </mesh>

      {/* Fire ball */}
      <mesh>
        <sphereGeometry args={[size * 0.6]} />
        <meshBasicMaterial 
          color="#ff4400"
          transparent
          opacity={Math.max(0, 1 - (Date.now() - startTime) / 400)}
        />
      </mesh>

      {/* Smoke ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.4, size * 1.2, 8]} />
        <meshBasicMaterial 
          color="#666666"
          transparent
          opacity={Math.max(0, 0.5 - (Date.now() - startTime) / 800)}
        />
      </mesh>

      {/* Particle debris */}
      {particles.map((particle, index) => (
        <mesh key={particle.id} position={[0, 0, 0]}>
          <sphereGeometry args={[particle.size]} />
          <meshBasicMaterial 
            color={particle.color}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  )
}

export default ExplosionEffect