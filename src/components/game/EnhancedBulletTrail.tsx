import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Projectile, WeaponType, AmmoType } from '@/lib/weaponSystem'

interface EnhancedBulletTrailProps {
  projectile: Projectile
}

const EnhancedBulletTrail: React.FC<EnhancedBulletTrailProps> = ({ projectile }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Line>(null)
  const explosionRef = useRef<THREE.Group>(null)

  // Create different geometries and materials based on weapon type
  const { geometry, material, trailMaterial } = useMemo(() => {
    switch (projectile.weaponType) {
      case WeaponType.CANNON:
        return {
          geometry: new THREE.SphereGeometry(0.15, 8, 8),
          material: new THREE.MeshStandardMaterial({ 
            color: getAmmoColor(projectile.ammoType),
            emissive: getAmmoColor(projectile.ammoType),
            emissiveIntensity: 0.3
          }),
          trailMaterial: new THREE.LineBasicMaterial({ 
            color: getAmmoColor(projectile.ammoType),
            transparent: true,
            opacity: 0.6
          })
        }

      case WeaponType.MACHINE_GUN:
        return {
          geometry: new THREE.SphereGeometry(0.05, 6, 6),
          material: new THREE.MeshBasicMaterial({ 
            color: '#FFFF00',
            transparent: true,
            opacity: 0.9
          }),
          trailMaterial: new THREE.LineBasicMaterial({ 
            color: '#FFAA00',
            transparent: true,
            opacity: 0.4
          })
        }

      case WeaponType.ROCKET:
        return {
          geometry: new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8),
          material: new THREE.MeshStandardMaterial({ 
            color: '#FF4444',
            emissive: '#FF2222',
            emissiveIntensity: 0.5
          }),
          trailMaterial: new THREE.LineBasicMaterial({ 
            color: '#FF8800',
            transparent: true,
            opacity: 0.8
          })
        }

      case WeaponType.PLASMA:
        return {
          geometry: new THREE.SphereGeometry(0.12, 12, 12),
          material: new THREE.MeshBasicMaterial({ 
            color: '#00FFFF',
            transparent: true,
            opacity: 0.8
          }),
          trailMaterial: new THREE.LineBasicMaterial({ 
            color: '#0088FF',
            transparent: true,
            opacity: 0.7
          })
        }

      case WeaponType.SHOTGUN:
        return {
          geometry: new THREE.SphereGeometry(0.03, 4, 4),
          material: new THREE.MeshBasicMaterial({ 
            color: '#FFAA00'
          }),
          trailMaterial: new THREE.LineBasicMaterial({ 
            color: '#FF8800',
            transparent: true,
            opacity: 0.3
          })
        }

      case WeaponType.SNIPER:
        return {
          geometry: new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8),
          material: new THREE.MeshStandardMaterial({ 
            color: '#FFFFFF',
            emissive: '#CCCCCC',
            emissiveIntensity: 0.4,
            metalness: 0.8
          }),
          trailMaterial: new THREE.LineBasicMaterial({ 
            color: '#FFFFFF',
            transparent: true,
            opacity: 0.9
          })
        }

      default:
        return {
          geometry: new THREE.SphereGeometry(0.1, 8, 8),
          material: new THREE.MeshBasicMaterial({ color: '#FFFF00' }),
          trailMaterial: new THREE.LineBasicMaterial({ 
            color: '#FFAA00',
            transparent: true,
            opacity: 0.5
          })
        }
    }
  }, [projectile.weaponType, projectile.ammoType])

  // Create trail geometry from trail positions
  const trailGeometry = useMemo(() => {
    const points = projectile.trail.map(pos => new THREE.Vector3(pos.x, pos.y, pos.z))
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [projectile.trail])

  // Animation and effects
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update projectile position
      meshRef.current.position.set(
        projectile.position.x,
        projectile.position.y,
        projectile.position.z
      )

      // Rotation animation for certain projectiles
      if (projectile.weaponType === WeaponType.ROCKET || projectile.weaponType === WeaponType.SNIPER) {
        meshRef.current.rotation.z += delta * 10
      }

      // Plasma glow effect
      if (projectile.weaponType === WeaponType.PLASMA) {
        const glowIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 20) * 0.3
        ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity
      }

      // EMP electricity effect
      if (projectile.ammoType === AmmoType.EMP) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 30) * 0.2)
      }
    }

    // Update trail
    if (trailRef.current && projectile.trail.length > 1) {
      const points = projectile.trail.map(pos => new THREE.Vector3(pos.x, pos.y, pos.z))
      trailRef.current.geometry.setFromPoints(points)
    }
  })

  // Explosion effect when projectile explodes
  useEffect(() => {
    if (projectile.hasExploded && explosionRef.current) {
      // Create explosion particles
      createExplosionEffect(explosionRef.current, projectile)
    }
  }, [projectile.hasExploded])

  return (
    <group>
      {/* Main projectile */}
      {!projectile.hasExploded && (
        <mesh ref={meshRef} geometry={geometry} material={material} />
      )}

      {/* Trail */}
      {projectile.trail.length > 1 && !projectile.hasExploded && (
        <line ref={trailRef} geometry={trailGeometry} material={trailMaterial} />
      )}

      {/* Special effects */}
      {projectile.weaponType === WeaponType.ROCKET && !projectile.hasExploded && (
        <RocketTrail position={[projectile.position.x, projectile.position.y, projectile.position.z]} />
      )}

      {projectile.ammoType === AmmoType.INCENDIARY && (
        <FireEffect position={[projectile.position.x, projectile.position.y, projectile.position.z]} />
      )}

      {/* Explosion effects */}
      {projectile.hasExploded && (
        <group ref={explosionRef} position={[projectile.position.x, projectile.position.y, projectile.position.z]}>
          <ExplosionEffect 
            splashRadius={projectile.splashRadius}
            weaponType={projectile.weaponType}
            ammoType={projectile.ammoType}
          />
        </group>
      )}
    </group>
  )
}

