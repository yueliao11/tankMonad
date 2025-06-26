import * as THREE from 'three'
import { Position } from '@/types'
import { GAME_CONFIG } from './gameConfig'
// import { PHYSICS } from './gameConfig' // unused

// Collision Detection Utilities
export class CollisionSystem {
  private static mapBounds = {
    minX: -GAME_CONFIG.MAP_SIZE / 2,
    maxX: GAME_CONFIG.MAP_SIZE / 2,
    minZ: -GAME_CONFIG.MAP_SIZE / 2,
    maxZ: GAME_CONFIG.MAP_SIZE / 2,
  }

  // Check if position is within map boundaries
  static isWithinMapBounds(position: Position, radius: number = 1): boolean {
    return (
      position.x - radius > this.mapBounds.minX &&
      position.x + radius < this.mapBounds.maxX &&
      position.z - radius > this.mapBounds.minZ &&
      position.z + radius < this.mapBounds.maxZ
    )
  }

  // Clamp position to map boundaries
  static clampToMapBounds(position: Position, radius: number = 1): Position {
    return {
      x: Math.max(
        this.mapBounds.minX + radius,
        Math.min(this.mapBounds.maxX - radius, position.x)
      ),
      y: position.y,
      z: Math.max(
        this.mapBounds.minZ + radius,
        Math.min(this.mapBounds.maxZ - radius, position.z)
      ),
    }
  }

  // Distance between two positions
  static distance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    const dz = pos1.z - pos2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  // 2D distance (ignoring Y axis)
  static distance2D(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x
    const dz = pos1.z - pos2.z
    return Math.sqrt(dx * dx + dz * dz)
  }

  // Check if two circular entities collide
  static circleCollision(
    pos1: Position,
    radius1: number,
    pos2: Position,
    radius2: number
  ): boolean {
    return this.distance2D(pos1, pos2) < (radius1 + radius2)
  }

  // Box collision detection
  static boxCollision(
    pos1: Position,
    size1: { width: number; height: number; depth: number },
    pos2: Position,
    size2: { width: number; height: number; depth: number }
  ): boolean {
    return (
      Math.abs(pos1.x - pos2.x) < (size1.width + size2.width) / 2 &&
      Math.abs(pos1.y - pos2.y) < (size1.height + size2.height) / 2 &&
      Math.abs(pos1.z - pos2.z) < (size1.depth + size2.depth) / 2
    )
  }

  // Ray-box intersection for bullet collision
  static rayBoxIntersection(
    rayOrigin: Position,
    rayDirection: THREE.Vector3,
    boxCenter: Position,
    boxSize: { width: number; height: number; depth: number }
  ): { hit: boolean; distance?: number; point?: Position } {
    const ray = new THREE.Ray(
      new THREE.Vector3(rayOrigin.x, rayOrigin.y, rayOrigin.z),
      rayDirection.normalize()
    )

    const box = new THREE.Box3(
      new THREE.Vector3(
        boxCenter.x - boxSize.width / 2,
        boxCenter.y - boxSize.height / 2,
        boxCenter.z - boxSize.depth / 2
      ),
      new THREE.Vector3(
        boxCenter.x + boxSize.width / 2,
        boxCenter.y + boxSize.height / 2,
        boxCenter.z + boxSize.depth / 2
      )
    )

    const intersection = ray.intersectBox(box, new THREE.Vector3())
    
    if (intersection) {
      const distance = rayOrigin.x !== undefined ? 
        Math.sqrt(
          Math.pow(intersection.x - rayOrigin.x, 2) +
          Math.pow(intersection.y - rayOrigin.y, 2) +
          Math.pow(intersection.z - rayOrigin.z, 2)
        ) : 0

      return {
        hit: true,
        distance,
        point: { x: intersection.x, y: intersection.y, z: intersection.z }
      }
    }

    return { hit: false }
  }

