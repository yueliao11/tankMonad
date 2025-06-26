import * as Multisynq from '@multisynq/client'
import { Player, Position } from '@/types'
import { GAME_CONFIG } from '@/lib/gameConfig'

interface TankConfig {
  viewId: string
  address: string
  color: string
  gameModel: any
}

class TankModel extends Multisynq.Model implements Player {
  id: string = ''
  viewId: string = ''
  address: string = ''
  position: Position = { x: 0, y: 0, z: 0 }
  rotation: number = 0
  health: number = GAME_CONFIG.PLAYER_MAX_HEALTH
  maxHealth: number = GAME_CONFIG.PLAYER_MAX_HEALTH
  score: number = 0
  color: string = '#ffffff'
  isAlive: boolean = true
  lastShot: number = 0
  kills: number = 0
  inputsLocked: boolean = false
  
  // Movement state
  velocity: { x: number; z: number } = { x: 0, z: 0 }
  
  // Input state
  private inputState = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    mouseX: 0,
    mouseY: 0,
  }
  
  // Reference to game model
  private gameModel: any

  init(config: TankConfig) {
    this.id = this.id || Math.random().toString(36).substr(2, 9)
    this.viewId = config.viewId
    this.address = config.address
    this.color = config.color
    this.gameModel = config.gameModel
    
    // Random spawn position
    const mapSize = GAME_CONFIG.MAP_SIZE
    this.position = {
      x: (this.random() - 0.5) * mapSize * 0.3, // Spawn in center area
      y: 0,
      z: (this.random() - 0.5) * mapSize * 0.3,
    }
    
    this.rotation = this.random() * Math.PI * 2
    
    // Subscribe to input events for this player
    // Use address as scope for input events
    console.log(`🔔 TankModel subscribing to events for address: ${this.address}`)
    this.subscribe(this.address, 'input', 'onInput')
    this.subscribe(this.address, 'shoot', 'onShoot')
    console.log(`✅ Event subscriptions created successfully`)
    
    console.log(`🏗️ Tank created for ${this.address} at`, this.position)
  }

  onInput(input: any) {
    console.log(`🎮 TankModel.onInput for ${this.address}:`, input)
    console.log(`📊 Current state: alive=${this.isAlive}, locked=${this.inputsLocked}`)
    
    if (!this.isAlive || this.inputsLocked) {
      console.log(`❌ Input rejected: alive=${this.isAlive}, locked=${this.inputsLocked}`)
      return
    }
    
    const oldState = { ...this.inputState }
    this.inputState = { ...this.inputState, ...input }
    
    console.log(`🔄 Input state updated:`, {
      old: oldState,
      new: this.inputState,
      change: input
    })
  }

  onShoot(data: { direction: { x: number; z: number } }) {
    console.log(`🔫 TankModel.onShoot for ${this.address}:`, data)
    console.log(`📊 Shoot state: alive=${this.isAlive}, locked=${this.inputsLocked}`)
    
    if (!this.isAlive || this.inputsLocked) {
      console.log(`❌ Shoot rejected: alive=${this.isAlive}, locked=${this.inputsLocked}`)
      return
    }
    
    const now = this.now()
    if (now - this.lastShot < GAME_CONFIG.SHOOT_COOLDOWN) {
      console.log(`❌ Shoot rejected: cooldown (${now - this.lastShot}ms < ${GAME_CONFIG.SHOOT_COOLDOWN}ms)`)
      return // Still in cooldown
    }
    
    this.lastShot = now
    
    // Calculate bullet spawn position (front of tank)
    const spawnDistance = 1.5
    const bulletPosition = {
      x: this.position.x + Math.cos(this.rotation) * spawnDistance,
      y: this.position.y + 0.5,
      z: this.position.z + Math.sin(this.rotation) * spawnDistance,
    }
    
    console.log(`✅ Spawning bullet at:`, bulletPosition)
    
    // Spawn bullet
    this.gameModel.spawnBullet(this.viewId, bulletPosition, data.direction)
    
    // Publish shoot event for effects
    this.publish('tank', 'fired', {
      tankId: this.id,
      position: bulletPosition,
    })
    
    console.log(`🎯 Bullet spawned successfully`)
  }

  update() {
    if (!this.isAlive) return
    
    // Only update movement if inputs are not locked
    if (!this.inputsLocked) {
      this.updateMovement()
      this.updateRotation()
    }
    
    this.applyPhysics()
    this.checkBounds()
  }

  updateMovement() {
    const { moveForward, moveBackward, moveLeft, moveRight } = this.inputState
    
    // Only log if we have actual movement commands
    if (moveForward || moveBackward || moveLeft || moveRight) {
      if (Math.random() < 0.1) { // Only 10% of the time to reduce spam
        console.log(`🚶 Movement active:`, { forward: moveForward, backward: moveBackward, left: moveLeft, right: moveRight })
      }
    }
    
    const speed = GAME_CONFIG.PLAYER_SPEED
    const deltaTime = 1 / 20 // 20 FPS
    
    // Calculate movement direction based on tank rotation
    let moveX = 0
    let moveZ = 0
    
    if (moveForward) {
      moveX += Math.cos(this.rotation)
      moveZ += Math.sin(this.rotation)
    }
    if (moveBackward) {
      moveX -= Math.cos(this.rotation) * 0.5 // Slower reverse
      moveZ -= Math.sin(this.rotation) * 0.5
    }
    if (moveLeft) {
      moveX += Math.cos(this.rotation - Math.PI / 2)
      moveZ += Math.sin(this.rotation - Math.PI / 2)
    }
    if (moveRight) {
      moveX += Math.cos(this.rotation + Math.PI / 2)
      moveZ += Math.sin(this.rotation + Math.PI / 2)
    }
    
    // Normalize movement vector
    const magnitude = Math.sqrt(moveX * moveX + moveZ * moveZ)
    if (magnitude > 0) {
      moveX = (moveX / magnitude) * speed * deltaTime
      moveZ = (moveZ / magnitude) * speed * deltaTime
      
      console.log(`🏃 Tank moving:`, {
        moveVector: { x: moveX, z: moveZ },
        magnitude,
        speed,
        deltaTime
      })
    }
    
    // Apply movement to velocity
    this.velocity.x = moveX
    this.velocity.z = moveZ
  }

  updateRotation() {
    // For now, use WASD for rotation, later we can add mouse look
    const { moveLeft, moveRight } = this.inputState
    const rotationSpeed = 0.05
    
    if (moveLeft && !moveRight) {
      this.rotation -= rotationSpeed
    } else if (moveRight && !moveLeft) {
      this.rotation += rotationSpeed
    }
    
    // Normalize rotation
    while (this.rotation > Math.PI) this.rotation -= 2 * Math.PI
    while (this.rotation < -Math.PI) this.rotation += 2 * Math.PI
  }

  applyPhysics() {
    // Apply velocity to position
    this.position.x += this.velocity.x
    this.position.z += this.velocity.z
    
    // Apply friction
    this.velocity.x *= 0.9
    this.velocity.z *= 0.9
  }

  checkBounds() {
    const mapSize = GAME_CONFIG.MAP_SIZE
    const halfSize = mapSize / 2
    
    // Keep tank within bounds
    this.position.x = Math.max(-halfSize, Math.min(halfSize, this.position.x))
    this.position.z = Math.max(-halfSize, Math.min(halfSize, this.position.z))
  }

  takeDamage(amount: number) {
    if (!this.isAlive) return
    
    this.health = Math.max(0, this.health - amount)
    
    if (this.health <= 0) {
      this.die()
    }
    
    // Publish damage event
    this.publish('tank', 'damaged', {
      tankId: this.id,
      health: this.health,
      damage: amount,
    })
  }

  die() {
    this.isAlive = false
    
    // Publish death event
    this.publish('tank', 'died', {
      tankId: this.id,
      finalScore: this.score,
    })
    
    // Respawn after 5 seconds
    this.future(5000).respawn()
  }

  respawn() {
    if (!this.gameModel.isActive) return
    
    this.isAlive = true
    this.health = this.maxHealth
    
    // Random respawn position
    const mapSize = GAME_CONFIG.MAP_SIZE
    this.position = {
      x: (this.random() - 0.5) * mapSize * 0.3,
      y: 0,
      z: (this.random() - 0.5) * mapSize * 0.3,
    }
    
    this.velocity = { x: 0, z: 0 }
    
    // Publish respawn event
    this.publish('tank', 'respawned', {
      tankId: this.id,
      position: this.position,
    })
  }

  addScore(points: number) {
    this.score += points
    
    // Publish score event
    this.publish('tank', 'scored', {
      tankId: this.id,
      score: this.score,
      points: points,
    })
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount)
  }
  
  // Round system methods
  resetForNewRound() {
    this.isAlive = true
    this.health = this.maxHealth
    this.score = 0
    this.kills = 0
    this.inputsLocked = false
    this.lastShot = 0
    this.velocity = { x: 0, z: 0 }
    
    // Random respawn position
    const mapSize = GAME_CONFIG.MAP_SIZE
    this.position = {
      x: (this.random() - 0.5) * mapSize * 0.3,
      y: 0,
      z: (this.random() - 0.5) * mapSize * 0.3,
    }
    this.rotation = this.random() * Math.PI * 2
    
    // Reset input state
    this.inputState = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      mouseX: 0,
      mouseY: 0,
    }
    
    console.log(`Tank ${this.address} reset for new round`)
  }
  
  lockInputs() {
    this.inputsLocked = true
    
    // Clear current input state
    this.inputState = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      mouseX: 0,
      mouseY: 0,
    }
    
    console.log(`Tank ${this.address} inputs locked`)
  }
  
  recordKill() {
    this.kills++
    this.addScore(100) // +100 points for kill
    
    console.log(`Tank ${this.address} recorded kill #${this.kills}`)
  }

  destroy() {
    // Cleanup subscriptions
    this.unsubscribeAll()
    super.destroy()
  }
}

TankModel.register('TankModel')

export default TankModel