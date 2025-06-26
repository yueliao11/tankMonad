import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Obstacle } from '@/lib/physics'

interface ObstacleRendererProps {
  obstacles: Obstacle[]
}

const ObstacleRenderer: React.FC<ObstacleRendererProps> = ({ obstacles }) => {
  // Memoize materials to avoid recreating them on every render
  const materials = useMemo(() => ({
    concrete: new THREE.MeshStandardMaterial({ 
      color: '#666666',
      roughness: 0.8,
      metalness: 0.1 
    }),
    metal: new THREE.MeshStandardMaterial({ 
      color: '#888888',
      roughness: 0.3,
      metalness: 0.8 
    }),
    wood: new THREE.MeshStandardMaterial({ 
      color: '#8B4513',
      roughness: 0.9,
      metalness: 0.0 
    }),
    stone: new THREE.MeshStandardMaterial({ 
      color: '#A0A0A0',
      roughness: 0.7,
      metalness: 0.1 
    }),
  }), [])

  const getObstacleColor = (obstacle: Obstacle) => {
    if (!obstacle.destructible) return materials[obstacle.material].color

    const healthPercent = (obstacle.health || 0) / (obstacle.maxHealth || 1)
    
    // Damage visualization
    if (healthPercent > 0.6) return materials[obstacle.material].color
    if (healthPercent > 0.3) return new THREE.Color('#CC6600') // Orange when damaged
    return new THREE.Color('#CC0000') // Red when critically damaged
  }

  return (
    <>
      {obstacles.map((obstacle) => (
        <ObstacleComponent key={obstacle.id} obstacle={obstacle} materials={materials} />
      ))}
    </>
  )
}

interface ObstacleComponentProps {
  obstacle: Obstacle
  materials: Record<string, THREE.MeshStandardMaterial>
}

const ObstacleComponent: React.FC<ObstacleComponentProps> = ({ obstacle, materials }) => {
  const material = materials[obstacle.material]
  const healthPercent = (obstacle.health || 0) / (obstacle.maxHealth || 1)
  
  // Create damaged material if needed
  const currentMaterial = useMemo(() => {
    if (!obstacle.destructible || healthPercent > 0.6) {
      return material
    }
    
    const damagedMaterial = material.clone()
    if (healthPercent > 0.3) {
      damagedMaterial.color = new THREE.Color('#CC6600') // Orange
    } else {
      damagedMaterial.color = new THREE.Color('#CC0000') // Red
    }
    
    return damagedMaterial
  }, [material, healthPercent, obstacle.destructible])

  const renderObstacleGeometry = () => {
    switch (obstacle.type) {
      case 'bunker':
        return (
          <group>
            {/* Main structure */}
            <mesh 
              position={[0, obstacle.size.height / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[
                obstacle.size.width,
                obstacle.size.height,
                obstacle.size.depth
              ]} />
              <primitive object={currentMaterial} />
            </mesh>
            
            {/* Entrance */}
            <mesh 
              position={[0, obstacle.size.height / 4, obstacle.size.depth / 2 + 0.1]} 
              castShadow
            >
              <boxGeometry args={[
                obstacle.size.width * 0.3,
                obstacle.size.height * 0.5,
                0.2
              ]} />
              <meshStandardMaterial color="#222222" />
            </mesh>

            {/* Corner reinforcements */}
            {[-1, 1].map(x => 
              [-1, 1].map(z => (
                <mesh
                  key={`${x}-${z}`}
                  position={[
                    x * obstacle.size.width * 0.4,
                    obstacle.size.height * 0.75,
                    z * obstacle.size.depth * 0.4
                  ]}
                  castShadow
                >
                  <cylinderGeometry args={[0.2, 0.3, obstacle.size.height * 0.5, 8]} />
                  <primitive object={currentMaterial} />
                </mesh>
              ))
            ).flat()}
          </group>
        )

      case 'cover':
      case 'destructible':
        return (
          <group>
            <mesh 
              position={[0, obstacle.size.height / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[
                obstacle.size.width,
                obstacle.size.height,
                obstacle.size.depth
              ]} />
              <primitive object={currentMaterial} />
            </mesh>

            {/* Add some detail based on material */}
            {obstacle.material === 'wood' && (
              // Wood planks effect
              <>
                {Array.from({ length: 3 }, (_, i) => (
                  <mesh
                    key={i}
                    position={[0, (i - 1) * obstacle.size.height * 0.3, obstacle.size.depth / 2 + 0.01]}
                    castShadow
                  >
                    <boxGeometry args={[obstacle.size.width * 0.9, 0.1, 0.05]} />
                    <meshStandardMaterial color="#5D4E37" />
                  </mesh>
                ))}
              </>
            )}

            {obstacle.material === 'metal' && (
              // Metal rivets
              <>
                {[-1, 1].map(x =>
                  [-1, 1].map(z => (
                    <mesh
                      key={`${x}-${z}`}
                      position={[
                        x * obstacle.size.width * 0.3,
                        obstacle.size.height * 0.7,
                        z * obstacle.size.depth * 0.4
                      ]}
                      castShadow
                    >
                      <sphereGeometry args={[0.05, 8, 8]} />
                      <meshStandardMaterial color="#444444" metalness={1} />
                    </mesh>
                  ))
                ).flat()}
              </>
            )}
          </group>
        )

      case 'wall':
        return (
          <mesh 
            position={[0, obstacle.size.height / 2, 0]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[
              obstacle.size.width,
              obstacle.size.height,
              obstacle.size.depth
            ]} />
            <primitive object={currentMaterial} />
          </mesh>
        )

      default:
        return (
          <mesh 
            position={[0, obstacle.size.height / 2, 0]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[
              obstacle.size.width,
              obstacle.size.height,
              obstacle.size.depth
            ]} />
            <primitive object={currentMaterial} />
          </mesh>
        )
    }
  }

  return (
    <group position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}>
      {renderObstacleGeometry()}
      
      {/* Health indicator for destructible obstacles */}
      {obstacle.destructible && obstacle.health !== undefined && (
        <group position={[0, obstacle.size.height + 0.5, 0]}>
          {/* Health bar background */}
          <mesh>
            <planeGeometry args={[2, 0.2]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.8} />
          </mesh>
          
          {/* Health bar fill */}
          <mesh position={[-(1 - healthPercent), 0, 0.01]}>
            <planeGeometry args={[2 * healthPercent, 0.15]} />
            <meshBasicMaterial 
              color={healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFAA00' : '#FF0000'} 
              transparent 
              opacity={0.9} 
            />
          </mesh>
        </group>
      )}

      {/* Damage effects */}
      {obstacle.destructible && healthPercent < 0.5 && (
        <>
          {/* Smoke effect */}
          <mesh position={[0, obstacle.size.height + 1, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial 
              color="#555555" 
              transparent 
              opacity={0.3 * (1 - healthPercent)} 
            />
          </mesh>
          
          {/* Debris particles */}
          {Array.from({ length: Math.floor((1 - healthPercent) * 5) }, (_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * obstacle.size.width,
                Math.random() * obstacle.size.height,
                (Math.random() - 0.5) * obstacle.size.depth
              ]}
            >
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

export default ObstacleRenderer