// Rocket trail effect
const RocketTrail: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Smoke trail */}
      <mesh position={[0, 0, -0.5]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial 
          color="#666666" 
          transparent 
          opacity={0.4} 
        />
      </mesh>
      
      {/* Fire trail */}
      <mesh position={[0, 0, -0.3]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial 
          color="#FF4400" 
          transparent 
          opacity={0.6} 
        />
      </mesh>
    </group>
  )
}

// Fire effect for incendiary rounds
const FireEffect: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const fireRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (fireRef.current) {
      fireRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 15) * 0.3)
      fireRef.current.rotation.y += 0.1
    }
  })

  return (
    <mesh ref={fireRef} position={position}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial 
        color="#FF6600" 
        transparent 
        opacity={0.7} 
      />
    </mesh>
  )
}

// Explosion effect component
const ExplosionEffect: React.FC<{ 
  splashRadius: number
  weaponType: WeaponType
  ammoType: AmmoType 
}> = ({ splashRadius, weaponType, ammoType }) => {
  const explosionRef = useRef<THREE.Group>(null)
  const [particleCount] = React.useState(
    Math.min(50, Math.max(10, splashRadius * 5))
  )

  useFrame((state, delta) => {
    if (explosionRef.current) {
      // Expand explosion
      const scale = Math.min(3, state.clock.elapsedTime * 5)
      explosionRef.current.scale.setScalar(scale)
      
      // Fade out
      explosionRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = Math.max(0, 1 - state.clock.elapsedTime * 2)
        }
      })
    }
  })

  return (
    <group ref={explosionRef}>
      {/* Main explosion sphere */}
      <mesh>
        <sphereGeometry args={[splashRadius, 16, 16]} />
        <meshBasicMaterial 
          color={getExplosionColor(weaponType, ammoType)}
          transparent 
          opacity={0.8} 
        />
      </mesh>

      {/* Shockwave ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[splashRadius * 0.8, splashRadius * 1.2, 16]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.6} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Particle debris */}
      {Array.from({ length: particleCount }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * splashRadius * 2,
            Math.random() * splashRadius,
            (Math.random() - 0.5) * splashRadius * 2
          ]}
        >
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshBasicMaterial 
            color="#FF8800" 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      ))}

      {/* Special effects based on ammo type */}
      {ammoType === AmmoType.EMP && (
        <EMPExplosionEffect radius={splashRadius} />
      )}
      
      {ammoType === AmmoType.INCENDIARY && (
        <FireExplosionEffect radius={splashRadius} />
      )}
    </group>
  )
}

// EMP explosion effect
const EMPExplosionEffect: React.FC<{ radius: number }> = ({ radius }) => {
  return (
    <>
      {/* Electric arcs */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          rotation={[0, (i * Math.PI * 2) / 8, 0]}
          position={[radius * 0.7, 0, 0]}
        >
          <cylinderGeometry args={[0.02, 0.02, radius, 4]} />
          <meshBasicMaterial 
            color="#00FFFF" 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      ))}
    </>
  )
}

// Fire explosion effect
const FireExplosionEffect: React.FC<{ radius: number }> = ({ radius }) => {
  return (
    <>
      {/* Fire particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * radius * 1.5,
            Math.random() * radius * 0.5,
            (Math.random() - 0.5) * radius * 1.5
          ]}
        >
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#FF4400" : "#FF8800"} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      ))}
    </>
  )
}

// Helper functions
function getAmmoColor(ammoType: AmmoType): string {
  switch (ammoType) {
    case AmmoType.ARMOR_PIERCING: return '#CCCCCC'
    case AmmoType.HIGH_EXPLOSIVE: return '#FF4444'
    case AmmoType.INCENDIARY: return '#FF6600'
    case AmmoType.EMP: return '#00FFFF'
    case AmmoType.CLUSTER: return '#FFAA00'
    default: return '#FFFF00'
  }
}

function getExplosionColor(weaponType: WeaponType, ammoType: AmmoType): string {
  if (ammoType === AmmoType.EMP) return '#00FFFF'
  if (ammoType === AmmoType.INCENDIARY) return '#FF4400'
  if (weaponType === WeaponType.PLASMA) return '#00AAFF'
  return '#FF8800'
}

function createExplosionEffect(group: THREE.Group, projectile: Projectile) {
  // This function could be expanded to create more complex particle systems
  // For now, it's handled by the ExplosionEffect component
}

export default EnhancedBulletTrail