import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Bullet } from '@/types'
import { COLORS } from '@/lib/gameConfig'

interface BulletTrailProps {
  bullet: Bullet
}

const BulletTrail: React.FC<BulletTrailProps> = ({ bullet }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const trailGroupRef = useRef<THREE.Group>(null)
  const [trailPositions, setTrailPositions] = useState<THREE.Vector3[]>([])

  useFrame((_state, delta) => {
    if (!meshRef.current) return

    // Update bullet position
    meshRef.current.position.set(bullet.position.x, bullet.position.y, bullet.position.z)
    
    // Add current position to trail
    const currentPos = new THREE.Vector3(bullet.position.x, bullet.position.y, bullet.position.z)
    setTrailPositions(prev => {
      const newTrail = [currentPos, ...prev.slice(0, 8)] // Keep last 8 positions
      return newTrail
    })
    
    // Bullet rotation for visual effect
    meshRef.current.rotation.x += delta * 15
    meshRef.current.rotation.y += delta * 10
  })

  // Calculate bullet age for effects
  const bulletAge = Date.now() - bullet.createdAt
  const isNew = bulletAge < 100 // First 100ms

  return (
    <group>
      {/* Trail particles */}
      <group ref={trailGroupRef}>
        {trailPositions.map((pos, index) => {
          const opacity = Math.max(0, (1 - index / 8) * 0.6)
          const size = Math.max(0.02, 0.08 - index * 0.01)
          
          return (
            <mesh key={index} position={[pos.x, pos.y, pos.z]}>
              <sphereGeometry args={[size]} />
              <meshBasicMaterial 
                color={COLORS.BULLET_COLOR}
                transparent 
                opacity={opacity}
              />
            </mesh>
          )
        })}
      </group>

      {/* Main bullet with glow */}
      <mesh 
        ref={meshRef} 
        position={[bullet.position.x, bullet.position.y, bullet.position.z]}
        castShadow
      >
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial 
          color={COLORS.BULLET_COLOR}
          emissive={COLORS.BULLET_COLOR}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Bullet glow halo */}
      <mesh position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial 
          color={COLORS.BULLET_COLOR}
          transparent 
          opacity={0.2}
        />
      </mesh>

      {/* Muzzle flash effect (fades quickly) */}
      {isNew && (
        <mesh position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
          <sphereGeometry args={[0.3]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent 
            opacity={Math.max(0, 1 - bulletAge / 100)} 
          />
        </mesh>
      )}

      {/* Spark effects */}
      {isNew && (
        <group>
          {Array.from({ length: 3 }, (_, i) => (
            <mesh 
              key={i}
              position={[
                bullet.position.x + (Math.random() - 0.5) * 0.4,
                bullet.position.y + (Math.random() - 0.5) * 0.4,
                bullet.position.z + (Math.random() - 0.5) * 0.4
              ]}
            >
              <sphereGeometry args={[0.02]} />
              <meshBasicMaterial 
                color="#ff8800"
                transparent 
                opacity={Math.max(0, 1 - bulletAge / 80)} 
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

export default BulletTrail