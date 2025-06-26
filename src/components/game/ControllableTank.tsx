import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '@/types'
import HealthBar from './HealthBar'

interface ControllableTankProps {
  tank: Player
  isLocalPlayer?: boolean
}

const ControllableTank: React.FC<ControllableTankProps> = ({ tank, isLocalPlayer = false }) => {
  const groupRef = useRef<THREE.Group>(null)
  const turretRef = useRef<THREE.Group>(null)
  const barrelRef = useRef<THREE.Group>(null)

  // Smooth interpolation for position and rotation
  const targetPosition = useRef(new THREE.Vector3(tank.position.x, 0, tank.position.z))
  const targetRotation = useRef(tank.rotation)

  useEffect(() => {
    // Update target position and rotation when tank data changes
    targetPosition.current.set(tank.position.x, 0, tank.position.z)
    targetRotation.current = tank.rotation
  }, [tank.position.x, tank.position.z, tank.rotation])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Smooth position interpolation
    groupRef.current.position.lerp(targetPosition.current, delta * 10)
    
    // Smooth rotation interpolation
    const currentY = groupRef.current.rotation.y
    const targetY = targetRotation.current
    let diff = targetY - currentY
    
    // Handle rotation wrapping
    if (diff > Math.PI) diff -= Math.PI * 2
    if (diff < -Math.PI) diff += Math.PI * 2
    
    groupRef.current.rotation.y += diff * delta * 10

    // Turret can rotate independently (for future mouse aim)
    if (turretRef.current) {
      turretRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }

    // Subtle barrel recoil animation
    if (barrelRef.current) {
      const recoil = Math.max(0, Math.sin(state.clock.elapsedTime * 20) * 0.1)
      barrelRef.current.position.z = 1.5 - recoil
    }
  })

  // Tank color based on health
  const getHealthColor = () => {
    const healthPercent = tank.health / tank.maxHealth
    if (healthPercent > 0.6) return tank.color
    if (healthPercent > 0.3) return '#ff8800' // Orange when damaged
    return '#ff0000' // Red when critically damaged
  }

  return (
    <group ref={groupRef} position={[tank.position.x, 0, tank.position.z]}>
      {/* Health Bar */}
      <HealthBar 
        health={tank.health}
        maxHealth={tank.maxHealth}
        position={[0, 2, 0]}
        label={isLocalPlayer ? 'YOU' : `Player ${tank.address.slice(-4)}`}
        isPlayer={true}
      />

      {/* Tank Body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial 
          color={getHealthColor()}
          opacity={tank.isAlive ? 1 : 0.5}
          transparent={!tank.isAlive}
        />
      </mesh>

      {/* Tank Turret */}
      <group ref={turretRef} position={[0, 1.2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.8, 1.5]} />
          <meshStandardMaterial 
            color={getHealthColor()}
            opacity={tank.isAlive ? 1 : 0.5}
            transparent={!tank.isAlive}
          />
        </mesh>

        {/* Tank Barrel */}
        <group ref={barrelRef}>
          <mesh position={[0, 0, 1.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        </group>
      </group>

      {/* Tracks/Wheels */}
      <mesh position={[-1.2, 0.2, 0.8]} castShadow>
        <boxGeometry args={[0.3, 0.4, 1.8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1.2, 0.2, 0.8]} castShadow>
        <boxGeometry args={[0.3, 0.4, 1.8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Local Player Indicator */}
      {isLocalPlayer && (
        <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]}>
          <ringGeometry args={[0.8, 1, 8]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Death effects */}
      {!tank.isAlive && (
        <>
          {/* Smoke effect (simple) */}
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#555555" transparent opacity={0.3} />
          </mesh>
        </>
      )}
    </group>
  )
}

export default ControllableTank