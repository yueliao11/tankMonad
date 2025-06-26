import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useGameStore } from '@/store/gameStore'

// Touch Control Types
interface TouchPoint {
  id: number
  x: number
  y: number
  startX: number
  startY: number
  startTime: number
}

interface JoystickState {
  x: number // -1 to 1
  y: number // -1 to 1
  distance: number // 0 to 1
  angle: number // radians
  active: boolean
}

// Mobile Controls Component
const MobileControls: React.FC = () => {
  const { isConnected } = useGameStore()
  const [isVisible, setIsVisible] = useState(false)
  
  // Movement joystick state
  const [movementJoystick, setMovementJoystick] = useState<JoystickState>({
    x: 0, y: 0, distance: 0, angle: 0, active: false
  })
  
  // Turret/aim joystick state
  const [aimJoystick, setAimJoystick] = useState<JoystickState>({
    x: 0, y: 0, distance: 0, angle: 0, active: false
  })
  
  // Touch tracking
  const activeTouches = useRef<Map<number, TouchPoint>>(new Map())
  const movementTouchId = useRef<number | null>(null)
  const aimTouchId = useRef<number | null>(null)
  
  // Control settings
  const [settings, setSettings] = useState({
    joystickDeadZone: 0.1,
    joystickSensitivity: 1.0,
    hapticFeedback: true,
    showTouchIndicators: true,
    autoHide: true,
    fireButtonPosition: 'right' as 'left' | 'right'
  })

  // Detect if mobile device
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1)
  }, [])

  // Show/hide controls based on device and activity
  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false)
      return
    }

    setIsVisible(true)

    if (settings.autoHide) {
      let hideTimeout: NodeJS.Timeout
      
      const resetTimeout = () => {
        clearTimeout(hideTimeout)
        hideTimeout = setTimeout(() => {
          if (!movementJoystick.active && !aimJoystick.active) {
            setIsVisible(false)
          }
        }, 5000)
      }

      const showControls = () => {
        setIsVisible(true)
        resetTimeout()
      }

      document.addEventListener('touchstart', showControls)
      document.addEventListener('touchmove', showControls)
      
      resetTimeout()

      return () => {
        clearTimeout(hideTimeout)
        document.removeEventListener('touchstart', showControls)
        document.removeEventListener('touchmove', showControls)
      }
    }
  }, [isMobile, settings.autoHide, movementJoystick.active, aimJoystick.active])

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!settings.hapticFeedback || !navigator.vibrate) return
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    }
    
    navigator.vibrate(patterns[type])
  }, [settings.hapticFeedback])

  // Calculate joystick state from touch position
  const calculateJoystickState = useCallback((
    touchX: number,
    touchY: number,
    centerX: number,
    centerY: number,
    maxRadius: number
  ): JoystickState => {
    const deltaX = touchX - centerX
    const deltaY = touchY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const angle = Math.atan2(deltaY, deltaX)
    
    const clampedDistance = Math.min(distance, maxRadius)
    const normalizedDistance = clampedDistance / maxRadius
    
    // Apply dead zone
    const adjustedDistance = normalizedDistance < settings.joystickDeadZone 
      ? 0 
      : (normalizedDistance - settings.joystickDeadZone) / (1 - settings.joystickDeadZone)
    
    const x = adjustedDistance * Math.cos(angle) * settings.joystickSensitivity
    const y = adjustedDistance * Math.sin(angle) * settings.joystickSensitivity
    
    return {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
      distance: adjustedDistance,
      angle,
      active: distance > 0
    }
  }, [settings.joystickDeadZone, settings.joystickSensitivity])

  // Touch event handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    
    Array.from(event.changedTouches).forEach(touch => {
      const rect = (event.currentTarget as Element).getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      const touchPoint: TouchPoint = {
        id: touch.identifier,
        x,
        y,
        startX: x,
        startY: y,
        startTime: Date.now()
      }
      
      activeTouches.current.set(touch.identifier, touchPoint)
      
      // Determine which joystick this touch controls
      const screenWidth = rect.width
      const isLeftSide = x < screenWidth / 2
      
      if (isLeftSide && movementTouchId.current === null) {
        movementTouchId.current = touch.identifier
        triggerHaptic('light')
      } else if (!isLeftSide && aimTouchId.current === null) {
        aimTouchId.current = touch.identifier
        triggerHaptic('light')
      }
    })
  }, [triggerHaptic])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint = activeTouches.current.get(touch.identifier)
      if (!touchPoint) return
      
      const rect = (event.currentTarget as Element).getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      touchPoint.x = x
      touchPoint.y = y
      
      const maxRadius = 60 // Joystick radius in pixels
      
      // Update movement joystick
      if (touch.identifier === movementTouchId.current) {
        const joystickState = calculateJoystickState(
          x, y, touchPoint.startX, touchPoint.startY, maxRadius
        )
        setMovementJoystick(joystickState)
      }
      
      // Update aim joystick
      if (touch.identifier === aimTouchId.current) {
        const joystickState = calculateJoystickState(
          x, y, touchPoint.startX, touchPoint.startY, maxRadius
        )
        setAimJoystick(joystickState)
      }
    })
  }, [calculateJoystickState])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchPoint = activeTouches.current.get(touch.identifier)
      if (!touchPoint) return
      
      activeTouches.current.delete(touch.identifier)
      
      // Check for tap (quick touch)
      const duration = Date.now() - touchPoint.startTime
      const distance = Math.sqrt(
        Math.pow(touch.clientX - touchPoint.startX, 2) +
        Math.pow(touch.clientY - touchPoint.startY, 2)
      )
      
      const isTap = duration < 300 && distance < 20
      
      // Reset joysticks
      if (touch.identifier === movementTouchId.current) {
        movementTouchId.current = null
        setMovementJoystick({ x: 0, y: 0, distance: 0, angle: 0, active: false })
        
        if (isTap) {
          // Tap on movement area - maybe toggle run mode or quick action
          triggerHaptic('medium')
        }
      }
      
      if (touch.identifier === aimTouchId.current) {
        aimTouchId.current = null
        setAimJoystick({ x: 0, y: 0, distance: 0, angle: 0, active: false })
        
        if (isTap) {
          // Tap on aim area - fire weapon
          // TODO: Trigger weapon fire
          triggerHaptic('heavy')
        }
      }
    })
  }, [triggerHaptic])

  // Render joystick
  const renderJoystick = (
    joystick: JoystickState,
    position: 'left' | 'right',
    label: string
  ) => {
    const size = 120
    const knobSize = 40
    const maxOffset = (size - knobSize) / 2
    
    const knobX = joystick.x * maxOffset
    const knobY = joystick.y * maxOffset
    
    const opacity = joystick.active ? 0.8 : 0.5
    
    return (
      <div 
        className={`absolute ${position === 'left' ? 'left-4' : 'right-4'} bottom-20`}
        style={{ opacity }}
      >
        <div className="relative">
          {/* Joystick base */}
          <div 
            className="rounded-full border-2 border-white/40 bg-black/30 backdrop-blur-sm"
            style={{ width: size, height: size }}
          >
            {/* Joystick knob */}
            <div 
              className="absolute rounded-full bg-white/60 border-2 border-white/80 transition-all duration-75"
              style={{
                width: knobSize,
                height: knobSize,
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`
              }}
            />
            
            {/* Center dot */}
            <div 
              className="absolute w-2 h-2 bg-white/80 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Directional indicators */}
            {settings.showTouchIndicators && (
              <>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">
                  ↑
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">
                  ↓
                </div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
                  ←
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
                  →
                </div>
              </>
            )}
          </div>
          
          {/* Label */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white/70 text-xs font-medium">
            {label}
          </div>
          
          {/* Status indicator */}
          {joystick.active && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    )
  }

  // Don't render on desktop or if not connected
  if (!isMobile || !isConnected || !isVisible) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-30"
      style={{ touchAction: 'none' }}
    >
      {/* Touch capture overlay */}
      <div 
        className="absolute inset-0 pointer-events-auto opacity-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
      
      {/* Movement joystick (left) */}
      {renderJoystick(movementJoystick, 'left', 'MOVE')}
      
      {/* Aim joystick (right) */}
      {renderJoystick(aimJoystick, 'right', 'AIM')}
      
      {/* Action buttons */}
      <div className="absolute right-4 bottom-4 flex flex-col space-y-2">
        {/* Fire button */}
        <button 
          className="w-16 h-16 bg-red-600/80 hover:bg-red-500/80 rounded-full border-2 border-white/40 backdrop-blur-sm
                     flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-all"
          onTouchStart={(e) => {
            e.preventDefault()
            triggerHaptic('heavy')
            // TODO: Start firing
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            // TODO: Stop firing
          }}
        >
          🔥
        </button>
        
        {/* Weapon switch button */}
        <button 
          className="w-12 h-12 bg-blue-600/80 hover:bg-blue-500/80 rounded-full border-2 border-white/40 backdrop-blur-sm
                     flex items-center justify-center text-white font-bold text-sm active:scale-95 transition-all"
          onTouchStart={(e) => {
            e.preventDefault()
            triggerHaptic('medium')
            // TODO: Switch weapon
          }}
        >
          🔄
        </button>
        
        {/* Reload button */}
        <button 
          className="w-12 h-12 bg-yellow-600/80 hover:bg-yellow-500/80 rounded-full border-2 border-white/40 backdrop-blur-sm
                     flex items-center justify-center text-white font-bold text-sm active:scale-95 transition-all"
          onTouchStart={(e) => {
            e.preventDefault()
            triggerHaptic('medium')
            // TODO: Reload weapon
          }}
        >
          🔄
        </button>
      </div>
      
      {/* Settings button */}
      <button 
        className="absolute top-4 right-4 w-10 h-10 bg-gray-600/80 hover:bg-gray-500/80 rounded-full border-2 border-white/40 backdrop-blur-sm
                   flex items-center justify-center text-white text-sm active:scale-95 transition-all"
        onClick={() => {
          // TODO: Open mobile settings
          triggerHaptic('light')
        }}
      >
        ⚙️
      </button>
      
      {/* Touch indicators */}
      {settings.showTouchIndicators && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs text-center">
          <div>Left: Move • Right: Aim & Tap to Fire</div>
          <div>Red: Fire • Blue: Switch Weapon • Yellow: Reload</div>
        </div>
      )}
      
      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-16 left-4 text-white/70 text-xs font-mono bg-black/50 p-2 rounded">
          <div>Move: ({movementJoystick.x.toFixed(2)}, {movementJoystick.y.toFixed(2)}) {movementJoystick.distance.toFixed(2)}</div>
          <div>Aim: ({aimJoystick.x.toFixed(2)}, {aimJoystick.y.toFixed(2)}) {aimJoystick.distance.toFixed(2)}</div>
          <div>Active Touches: {activeTouches.current.size}</div>
        </div>
      )}
    </div>
  )
}

export default MobileControls