  // Push entities apart when they collide
  static separateEntities(
    pos1: Position,
    pos2: Position,
    radius1: number,
    radius2: number,
    pushStrength: number = 1
  ): { pos1: Position; pos2: Position } {
    const distance = this.distance2D(pos1, pos2)
    const overlap = (radius1 + radius2) - distance

    if (overlap > 0) {
      const dx = pos2.x - pos1.x
      const dz = pos2.z - pos1.z
      const length = Math.sqrt(dx * dx + dz * dz)

      if (length > 0) {
        const normalX = dx / length
        const normalZ = dz / length
        const pushDistance = overlap * pushStrength * 0.5

        return {
          pos1: {
            ...pos1,
            x: pos1.x - normalX * pushDistance,
            z: pos1.z - normalZ * pushDistance,
          },
          pos2: {
            ...pos2,
            x: pos2.x + normalX * pushDistance,
            z: pos2.z + normalZ * pushDistance,
          },
        }
      }
    }

    return { pos1, pos2 }
  }
}

// Obstacle System
export interface Obstacle {
  id: string
  type: 'wall' | 'bunker' | 'destructible' | 'cover'
  position: Position
  size: { width: number; height: number; depth: number }
  health?: number
  maxHealth?: number
  destructible: boolean
  material: 'concrete' | 'metal' | 'wood' | 'stone'
}

export class ObstacleManager {
  private obstacles: Map<string, Obstacle> = new Map()

  constructor() {
    this.generateObstacles()
  }

  private generateObstacles() {
    // Generate some default obstacles
    const defaultObstacles: Omit<Obstacle, 'id'>[] = [
      // Central bunkers
      {
        type: 'bunker',
        position: { x: 0, y: 0, z: 0 },
        size: { width: 8, height: 3, depth: 8 },
        health: 200,
        maxHealth: 200,
        destructible: true,
        material: 'concrete'
      },
      
      // Corner defensive positions
      {
        type: 'cover',
        position: { x: 25, y: 0, z: 25 },
        size: { width: 4, height: 2, depth: 4 },
        health: 100,
        maxHealth: 100,
        destructible: true,
        material: 'stone'
      },
      {
        type: 'cover',
        position: { x: -25, y: 0, z: 25 },
        size: { width: 4, height: 2, depth: 4 },
        health: 100,
        maxHealth: 100,
        destructible: true,
        material: 'stone'
      },
      {
        type: 'cover',
        position: { x: 25, y: 0, z: -25 },
        size: { width: 4, height: 2, depth: 4 },
        health: 100,
        maxHealth: 100,
        destructible: true,
        material: 'stone'
      },
      {
        type: 'cover',
        position: { x: -25, y: 0, z: -25 },
        size: { width: 4, height: 2, depth: 4 },
        health: 100,
        maxHealth: 100,
        destructible: true,
        material: 'stone'
      },

      // Scattered cover
      {
        type: 'destructible',
        position: { x: 15, y: 0, z: 0 },
        size: { width: 2, height: 1.5, depth: 6 },
        health: 50,
        maxHealth: 50,
        destructible: true,
        material: 'wood'
      },
      {
        type: 'destructible',
        position: { x: -15, y: 0, z: 0 },
        size: { width: 2, height: 1.5, depth: 6 },
        health: 50,
        maxHealth: 50,
        destructible: true,
        material: 'wood'
      },
      {
        type: 'destructible',
        position: { x: 0, y: 0, z: 15 },
        size: { width: 6, height: 1.5, depth: 2 },
        health: 50,
        maxHealth: 50,
        destructible: true,
        material: 'wood'
      },
      {
        type: 'destructible',
        position: { x: 0, y: 0, z: -15 },
        size: { width: 6, height: 1.5, depth: 2 },
        health: 50,
        maxHealth: 50,
        destructible: true,
        material: 'wood'
      },
    ]

    defaultObstacles.forEach((obstacle, index) => {
      const id = `obstacle_${index}`
      this.obstacles.set(id, { ...obstacle, id })
    })
  }

  getObstacles(): Obstacle[] {
    return Array.from(this.obstacles.values())
  }

