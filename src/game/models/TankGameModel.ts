import * as Multisynq from '@multisynq/client'
import { GameState, Player, Monster, Bullet, ViewData } from '@/types'
import { GAME_CONFIG, AI, NETWORK, GAME_STATES } from '@/lib/gameConfig'
import TankModel from './TankModel'
import MonsterModel from './MonsterModel'
import BulletModel from './BulletModel'

class TankGameModel extends Multisynq.Model {
  // Round-based game state
  gameState: string = GAME_STATES.WAITING
  roundStartTime: number = 0
  roundDuration: number = GAME_CONFIG.ROUND_SECONDS * 1000 // Convert to milliseconds
  
  // Legacy game state (for backward compatibility)
  isActive: boolean = false
  startTime: number = 0
  duration: number = GAME_CONFIG.GAME_DURATION
  
  // Entity collections
  players: Map<string, TankModel> = new Map()
  monsters: Map<string, MonsterModel> = new Map()
  bullets: Map<string, BulletModel> = new Map()
  
  // Game stats
  monstersKilled: number = 0
  totalMonsters: number = GAME_CONFIG.MONSTER_COUNT
  
  // Round system
  champion: string = '' // Address of current champion
  finalLeaderboard: any[] = []

  init() {
    console.log('TankGameModel initialized with round system')
    
    // Subscribe to player join/leave events
    this.subscribe(this.sessionId, 'view-join', 'onPlayerJoin')
    this.subscribe(this.sessionId, 'view-exit', 'onPlayerLeave')
    
    // Initialize round system
    this.startWaitingPhase()
    
    // Start unified game loop at 20 FPS
    this.unifiedGameLoop()
  }

  // Round System Methods
  startWaitingPhase() {
    this.gameState = GAME_STATES.WAITING
    this.isActive = false
    console.log('Waiting for players to join...')
    
    // Auto-start round when first player joins
    this.checkAutoStart()
  }
  
  checkAutoStart() {
    // Start round immediately when at least one player joins
    if (this.players.size > 0 && this.gameState === GAME_STATES.WAITING) {
      this.future(1000).startRound() // 1 second delay for immediate action
    }
  }
  
  startRound() {
    this.gameState = GAME_STATES.PLAYING
    this.isActive = true
    this.roundStartTime = this.now()
    this.startTime = this.roundStartTime // Legacy compatibility
    this.monstersKilled = 0
    this.champion = ''
    this.finalLeaderboard = []
    
    // Reset all players
    for (const tank of this.players.values()) {
      tank.resetForNewRound()
    }
    
    // Clear existing entities
    this.clearAllEntities()
    
    // Spawn initial monsters
    this.spawnMonsters()
    
    console.log(`Round started! Duration: ${GAME_CONFIG.ROUND_SECONDS} seconds`)
    
    // Publish round start event
    this.publish('game', 'round-started', {
      duration: GAME_CONFIG.ROUND_SECONDS,
      playerCount: this.players.size
    })
  }
  
  startGame() {
    // Legacy method for backward compatibility
    this.startRound()
  }

  onPlayerJoin(data: { viewId: string; viewData: ViewData }) {
    const { viewId, viewData } = data
    console.log('Player joined:', viewId, viewData)
    
    // Create new tank for player
    const tank = TankModel.create({
      viewId,
      address: viewData.address,
      color: viewData.color,
      gameModel: this,
    })
    
    this.players.set(viewId, tank)
    
    // Check auto-start for round system
    this.checkAutoStart()
    
    // Notify all players
    this.publish('game', 'player-joined', { 
      viewId, 
      playerCount: this.players.size,
      gameState: this.gameState
    })
  }

  onPlayerLeave(data: { viewId: string }) {
    const { viewId } = data
    console.log('Player left:', viewId)
    
    const tank = this.players.get(viewId)
    if (tank) {
      tank.destroy()
      this.players.delete(viewId)
      
      // Notify all players
      this.publish('game', 'player-left', { 
        viewId, 
        playerCount: this.players.size 
      })
    }
  }

  spawnMonsters() {
    const mapSize = GAME_CONFIG.MAP_SIZE
    
    for (let i = 0; i < this.totalMonsters; i++) {
      const monster = MonsterModel.create({
        gameModel: this,
        position: {
          x: (this.random() - 0.5) * mapSize * 0.8,
          y: 0,
          z: (this.random() - 0.5) * mapSize * 0.8,
        }
      })
      
      this.monsters.set(monster.id, monster)
    }
    
    console.log(`Spawned ${this.totalMonsters} monsters`)
  }

