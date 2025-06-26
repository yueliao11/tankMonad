import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Monster } from '@/types'
import HealthBar from './HealthBar'
import { COLORS } from '@/lib/gameConfig'

interface ControllableMonsterProps {
  monster: Monster
}

const ControllableMonster: React.FC<ControllableMonsterProps> = ({ monster }) => {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  
  // Smooth interpolation targets
  const targetPosition = useRef(new THREE.Vector3(monster.position.x, 2, monster.position.z))

  useFrame((state, delta) => {
    if (!groupRef.current || !coreRef.current) return

    // Update target position
    targetPosition.current.set(monster.position.x, 2, monster.position.z)
    
    // Smooth position interpolation
    groupRef.current.position.lerp(targetPosition.current, delta * 8)

    // Floating animation
    const floatY = Math.sin(state.clock.elapsedTime * 2 + monster.position.x) * 0.3
    groupRef.current.position.y = 2 + floatY

    // Rotation animation based on state
    switch (monster.state) {
      case 'chasing':
        // Fast aggressive rotation when chasing
        coreRef.current.rotation.x += delta * 4
        coreRef.current.rotation.z += delta * 3
        break
      case 'attacking':
        // Violent shaking when attacking
        coreRef.current.rotation.x += delta * 8
        coreRef.current.rotation.y += delta * 6
        coreRef.current.rotation.z += delta * 7
        break
      default:
        // Slow idle rotation
        coreRef.current.rotation.x += delta * 1
        coreRef.current.rotation.z += delta * 0.5
    }
  })

  // Color based on monster state and health
  const getMonsterColor = () => {
    const healthPercent = monster.health / monster.maxHealth
    
    if (monster.state === 'attacking') return '#ff0000' // Red when attacking
    if (monster.state === 'chasing') return '#ff8800' // Orange when chasing
    if (healthPercent < 0.3) return '#aa4444' // Darker when low health
    return COLORS.MONSTER_COLOR
  }

  const getMonsterSize = () => {
    // Scale based on health
    const healthPercent = monster.health / monster.maxHealth
    return Math.max(0.5, healthPercent) * 1.2
  }

  return (
    <group ref={groupRef} position={[monster.position.x, 2, monster.position.z]}>
      {/* Health Bar */}
      <HealthBar 
        health={monster.health}
        maxHealth={monster.maxHealth}
        position={[0, 2, 0]}
        label={`Monster ${monster.id.slice(-4)}`}
        isPlayer={false}
      />

      {/* Monster Core */}
      <mesh ref={coreRef} castShadow receiveShadow>
        <octahedronGeometry args={[getMonsterSize()]} />
        <meshStandardMaterial 
          color={getMonsterColor()}
          emissive={monster.state === 'attacking' ? '#440000' : '#000000'}
          emissiveIntensity={monster.state === 'attacking' ? 0.3 : 0}
        />
      </mesh>

      {/* Monster Eyes/Indicators */}
      <mesh position={[0.5, 0.3, 0.5]} castShadow>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[-0.5, 0.3, 0.5]} castShadow>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Attack indicator */}
      {monster.state === 'attacking' && (
        <mesh position={[0, 0, 1.5]}>
          <coneGeometry args={[0.3, 0.8, 4]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Chase indicator */}
      {monster.state === 'chasing' && (
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 8]} />
          <meshBasicMaterial color="#ff8800" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Detection range (when idle) */}
      {monster.state === 'idle' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[monster.aiData.detectionRadius - 0.5, monster.aiData.detectionRadius, 16]} />
          <meshBasicMaterial color="#666666" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  )
}

export default ControllableMonster