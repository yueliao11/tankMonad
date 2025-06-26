import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '@/types'

interface TankMeshProps {
  tank: Player
  isPlayer?: boolean
}

const TankMesh: React.FC<TankMeshProps> = ({ tank, isPlayer = false }) => {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const turretRef = useRef<THREE.Group>(null)
  
  // Interpolation targets for smooth movement
  const targetPosition = useRef(new THREE.Vector3(tank.position.x, tank.position.y, tank.position.z))
  const targetRotation = useRef(tank.rotation)

  // Update interpolation targets when tank data changes
  useMemo(() => {
    targetPosition.current.set(tank.position.x, tank.position.y, tank.position.z)
    targetRotation.current = tank.rotation
  }, [tank.position, tank.rotation])

  // Smooth interpolation
  useFrame(() => {
    if (!groupRef.current) return

    // Interpolate position
    groupRef.current.position.lerp(targetPosition.current, 0.1)
    
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
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRotation, targetRot, 0.1)
  })

  // Tank color
  const tankColor = tank.color || '#4ecdc4'
  
  // Health bar color
  const healthPercent = tank.health / tank.maxHealth
  const healthColor = healthPercent > 0.6 ? '#22c55e' : healthPercent > 0.3 ? '#f59e0b' : '#ef4444'

  return (
    <group ref={groupRef} position={[tank.position.x, tank.position.y, tank.position.z]}>
      {/* Tank Body */}
      <mesh ref={bodyRef} castShadow receiveShadow>
        <boxGeometry args={[2, 0.8, 3]} />
        <meshStandardMaterial 
          color={tankColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Tank Turret */}
      <group ref={turretRef} position={[0, 0.5, 0]}>
        {/* Turret Base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.6, 8]} />
          <meshStandardMaterial 
            color={new THREE.Color(tankColor).multiplyScalar(0.8)}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>

        {/* Cannon */}
        <mesh position={[1.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 2.4, 8]} />
          <meshStandardMaterial 
            color="#333333"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Tracks/Wheels */}
      <group position={[0, -0.3, 0]}>
        {/* Left Track */}
        <mesh position={[-1.2, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.4, 3.2]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        {/* Right Track */}
        <mesh position={[1.2, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.4, 3.2]} />
          <meshStandardMaterial color="#222222" />
        </mesh>

        {/* Wheels */}
        {[-1, 0, 1].map((z, index) => (
          <group key={index} position={[0, 0, z * 1.2]}>
            {/* Left Wheel */}
            <mesh position={[-1.2, 0, 0]} rotation-z={Math.PI / 2} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
            
            {/* Right Wheel */}
            <mesh position={[1.2, 0, 0]} rotation-z={Math.PI / 2} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Player Indicator */}
      {isPlayer && (
        <mesh position={[0, 3, 0]}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}

      {/* Health Bar */}
      <group position={[0, 2.5, 0]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[2, 0.2]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.7} />
        </mesh>
        
        {/* Health Fill */}
        <mesh position={[-(1 - healthPercent), 0, 0.01]}>
          <planeGeometry args={[2 * healthPercent, 0.15]} />
          <meshBasicMaterial color={healthColor} />
        </mesh>
      </group>

      {/* Name Tag */}
      {tank.address && (
        <group position={[0, 3.2, 0]}>
          <mesh>
            <planeGeometry args={[3, 0.5]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
          {/* TODO: Add text rendering for address */}
        </group>
      )}

      {/* Death Effect */}
      {!tank.isAlive && (
        <group>
          {/* Smoke/fire particles would go here */}
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshBasicMaterial 
              color="#ff4444" 
              transparent 
              opacity={0.3}
              wireframe
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

export default TankMesh