  spawnBullet(ownerId: string, position: any, direction: any) {
    const bullet = BulletModel.create({
      ownerId,
      position,
      direction,
      gameModel: this,
    })
    
    this.bullets.set(bullet.id, bullet)
    
    // Auto-cleanup after lifespan
    this.future(GAME_CONFIG.BULLET_LIFESPAN).removeBullet(bullet.id)
    
    return bullet
  }

  removeBullet(bulletId: string) {
    const bullet = this.bullets.get(bulletId)
    if (bullet) {
      bullet.destroy()
      this.bullets.delete(bulletId)
    }
  }

  removeMonster(monsterId: string) {
    const monster = this.monsters.get(monsterId)
    if (monster) {
      // Save position before destroying
      const position = monster.position
      
      monster.destroy()
      this.monsters.delete(monsterId)
      this.monstersKilled++
      
      // Respawn monster if game is still active
      if (this.isActive && this.getRemainingTime() > 30000) {
        this.future(2000).spawnNewMonster()
      }
      
      // Publish monster killed event with position for explosion effects
      this.publish('game', 'monster-killed', {
        monsterId,
        position,
        remaining: this.monsters.size
      })
    }
  }

  spawnNewMonster() {
    if (!this.isActive) return
    
    const mapSize = GAME_CONFIG.MAP_SIZE
    const monster = MonsterModel.create({
      gameModel: this,
      position: {
        x: (this.random() - 0.5) * mapSize * 0.8,
        y: 0,
        z: (this.random() - 0.5) * mapSize * 0.8,
      }
    })
    
    this.monsters.set(monster.id, monster)
  }

  unifiedGameLoop() {
    // Update all entities based on game state
    if (this.gameState === GAME_STATES.PLAYING) {
      this.updateEntities()
      this.checkCollisions()
      this.checkRoundEndConditions()
    }
    
    // Publish state update every tick
    this.publishStateUpdate()
    
    // Schedule next update at 20 FPS (50ms)
    this.future(NETWORK.TICK_MS).unifiedGameLoop()
  }
  
  updateEntities() {
    // Update all players
    for (const tank of this.players.values()) {
      tank.update()
    }
    
    // Update all monsters
    for (const monster of this.monsters.values()) {
      monster.update()
    }
    
    // Update all bullets
    for (const bullet of this.bullets.values()) {
      bullet.update()
    }
  }
  
  checkRoundEndConditions() {
    const timeRemaining = this.getRoundTimeRemaining()
    
    if (timeRemaining <= 0) {
      this.endRound()
    }
  }
  
  getRoundTimeRemaining(): number {
    if (this.gameState !== GAME_STATES.PLAYING) return 0
    const elapsed = this.now() - this.roundStartTime
    return Math.max(0, this.roundDuration - elapsed)
  }
  
  publishStateUpdate() {
    const timeRemaining = this.gameState === GAME_STATES.PLAYING ? this.getRoundTimeRemaining() : 0
    
    this.publish('game', 'state-update', {
      gameState: this.gameState,
      timeRemaining,
      roundTimeRemaining: timeRemaining,
      monstersRemaining: this.monsters.size,
      playersOnline: this.players.size,
      champion: this.champion,
      leaderboard: this.getCurrentLeaderboard()
    })
  }
  
  getCurrentLeaderboard() {
    return Array.from(this.players.values())
      .map(tank => ({
        address: tank.address,
        score: tank.score,
        isAlive: tank.isAlive,
        kills: tank.kills || 0
      }))
      .sort((a, b) => b.score - a.score)
  }
  
  gameLoop() {
    // Legacy method for backward compatibility
    this.unifiedGameLoop()
  }

