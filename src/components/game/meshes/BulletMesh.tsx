import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Bullet } from '@/types'
import { COLORS } from '@/lib/gameConfig'

interface BulletMeshProps {
  bullet: Bullet
}

const BulletMesh: React.FC<BulletMeshProps> = ({ bullet }) => {
  const groupRef = useRef<THREE.Group>(null)
  const trailRef = useRef<THREE.Mesh>(null)
  
  // Interpolation targets for smooth movement
  const targetPosition = useRef(new THREE.Vector3(bullet.position.x, bullet.position.y, bullet.position.z))
  const previousPosition = useRef(new THREE.Vector3(bullet.position.x, bullet.position.y, bullet.position.z))

  // Trail positions for rendering bullet trail
  const trailPositions = useRef<THREE.Vector3[]>([])
  const maxTrailLength = 10

  // Update interpolation targets when bullet data changes
  useMemo(() => {
    previousPosition.current.copy(targetPosition.current)
    targetPosition.current.set(bullet.position.x, bullet.position.y, bullet.position.z)
  }, [bullet.position])

  // Smooth interpolation and trail effect
  useFrame(() => {
    if (!groupRef.current) return

    // Interpolate position
    groupRef.current.position.lerp(targetPosition.current, 0.3)
    
    // Update trail
    trailPositions.current.push(groupRef.current.position.clone())
    if (trailPositions.current.length > maxTrailLength) {
      trailPositions.current.shift()
    }

    // Rotation based on velocity direction
    if (bullet.velocity) {
      const direction = new THREE.Vector3(bullet.velocity.x, bullet.velocity.y, bullet.velocity.z)
      if (direction.length() > 0) {
        direction.normalize()
        groupRef.current.lookAt(
          groupRef.current.position.x + direction.x,
          groupRef.current.position.y + direction.y,
          groupRef.current.position.z + direction.z
        )
      }
    }
  })

  // Calculate bullet age for effects
  const age = Date.now() - bullet.createdAt
  const agePercent = Math.min(age / bullet.lifespan, 1)
  const opacity = Math.max(0.2, 1 - agePercent)

  return (
    <group ref={groupRef} position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
      {/* Main Bullet Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial 
          color={COLORS.BULLET_COLOR}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Bullet Core (brighter center) */}
      <mesh>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Glow Effect */}
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial 
          color={COLORS.BULLET_COLOR}
          transparent
          opacity={opacity * 0.1}
        />
      </mesh>

      {/* Trail Effect */}
      {trailPositions.current.length > 1 && (
        <group>
          {trailPositions.current.map((pos, index) => {
            if (index === 0) return null
            
            const prevPos = trailPositions.current[index - 1]
            const distance = pos.distanceTo(prevPos)
            const midPoint = new THREE.Vector3().addVectors(pos, prevPos).multiplyScalar(0.5)
            
            const trailOpacity = (index / trailPositions.current.length) * opacity * 0.5
            const trailScale = (index / trailPositions.current.length) * 0.1
            
            return (
              <mesh 
                key={index}
                position={[midPoint.x, midPoint.y, midPoint.z]}
              >
                <sphereGeometry args={[trailScale, 4, 4]} />
                <meshBasicMaterial 
                  color={COLORS.BULLET_COLOR}
                  transparent
                  opacity={trailOpacity}
                />
              </mesh>
            )
          })}
        </group>
      )}

      {/* Sparks Effect (random small particles) */}
      <group>
        {Array.from({ length: 3 }).map((_, index) => {
          const angle = (index / 3) * Math.PI * 2 + age * 0.01
          const radius = 0.2 + Math.sin(age * 0.005 + index) * 0.1
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          
          return (
            <mesh key={index} position={[x, 0, z]}>
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshBasicMaterial 
                color="#ffffff"
                transparent
                opacity={opacity * 0.8}
              />
            </mesh>
          )
        })}
      </group>

      {/* Impact Prediction (show where bullet will hit) */}
      {bullet.velocity && (
        <group>
          {/* Calculate future position */}
          {(() => {
            const futureTime = 1000 // 1 second ahead
            const futurePos = new THREE.Vector3(
              bullet.position.x + bullet.velocity.x * (futureTime / 1000),
              bullet.position.y + bullet.velocity.y * (futureTime / 1000),
              bullet.position.z + bullet.velocity.z * (futureTime / 1000)
            )
            
            return (
              <mesh position={[futurePos.x, futurePos.y, futurePos.z]}>
                <ringGeometry args={[0.5, 0.7, 8]} />
                <meshBasicMaterial 
                  color="#ff0000"
                  transparent
                  opacity={opacity * 0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )
          })()}
        </group>
      )}
    </group>
  )
}

export default BulletMesh