  getObstacle(id: string): Obstacle | undefined {
    return this.obstacles.get(id)
  }

  damageObstacle(id: string, damage: number): boolean {
    const obstacle = this.obstacles.get(id)
    if (!obstacle || !obstacle.destructible) return false

    obstacle.health = Math.max(0, (obstacle.health || 0) - damage)
    
    if (obstacle.health <= 0) {
      this.obstacles.delete(id)
      return true // Obstacle destroyed
    }

    return false // Obstacle damaged but not destroyed
  }

  checkCollisionWithObstacles(position: Position, radius: number): Obstacle | null {
    for (const obstacle of this.obstacles.values()) {
      if (CollisionSystem.circleCollision(
        position,
        radius,
        obstacle.position,
        Math.max(obstacle.size.width, obstacle.size.depth) / 2
      )) {
        return obstacle
      }
    }
    return null
  }

  // Find nearest cover to a position
  findNearestCover(position: Position, maxDistance: number = 20): Obstacle | null {
    let nearest: Obstacle | null = null
    let nearestDistance = maxDistance

    for (const obstacle of this.obstacles.values()) {
      const distance = CollisionSystem.distance2D(position, obstacle.position)
      if (distance < nearestDistance) {
        nearest = obstacle
        nearestDistance = distance
      }
    }

    return nearest
  }
}

// Advanced Movement System
export class MovementSystem {
  // Calculate movement with collision detection
  static calculateMovement(
    currentPos: Position,
    targetPos: Position,
    speed: number,
    deltaTime: number,
    entityRadius: number,
    obstacles: Obstacle[]
  ): Position {
    const direction = {
      x: targetPos.x - currentPos.x,
      z: targetPos.z - currentPos.z,
    }

    const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z)
    
    if (distance === 0) return currentPos

    // Normalize direction
    const normalizedDir = {
      x: direction.x / distance,
      z: direction.z / distance,
    }

    // Calculate intended movement
    const moveDistance = Math.min(distance, speed * deltaTime)
    const intendedPos = {
      x: currentPos.x + normalizedDir.x * moveDistance,
      y: currentPos.y,
      z: currentPos.z + normalizedDir.z * moveDistance,
    }

    // Check map boundaries
    const boundedPos = CollisionSystem.clampToMapBounds(intendedPos, entityRadius)

    // Check obstacle collisions
    for (const obstacle of obstacles) {
      if (CollisionSystem.circleCollision(
        boundedPos,
        entityRadius,
        obstacle.position,
        Math.max(obstacle.size.width, obstacle.size.depth) / 2
      )) {
        // Try sliding along obstacles
        const slidePos = this.calculateSlideMovement(
          currentPos,
          boundedPos,
          obstacle,
          entityRadius
        )
        return slidePos
      }
    }

    return boundedPos
  }

  // Calculate sliding movement around obstacles
  private static calculateSlideMovement(
    startPos: Position,
    _intendedPos: Position,
    obstacle: Obstacle,
    entityRadius: number
  ): Position {
    const obstacleRadius = Math.max(obstacle.size.width, obstacle.size.depth) / 2
    const totalRadius = entityRadius + obstacleRadius

    // Vector from obstacle center to start position
    const toStart = {
      x: startPos.x - obstacle.position.x,
      z: startPos.z - obstacle.position.z,
    }

    const toStartLength = Math.sqrt(toStart.x * toStart.x + toStart.z * toStart.z)
    
    if (toStartLength === 0) return startPos

    // Normalize
    const normal = {
      x: toStart.x / toStartLength,
      z: toStart.z / toStartLength,
    }

    // Position entity at safe distance from obstacle
    return {
      x: obstacle.position.x + normal.x * (totalRadius + 0.1),
      y: startPos.y,
      z: obstacle.position.z + normal.z * (totalRadius + 0.1),
    }
  }
}

export default {
  CollisionSystem,
  ObstacleManager,
  MovementSystem,
}