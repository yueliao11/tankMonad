import * as Multisynq from '@multisynq/client'
// Note: Cannot import React hooks in MultiSynq view
// import { useGameStore } from '@/store/gameStore'
import { InputState } from '@/types'
import TankGameModel from '../models/TankGameModel'

class TankGameView extends Multisynq.View {
  private gameModel: TankGameModel
  private inputState: InputState = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    shoot: false,
    mouseX: 0,
    mouseY: 0,
  }
  
  private keys: { [key: string]: boolean } = {}
  private mouseButtons: { [button: number]: boolean } = {}

  constructor(model: TankGameModel) {
    super(model)
    this.gameModel = model
    
    console.log('TankGameView initialized')
    
    // Setup input handlers
    this.setupInputHandlers()
    
    // Subscribe to game events
    this.subscribeToGameEvents()
    
    // Update game store
    this.updateGameStore()
    
    // Start update loop
    this.startUpdateLoop()
  }

  setupInputHandlers() {
    // Keyboard input
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))
    
    // Mouse input
    document.addEventListener('mousedown', this.onMouseDown.bind(this))
    document.addEventListener('mouseup', this.onMouseUp.bind(this))
    document.addEventListener('mousemove', this.onMouseMove.bind(this))
    
    // Disable context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault())
    
    // Handle window focus
    window.addEventListener('blur', this.onWindowBlur.bind(this))
  }

  onKeyDown(event: KeyboardEvent) {
    const key = event.code.toLowerCase()
    if (this.keys[key]) return // Already pressed
    
    this.keys[key] = true
    this.updateInputFromKeys()
    
    // Prevent default for game keys
    if (['keyw', 'keya', 'keys', 'keyd', 'space'].includes(key)) {
      event.preventDefault()
    }
  }

  onKeyUp(event: KeyboardEvent) {
    const key = event.code.toLowerCase()
    this.keys[key] = false
    this.updateInputFromKeys()
  }

  onMouseDown(event: MouseEvent) {
    this.mouseButtons[event.button] = true
    
    if (event.button === 0) { // Left click
      this.inputState.shoot = true
      this.sendShootInput()
    }
    
    event.preventDefault()
  }

  onMouseUp(event: MouseEvent) {
    this.mouseButtons[event.button] = false
    
    if (event.button === 0) { // Left click
      this.inputState.shoot = false
    }
  }

  onMouseMove(event: MouseEvent) {
    this.inputState.mouseX = event.clientX
    this.inputState.mouseY = event.clientY
  }

  onWindowBlur() {
    // Clear all inputs when window loses focus
    this.keys = {}
    this.mouseButtons = {}
    this.inputState = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      shoot: false,
      mouseX: this.inputState.mouseX,
      mouseY: this.inputState.mouseY,
    }
    this.sendInputToModel()
  }

  updateInputFromKeys() {
    const newInputState = {
      moveForward: this.keys['keyw'] || this.keys['arrowup'] || false,
      moveBackward: this.keys['keys'] || this.keys['arrowdown'] || false,
      moveLeft: this.keys['keya'] || this.keys['arrowleft'] || false,
      moveRight: this.keys['keyd'] || this.keys['arrowright'] || false,
      shoot: this.inputState.shoot,
      mouseX: this.inputState.mouseX,
      mouseY: this.inputState.mouseY,
    }
    
    // Only send if changed
    if (this.hasInputChanged(newInputState)) {
      this.inputState = newInputState
      this.sendInputToModel()
    }
  }

  hasInputChanged(newState: InputState): boolean {
    return (
      newState.moveForward !== this.inputState.moveForward ||
      newState.moveBackward !== this.inputState.moveBackward ||
      newState.moveLeft !== this.inputState.moveLeft ||
      newState.moveRight !== this.inputState.moveRight
    )
  }

  sendInputToModel() {
    // Send input to our tank model
    this.publish(this.viewId, 'input', this.inputState)
  }

  sendShootInput() {
    // Calculate shoot direction from mouse position or tank facing
    const tank = this.gameModel.players.get(this.viewId)
    if (!tank || !tank.isAlive) return
    
    // For now, shoot in the direction the tank is facing
    const direction = {
      x: Math.cos(tank.rotation),
      z: Math.sin(tank.rotation),
    }
    
    this.publish(this.viewId, 'shoot', { direction })
  }

  subscribeToGameEvents() {
    // Game state events
    this.subscribe('game', 'state-update', this.onGameStateUpdate.bind(this))
    this.subscribe('game', 'game-ended', this.onGameEnded.bind(this))
    this.subscribe('game', 'player-joined', this.onPlayerJoined.bind(this))
    this.subscribe('game', 'player-left', this.onPlayerLeft.bind(this))
    
    // Tank events
    this.subscribe('tank', 'damaged', this.onTankDamaged.bind(this))
    this.subscribe('tank', 'died', this.onTankDied.bind(this))
    this.subscribe('tank', 'respawned', this.onTankRespawned.bind(this))
    this.subscribe('tank', 'scored', this.onTankScored.bind(this))
    this.subscribe('tank', 'fired', this.onTankFired.bind(this))
    
    // Monster events
    this.subscribe('monster', 'attacked', this.onMonsterAttacked.bind(this))
    this.subscribe('monster', 'died', this.onMonsterDied.bind(this))
    
    // Bullet events
    this.subscribe('bullet', 'exploded', this.onBulletExploded.bind(this))
  }

  onGameStateUpdate(data: any) {
    // Publish to React components via window events
    window.dispatchEvent(new CustomEvent('game-state-update', { detail: data }))
  }

  onGameEnded(data: any) {
    console.log('Game ended:', data)
    window.dispatchEvent(new CustomEvent('game-ended', { detail: data }))
  }

  onPlayerJoined(data: any) {
    console.log('Player joined:', data)
    window.dispatchEvent(new CustomEvent('player-joined', { detail: data }))
  }

  onPlayerLeft(data: any) {
    console.log('Player left:', data)
    window.dispatchEvent(new CustomEvent('player-left', { detail: data }))
  }

  onTankDamaged(data: any) {
    console.log('Tank damaged:', data)
    window.dispatchEvent(new CustomEvent('tank-damaged', { detail: data }))
  }

  onTankDied(data: any) {
    console.log('Tank died:', data)
    window.dispatchEvent(new CustomEvent('tank-died', { detail: data }))
  }

  onTankRespawned(data: any) {
    console.log('Tank respawned:', data)
    window.dispatchEvent(new CustomEvent('tank-respawned', { detail: data }))
  }

  onTankScored(data: any) {
    console.log('Tank scored:', data)
    window.dispatchEvent(new CustomEvent('tank-scored', { detail: data }))
  }

  onTankFired(data: any) {
    console.log('Tank fired:', data)
    // Could play sound effect
  }

  onMonsterAttacked(data: any) {
    console.log('Monster attacked:', data)
  }

  onMonsterDied(data: any) {
    console.log('Monster died:', data)
  }

  onBulletExploded(data: any) {
    console.log('Bullet exploded:', data)
    // Could trigger visual effect
  }

  updateGameStore() {
    // Send game state to React components via window events
    window.dispatchEvent(new CustomEvent('game-state-changed', { 
      detail: this.gameModel.getGameState() 
    }))
  }

  startUpdateLoop() {
    // Update at 60 FPS for smooth visuals
    this.updateLoop()
  }

  updateLoop() {
    // Update game store with current model state
    this.updateGameStore()
    
    // Update our tank's HUD data
    const tank = this.gameModel.players.get(this.viewId)
    if (tank) {
      window.dispatchEvent(new CustomEvent('hud-update', { 
        detail: {
          health: tank.health,
          score: tank.score,
        }
      }))
    }
    
    // Schedule next update
    this.future(16).updateLoop() // ~60 FPS
  }

  update(_time: number) {
    // This is called by the framework, but we use our own update loop
  }

  detach() {
    // Clean up event listeners
    document.removeEventListener('keydown', this.onKeyDown.bind(this))
    document.removeEventListener('keyup', this.onKeyUp.bind(this))
    document.removeEventListener('mousedown', this.onMouseDown.bind(this))
    document.removeEventListener('mouseup', this.onMouseUp.bind(this))
    document.removeEventListener('mousemove', this.onMouseMove.bind(this))
    window.removeEventListener('blur', this.onWindowBlur.bind(this))
    
    super.detach()
  }
}

export default TankGameView