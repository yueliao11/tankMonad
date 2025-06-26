import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'
import { GAME_CONFIG, VISUALS, COLORS } from '@/lib/gameConfig'
import { ObstacleManager } from '@/lib/physics'
import ControllableTank from './ControllableTank'
import ControllableMonster from './ControllableMonster'
import BulletTrail from './BulletTrail'
import PlayerControls from './PlayerControls'
import ExplosionManager from './ExplosionManager'
import ObstacleRenderer from './ObstacleRenderer'

// Simple Tank Component
const SimpleTank: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={meshRef} position={position}>
      {/* Tank Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tank Turret */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.5, 0.8, 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tank Barrel */}
      <mesh position={[0, 1.2, 1.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  )
}

// Simple Monster Component
const SimpleMonster: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 2
      meshRef.current.rotation.z += delta
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <octahedronGeometry args={[1]} />
      <meshStandardMaterial color={COLORS.MONSTER_COLOR} />
    </mesh>
  )
}

const GameScene: React.FC = () => {
  const { gameState, isConnected, connectedUser } = useGameStore()
  const { scene, camera } = useThree()
  
  // Initialize obstacle manager
  const [obstacleManager] = useState(() => new ObstacleManager())
  const [obstacles, setObstacles] = useState(obstacleManager.getObstacles())

  // Setup scene fog
  useMemo(() => {
    scene.fog = new THREE.Fog('#87ceeb', VISUALS.FOG_NEAR, VISUALS.FOG_FAR)
  }, [scene])

  // Update obstacles when they change
  useEffect(() => {
    const updateObstacles = () => {
      setObstacles(obstacleManager.getObstacles())
    }
    
    // Set up a listener for obstacle changes (for future real-time updates)
    const interval = setInterval(updateObstacles, 1000)
    return () => clearInterval(interval)
  }, [obstacleManager])

  // Camera following for local player
  useFrame(() => {
    if (gameState && connectedUser) {
      // Find local player tank
      const localTank = Array.from(gameState.players.values()).find(
        tank => tank.address === connectedUser.address
      )
      
      if (localTank) {
        // Smooth camera following
        const targetPosition = new THREE.Vector3(
          localTank.position.x,
          15, // Height above ground
          localTank.position.z + 15 // Behind the tank
        )
        
        const lookAtPosition = new THREE.Vector3(
          localTank.position.x,
          0,
          localTank.position.z
        )
        
        // Smooth interpolation
        camera.position.lerp(targetPosition, 0.05)
        camera.lookAt(lookAtPosition)
      }
    }
  })

  return (
    <>
      {/* Player Controls - Always active when connected */}
      {isConnected && <PlayerControls />}

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
      />

      {/* Ground */}
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.1, 0]}>
        <planeGeometry args={[GAME_CONFIG.MAP_SIZE * 2, GAME_CONFIG.MAP_SIZE * 2]} />
        <meshStandardMaterial color={COLORS.TERRAIN_COLOR} />
      </mesh>

      {/* Map Boundaries */}
      <MapBoundaries />

      {/* Obstacles */}
      <ObstacleRenderer obstacles={obstacles} />

      {/* Demo Content - show if not connected to MultiSynq or no game state */}
      {(!isConnected || !gameState) && (
        <>
          {/* Demo Tanks */}
          <SimpleTank position={[0, 0, 0]} color="#ff6b6b" />
          <SimpleTank position={[10, 0, 10]} color="#4ecdc4" />
          <SimpleTank position={[-10, 0, -10]} color="#45b7d1" />
          
          {/* Demo Monsters */}
          <SimpleMonster position={[15, 2, 0]} />
          <SimpleMonster position={[-15, 2, 5]} />
          <SimpleMonster position={[0, 2, 20]} />
          <SimpleMonster position={[5, 2, -15]} />
          
          {/* Demo instructions */}
          <mesh position={[0, 5, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="yellow" />
          </mesh>
        </>
      )}

      {/* Real Game Entities (when connected) */}
      {isConnected && gameState && (
        <>
          {/* Player Tanks with full interactivity */}
          {Array.from(gameState.players.values()).map((tank) => (
            <ControllableTank 
              key={tank.viewId || tank.id}
              tank={tank}
              isLocalPlayer={tank.address === connectedUser?.address}
            />
          ))}

          {/* Interactive Monsters */}
          {Array.from(gameState.monsters.values()).map((monster) => (
            <ControllableMonster 
              key={monster.id}
              monster={monster}
            />
          ))}

          {/* Bullets with trails */}
          {Array.from(gameState.bullets.values()).map((bullet) => (
            <BulletTrail 
              key={bullet.id}
              bullet={bullet}
            />
          ))}

          {/* Explosion effects manager */}
          <ExplosionManager />
        </>
      )}
    </>
  )
}

// Map boundaries component
const MapBoundaries: React.FC = () => {
  const mapSize = GAME_CONFIG.MAP_SIZE
  const wallHeight = 5
  const wallThickness = 1

  return (
    <group>
      {/* North Wall */}
      <mesh position={[0, wallHeight/2, mapSize/2]} castShadow>
        <boxGeometry args={[mapSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* South Wall */}
      <mesh position={[0, wallHeight/2, -mapSize/2]} castShadow>
        <boxGeometry args={[mapSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* East Wall */}
      <mesh position={[mapSize/2, wallHeight/2, 0]} castShadow>
        <boxGeometry args={[wallThickness, wallHeight, mapSize]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* West Wall */}
      <mesh position={[-mapSize/2, wallHeight/2, 0]} castShadow>
        <boxGeometry args={[wallThickness, wallHeight, mapSize]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
    </group>
  )
}

export default GameScene