import * as Multisynq from '@multisynq/client'
import { Bullet, Position } from '@/types'
import { GAME_CONFIG } from '@/lib/gameConfig'

interface BulletConfig {
  ownerId: string
  position: Position
  direction: { x: number; z: number }
  gameModel: any
}

class BulletModel extends Multisynq.Model implements Bullet {
  id: string = ''
  ownerId: string = ''
  position: Position = { x: 0, y: 0, z: 0 }
  velocity: any = { x: 0, y: 0, z: 0 }
  damage: number = GAME_CONFIG.BULLET_DAMAGE
  createdAt: number = 0
  lifespan: number = GAME_CONFIG.BULLET_LIFESPAN
  
  // Reference to game model
  private gameModel: any

  init(config: BulletConfig) {
    this.id = this.id || Math.random().toString(36).substr(2, 9)
    this.ownerId = config.ownerId
    this.position = { ...config.position }
    this.gameModel = config.gameModel
    this.createdAt = this.now()
    
    // Calculate velocity from direction
    const speed = GAME_CONFIG.BULLET_SPEED
    const magnitude = Math.sqrt(
      config.direction.x * config.direction.x + 
      config.direction.z * config.direction.z
    )
    
    if (magnitude > 0) {
      this.velocity = {
        x: (config.direction.x / magnitude) * speed,
        y: 0,
        z: (config.direction.z / magnitude) * speed,
      }
    } else {
      // Default forward direction if no direction provided
      this.velocity = { x: speed, y: 0, z: 0 }
    }
    
    console.log(`Bullet fired by ${this.ownerId} at`, this.position)
  }

  update() {
    // Move bullet
    const deltaTime = 1 / 20 // 20 FPS
    this.position.x += this.velocity.x * deltaTime
    this.position.z += this.velocity.z * deltaTime
    
    // Check if bullet has exceeded its lifespan
    if (this.now() - this.createdAt > this.lifespan) {
      this.destroy()
      return
    }
    
    // Check bounds
    this.checkBounds()
  }

  checkBounds() {
    const mapSize = GAME_CONFIG.MAP_SIZE
    const halfSize = mapSize / 2
    
    // Remove bullet if it goes out of bounds
    if (
      this.position.x > halfSize || this.position.x < -halfSize ||
      this.position.z > halfSize || this.position.z < -halfSize
    ) {
      this.gameModel.removeBullet(this.id)
    }
  }

  explode() {
    // Publish explosion event for visual effects
    this.publish('bullet', 'exploded', {
      bulletId: this.id,
      position: this.position,
      ownerId: this.ownerId,
    })
    
    // Remove bullet
    this.gameModel.removeBullet(this.id)
  }

  destroy() {
    super.destroy()
  }
}

BulletModel.register('BulletModel')

export default BulletModel