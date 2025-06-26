import React, { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'

interface ControlState {
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  mouseX: number
  mouseY: number
}

const PlayerControls: React.FC = () => {
  const { session, connectedUser } = useGameStore()
  const controlStateRef = useRef<ControlState>({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    mouseX: 0,
    mouseY: 0,
  })
  const lastInputRef = useRef<number>(0)

  // Send input to MultiSynq
  const sendInput = (inputChange: Partial<ControlState>) => {
    console.log('📤 sendInput called with:', inputChange)
    
    if (!session || !connectedUser?.address) {
      console.log('❌ Cannot send input: no session or user', { 
        session: !!session, 
        user: !!connectedUser,
        address: connectedUser?.address 
      })
      return
    }

    // Update local state
    const oldState = { ...controlStateRef.current }
    controlStateRef.current = { ...controlStateRef.current, ...inputChange }
    
    console.log('🔄 Control state change:', {
      old: oldState,
      new: controlStateRef.current,
      change: inputChange
    })
    
    // Throttle input sending to avoid spam (60 FPS max)
    const now = Date.now()
    if (now - lastInputRef.current < 16) {
      console.log('⏰ Input throttled (too frequent)')
      return // ~60 FPS
    }
    lastInputRef.current = now

    console.log('📡 Publishing input to address:', connectedUser.address)
    console.log('📊 Final input data:', controlStateRef.current)
    
    // Publish input to our tank model
    session.view?.publish(connectedUser.address, 'input', controlStateRef.current)
    console.log('✅ Input published successfully')
  }

  // Send shoot command
  const sendShoot = (direction: { x: number; z: number }) => {
    console.log('🔫 sendShoot called with direction:', direction)
    
    if (!session || !connectedUser?.address) {
      console.log('❌ Cannot shoot: no session or user', {
        session: !!session,
        user: !!connectedUser,
        address: connectedUser?.address
      })
      return
    }
    
    console.log('📡 Publishing shoot to address:', connectedUser.address)
    console.log('🎯 Shoot data:', { direction })
    
    session.view?.publish(connectedUser.address, 'shoot', { direction })
    console.log('✅ Shoot published successfully')
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('🎮 KeyDown Event:', e.code, 'Session:', !!session, 'User:', !!connectedUser)
      
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          console.log('⬆️ Forward key pressed')
          if (!controlStateRef.current.moveForward) {
            console.log('🔄 Sending moveForward: true')
            sendInput({ moveForward: true })
          } else {
            console.log('⚠️ Forward already pressed, ignoring')
          }
          break
        case 'KeyS':
        case 'ArrowDown':
          console.log('⬇️ Backward key pressed')
          if (!controlStateRef.current.moveBackward) {
            console.log('🔄 Sending moveBackward: true')
            sendInput({ moveBackward: true })
          } else {
            console.log('⚠️ Backward already pressed, ignoring')
          }
          break
        case 'KeyA':
        case 'ArrowLeft':
          console.log('⬅️ Left key pressed')
          if (!controlStateRef.current.moveLeft) {
            console.log('🔄 Sending moveLeft: true')
            sendInput({ moveLeft: true })
          } else {
            console.log('⚠️ Left already pressed, ignoring')
          }
          break
        case 'KeyD':
        case 'ArrowRight':
          console.log('➡️ Right key pressed')
          if (!controlStateRef.current.moveRight) {
            console.log('🔄 Sending moveRight: true')
            sendInput({ moveRight: true })
          } else {
            console.log('⚠️ Right already pressed, ignoring')
          }
          break
        case 'Space':
          console.log('🔫 Space key pressed - shooting!')
          e.preventDefault()
          // Shoot forward direction
          sendShoot({ x: 0, z: 1 })
          break
        default:
          console.log('❓ Unhandled key:', e.code)
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      console.log('🎮 KeyUp Event:', e.code)
      
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          console.log('🔄 Sending moveForward: false')
          sendInput({ moveForward: false })
          break
        case 'KeyS':
        case 'ArrowDown':
          console.log('🔄 Sending moveBackward: false')
          sendInput({ moveBackward: false })
          break
        case 'KeyA':
        case 'ArrowLeft':
          console.log('🔄 Sending moveLeft: false')
          sendInput({ moveLeft: false })
          break
        case 'KeyD':
        case 'ArrowRight':
          console.log('🔄 Sending moveRight: false')
          sendInput({ moveRight: false })
          break
        default:
          console.log('❓ Unhandled keyup:', e.code)
          break
      }
    }

    // Mouse controls
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1
      const mouseY = -(e.clientY / window.innerHeight) * 2 + 1
      
      // Only log occasionally to avoid spam
      if (Math.random() < 0.01) { // 1% chance to log
        console.log('🖱️ Mouse Move:', { mouseX: mouseX.toFixed(2), mouseY: mouseY.toFixed(2) })
      }
      
      sendInput({ mouseX, mouseY })
    }

    const handleMouseClick = (e: MouseEvent) => {
      console.log('🖱️ Mouse Click!', e.button, 'Session:', !!session, 'User:', !!connectedUser)
      e.preventDefault()
      
      // Calculate shoot direction based on mouse position
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1
      const mouseY = -(e.clientY / window.innerHeight) * 2 + 1
      
      console.log('🔫 Mouse shooting at:', { x: mouseX.toFixed(2), y: mouseY.toFixed(2) })
      
      // Simple forward shoot for now
      sendShoot({ x: mouseX * 0.5, z: 1 })
    }

    // Add event listeners
    console.log('🎮 PlayerControls: Adding event listeners')
    console.log('📊 Control State on mount:', {
      session: !!session,
      user: !!connectedUser,
      userAddress: connectedUser?.address
    })
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleMouseClick)

    console.log('✅ Event listeners added successfully')

    // Cleanup
    return () => {
      console.log('🧹 PlayerControls: Removing event listeners')
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleMouseClick)
    }
  }, [session, connectedUser])

  // This component doesn't render anything, it just handles input
  return null
}

export default PlayerControls