  checkCollisions() {
    // Bullet vs Player collisions (PvP)
    for (const bullet of this.bullets.values()) {
      for (const tank of this.players.values()) {
        // Skip if bullet owner is same as target tank
        if (bullet.ownerId === tank.viewId || !tank.isAlive) continue
        
        if (this.checkCollision(bullet.position, tank.position, 1.2)) {
          // Get shooter tank
          const shooter = this.players.get(bullet.ownerId)
          
          // Apply damage
          const wasAlive = tank.isAlive
          tank.takeDamage(GAME_CONFIG.BULLET_DAMAGE) // -10HP damage
          
          // Check if this was a kill
          if (wasAlive && !tank.isAlive && shooter) {
            shooter.recordKill() // +100 points for kill
            
            // Publish kill event for effects
            this.publish('game', 'player-killed', {
              killer: shooter.address,
              victim: tank.address,
              killerScore: shooter.score,
              killerKills: shooter.kills,
              position: tank.position
            })
          } else {
            // Publish bullet hit event for explosion effects
            this.publish('game', 'bullet-hit', {
              position: bullet.position,
              target: 'player',
              targetId: tank.address
            })
          }
          
          // Remove bullet
          this.removeBullet(bullet.id)
          break
        }
      }
    }
    
    // Bullet vs Monster collisions
    for (const bullet of this.bullets.values()) {
      for (const monster of this.monsters.values()) {
        if (this.checkCollision(bullet.position, monster.position, 1.5)) {
          // Award points to bullet owner
          const tank = this.players.get(bullet.ownerId)
          if (tank) {
            tank.addScore(50) // 50 points for monster kill
          }
          
          // Check if monster will be killed
          const wasAlive = monster.isAlive
          
          // Damage monster
          monster.takeDamage(bullet.damage)
          
          // Publish appropriate event for explosion effects
          if (wasAlive && !monster.isAlive) {
            // Monster was killed - publish kill event
            this.publish('game', 'monster-killed', {
              monsterId: monster.id,
              position: monster.position,
              killer: tank?.address || bullet.ownerId
            })
          } else {
            // Monster was hit but not killed - publish hit event
            this.publish('game', 'bullet-hit', {
              position: bullet.position,
              target: 'monster',
              targetId: monster.id
            })
          }
          
          // Remove bullet
          this.removeBullet(bullet.id)
          break
        }
      }
    }
    
    // Monster vs Player collisions
    for (const monster of this.monsters.values()) {
      for (const tank of this.players.values()) {
        if (tank.isAlive && this.checkCollision(monster.position, tank.position, 2)) {
          tank.takeDamage(GAME_CONFIG.MONSTER_DAMAGE)
          monster.attack(tank.viewId)
        }
      }
    }
  }

  checkCollision(pos1: any, pos2: any, radius: number): boolean {
    const dx = pos1.x - pos2.x
    const dz = pos1.z - pos2.z
    const distance = Math.sqrt(dx * dx + dz * dz)
    return distance < radius
  }

  getRemainingTime(): number {
    const elapsed = this.now() - this.startTime
    return Math.max(0, this.duration - elapsed)
  }

  endRound() {
    // Lock game state
    this.gameState = GAME_STATES.FINISHED
    this.isActive = false
    
    // Calculate final leaderboard
    this.finalLeaderboard = this.getCurrentLeaderboard()
    
    // Crown the champion (highest scoring player)
    if (this.finalLeaderboard.length > 0) {
      this.champion = this.finalLeaderboard[0].address
    }
    
    console.log(`Round ended! Champion: ${this.champion}`)
    
    // Lock all player inputs
    for (const tank of this.players.values()) {
      tank.lockInputs()
    }
    
    // Publish round end event
    this.publish('game', 'round-ended', {
      champion: this.champion,
      leaderboard: this.finalLeaderboard,
      totalPlayers: this.players.size,
      monstersKilled: this.monstersKilled,
      roundDuration: GAME_CONFIG.ROUND_SECONDS
    })
    
    // Transition to results phase
    this.future(2000).showResults()
  }
  
  showResults() {
    this.gameState = GAME_STATES.RESULTS
    
    // Publish results display event
    this.publish('game', 'show-results', {
      champion: this.champion,
      leaderboard: this.finalLeaderboard,
      duration: 10000 // Show results for 10 seconds
    })
    
    // Schedule next round
    this.future(10000).startWaitingPhase()
  }
  
  clearAllEntities() {
    // Clear monsters
    for (const monster of this.monsters.values()) {
      monster.destroy()
    }
    this.monsters.clear()
    
    // Clear bullets
    for (const bullet of this.bullets.values()) {
      bullet.destroy()
    }
    this.bullets.clear()
  }
  
  endGame() {
    // Legacy method for backward compatibility
    this.endRound()
  }

  // Get game state for view
  getGameState(): GameState {
    return {
      // Round system state
      gameState: this.gameState,
      roundStartTime: this.roundStartTime,
      roundDuration: this.roundDuration,
      roundTimeRemaining: this.getRoundTimeRemaining(),
      champion: this.champion,
      finalLeaderboard: this.finalLeaderboard,
      
      // Legacy compatibility
      isActive: this.isActive,
      startTime: this.startTime,
      duration: this.duration,
      
      // Entity collections
      players: this.players,
      monsters: this.monsters,
      bullets: this.bullets,
      
      // Current leaderboard
      leaderboard: this.getCurrentLeaderboard(),
    }
  }
}

// Register the model with MultiSynq
TankGameModel.register('TankGameModel')

export default TankGameModel