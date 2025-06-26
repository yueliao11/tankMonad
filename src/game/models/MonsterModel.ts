import * as Multisynq from '@multisynq/client'
import { Monster, Position } from '@/types'
import { GAME_CONFIG, AI } from '@/lib/gameConfig'

interface MonsterConfig {
  gameModel: any
  position: Position
}

class MonsterModel extends Multisynq.Model implements Monster {
  id: string = ''
  position: Position = { x: 0, y: 0, z: 0 }
  rotation: number = 0
  health: number = GAME_CONFIG.MONSTER_HEALTH
  maxHealth: number = GAME_CONFIG.MONSTER_HEALTH
  state: 'idle' | 'chasing' | 'attacking' = 'idle'
  target?: string
  lastAttack: number = 0
  
  aiData = {
    wanderDirection: 0,
    lastDirectionChange: 0,
    detectionRadius: AI.MONSTER_DETECTION_RADIUS,
    attackRange: AI.MONSTER_ATTACK_RANGE,
  }
  
  // Movement
  velocity: { x: number; z: number } = { x: 0, z: 0 }
  
  // Reference to game model
  private gameModel: any

  init(config: MonsterConfig) {
    this.id = this.id || Math.random().toString(36).substr(2, 9)
    this.gameModel = config.gameModel
    this.position = config.position
    this.rotation = this.random() * Math.PI * 2
    this.aiData.wanderDirection = this.random() * Math.PI * 2
    this.aiData.lastDirectionChange = this.now()
    
    console.log(`Monster spawned at`, this.position)
  }

  update() {
    this.updateAI()
    this.updateMovement()
    this.applyPhysics()
    this.checkBounds()
  }

  updateAI() {
    const now = this.now()
    
    // Find nearest player
    const nearestPlayer = this.findNearestPlayer()
    
    if (nearestPlayer && nearestPlayer.distance < this.aiData.detectionRadius) {
      // Switch to chasing or attacking
      this.target = nearestPlayer.tank.viewId
      
      if (nearestPlayer.distance < this.aiData.attackRange) {
        this.state = 'attacking'
        this.attackTarget(nearestPlayer.tank)
      } else {
        this.state = 'chasing'
        this.chaseTarget(nearestPlayer.tank)
      }
    } else {
      // No target found, wander around
      this.state = 'idle'
      this.target = undefined
      this.wander(now)
    }
  }

  findNearestPlayer() {
    let nearest = null
    let minDistance = Infinity
    
    for (const tank of this.gameModel.players.values()) {
      if (!tank.isAlive) continue
      
      const dx = tank.position.x - this.position.x
      const dz = tank.position.z - this.position.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      
      if (distance < minDistance) {
        minDistance = distance
        nearest = { tank, distance }
      }
    }
    
    return nearest
  }

  wander(now: number) {
    // Change direction periodically
    if (now - this.aiData.lastDirectionChange > AI.MONSTER_DIRECTION_CHANGE_INTERVAL) {
      this.aiData.wanderDirection = this.random() * Math.PI * 2
      this.aiData.lastDirectionChange = now
    }
    
    // Move in wander direction
    const speed = GAME_CONFIG.MONSTER_SPEED * 0.5 // Slower when wandering
    this.velocity.x = Math.cos(this.aiData.wanderDirection) * speed * (1/20)
    this.velocity.z = Math.sin(this.aiData.wanderDirection) * speed * (1/20)
    
    this.rotation = this.aiData.wanderDirection
  }

  chaseTarget(tank: any) {
    // Calculate direction to target
    const dx = tank.position.x - this.position.x
    const dz = tank.position.z - this.position.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    
    if (distance > 0) {
      // Normalize direction
      const dirX = dx / distance
      const dirZ = dz / distance
      
      // Move towards target
      const speed = GAME_CONFIG.MONSTER_SPEED * AI.MONSTER_CHASE_SPEED_MULTIPLIER
      this.velocity.x = dirX * speed * (1/20)
      this.velocity.z = dirZ * speed * (1/20)
      
      // Face target
      this.rotation = Math.atan2(dz, dx)
    }
  }

  attackTarget(tank: any) {
    const now = this.now()
    
    // Check if can attack
    if (now - this.lastAttack < AI.MONSTER_ATTACK_COOLDOWN) {
      return
    }
    
    // Stop moving when attacking
    this.velocity.x = 0
    this.velocity.z = 0
    
    // Face target
    const dx = tank.position.x - this.position.x
    const dz = tank.position.z - this.position.z
    this.rotation = Math.atan2(dz, dx)
    
    // Perform attack
    this.attack(tank.viewId)
    this.lastAttack = now
  }

  attack(targetId: string) {
    const tank = this.gameModel.players.get(targetId)
    if (!tank || !tank.isAlive) return
    
    // Check if still in range
    const dx = tank.position.x - this.position.x
    const dz = tank.position.z - this.position.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    
    if (distance <= this.aiData.attackRange) {
      // Deal damage
      tank.takeDamage(GAME_CONFIG.MONSTER_DAMAGE)
      
      // Publish attack event
      this.publish('monster', 'attacked', {
        monsterId: this.id,
        targetId: targetId,
        damage: GAME_CONFIG.MONSTER_DAMAGE,
      })
    }
  }

  updateMovement() {
    // Movement is handled by AI logic
  }

  applyPhysics() {
    // Apply velocity to position
    this.position.x += this.velocity.x
    this.position.z += this.velocity.z
    
    // Apply friction
    this.velocity.x *= 0.8
    this.velocity.z *= 0.8
  }

  checkBounds() {
    const mapSize = GAME_CONFIG.MAP_SIZE
    const halfSize = mapSize / 2
    
    // Bounce off boundaries
    if (this.position.x > halfSize || this.position.x < -halfSize) {
      this.velocity.x = -this.velocity.x
      this.position.x = Math.max(-halfSize, Math.min(halfSize, this.position.x))
      this.aiData.wanderDirection = Math.PI - this.aiData.wanderDirection
    }
    
    if (this.position.z > halfSize || this.position.z < -halfSize) {
      this.velocity.z = -this.velocity.z
      this.position.z = Math.max(-halfSize, Math.min(halfSize, this.position.z))
      this.aiData.wanderDirection = -this.aiData.wanderDirection
    }
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount)
    
    // Publish damage event
    this.publish('monster', 'damaged', {
      monsterId: this.id,
      health: this.health,
      damage: amount,
    })
    
    if (this.health <= 0) {
      this.die()
    }
  }

  die() {
    // Publish death event
    this.publish('monster', 'died', {
      monsterId: this.id,
      position: this.position,
    })
    
    // Remove from game
    this.gameModel.removeMonster(this.id)
  }

  destroy() {
    super.destroy()
  }
}

MonsterModel.register('MonsterModel')

export default MonsterModel