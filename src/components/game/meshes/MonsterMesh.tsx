import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Monster } from '@/types'
import { COLORS } from '@/lib/gameConfig'

interface MonsterMeshProps {
  monster: Monster
}

const MonsterMesh: React.FC<MonsterMeshProps> = ({ monster }) => {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  
  // Interpolation targets for smooth movement
  const targetPosition = useRef(new THREE.Vector3(monster.position.x, monster.position.y, monster.position.z))
  const targetRotation = useRef(monster.rotation)

  // Animation states
  const walkCycle = useRef(0)
  const hoverOffset = useRef(Math.random() * Math.PI * 2) // Random phase for each monster

  // Update interpolation targets when monster data changes
  useMemo(() => {
    targetPosition.current.set(monster.position.x, monster.position.y, monster.position.z)
    targetRotation.current = monster.rotation
  }, [monster.position, monster.rotation])

  // Smooth interpolation and animations
  useFrame((state) => {
    if (!groupRef.current || !bodyRef.current) return

    // Interpolate position
    groupRef.current.position.lerp(targetPosition.current, 0.15)
    
    // Interpolate rotation
    const currentRotation = groupRef.current.rotation.y
    let targetRot = targetRotation.current
    
    // Handle rotation wrapping
    if (Math.abs(targetRot - currentRotation) > Math.PI) {
      if (targetRot > currentRotation) {
        targetRot -= 2 * Math.PI
      } else {
        targetRot += 2 * Math.PI
      }
    }
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRot, 0.15)

    // Walking animation
    walkCycle.current += 0.1
    if (monster.state === 'chasing' || monster.state === 'idle') {
      bodyRef.current.rotation.z = Math.sin(walkCycle.current) * 0.05
    }

    // Hovering animation
    const hoverY = Math.sin(state.clock.elapsedTime * 2 + hoverOffset.current) * 0.1
    groupRef.current.position.y = targetPosition.current.y + hoverY

    // Aggressive animation when attacking
    if (monster.state === 'attacking') {
      const attackShake = Math.sin(state.clock.elapsedTime * 10) * 0.1
      bodyRef.current.rotation.z = attackShake
      bodyRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 8) * 0.05)
    } else {
      bodyRef.current.scale.setScalar(1)
    }
  })

  // Monster color based on state
  const getMonsterColor = () => {
    switch (monster.state) {
      case 'attacking':
        return '#ff4444'
      case 'chasing':
        return '#ff8844'
      case 'idle':
      default:
        return COLORS.MONSTER_COLOR
    }
  }

  // Health bar color
  const healthPercent = monster.health / monster.maxHealth
  const healthColor = healthPercent > 0.6 ? '#22c55e' : healthPercent > 0.3 ? '#f59e0b' : '#ef4444'

  return (
    <group ref={groupRef} position={[monster.position.x, monster.position.y, monster.position.z]}>
      {/* Monster Body */}
      <mesh ref={bodyRef} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.2, 2]} />
        <meshStandardMaterial 
          color={getMonsterColor()}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Monster Head */}
      <mesh position={[0, 0.8, 1.2]} castShadow>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial 
          color={new THREE.Color(getMonsterColor()).multiplyScalar(0.9)}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Eyes */}
      <group position={[0, 1, 1.7]}>
        {/* Left Eye */}
        <mesh position={[-0.3, 0, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        
        {/* Right Eye */}
        <mesh position={[0.3, 0, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      </group>

      {/* Legs */}
      <group position={[0, -0.8, 0]}>
        {[
          [-0.6, 0, -0.7],
          [0.6, 0, -0.7],
          [-0.6, 0, 0.7],
          [0.6, 0, 0.7]
        ].map((pos, index) => (
          <mesh key={index} position={pos} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 0.8, 6]} />
            <meshStandardMaterial 
              color={new THREE.Color(getMonsterColor()).multiplyScalar(0.7)}
            />
          </mesh>
        ))}
      </group>

      {/* Claws/Spikes */}
      <group position={[0, 0.2, 1.8]}>
        {[-0.4, 0, 0.4].map((x, index) => (
          <mesh key={index} position={[x, 0, 0]} rotation-x={Math.PI / 6} castShadow>
            <coneGeometry args={[0.1, 0.4, 4]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Health Bar */}
      <group position={[0, 2, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[1.5, 0.15]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.7} />
        </mesh>
        
        {/* Health Fill */}
        <mesh position={[-(0.75 * (1 - healthPercent)), 0, 0.01]}>
          <planeGeometry args={[1.5 * healthPercent, 0.1]} />
          <meshBasicMaterial color={healthColor} />
        </mesh>
      </group>

      {/* State Indicator */}
      {monster.state !== 'idle' && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial 
            color={monster.state === 'attacking' ? '#ff0000' : '#ffaa00'}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Target Line (when chasing) */}
      {monster.state === 'chasing' && monster.target && (
        <group>
          {/* Simple line effect - in a real game you'd want a proper line renderer */}
          <mesh position={[0, 0.5, 0]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.02, 0.02, 10, 8]} />
            <meshBasicMaterial 
              color="#ff0000" 
              transparent 
              opacity={0.3}
            />
          </mesh>
        </group>
      )}

      {/* Death Effect */}
      {monster.health <= 0 && (
        <group>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshBasicMaterial 
              color="#ffaa00" 
              transparent 
              opacity={0.2}
              wireframe
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

export default MonsterMesh