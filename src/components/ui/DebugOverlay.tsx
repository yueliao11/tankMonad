import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

interface DebugInfo {
  sessionConnected: boolean
  userConnected: boolean
  gameState: string | null
  controlsActive: boolean
  lastInputTime: number
  playerCount: number
  bulletCount: number
  monsterCount: number
}

const DebugOverlay: React.FC = () => {
  const { session, isConnected, connectedUser, gameState } = useGameStore()
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    sessionConnected: false,
    userConnected: false,
    gameState: null,
    controlsActive: false,
    lastInputTime: 0,
    playerCount: 0,
    bulletCount: 0,
    monsterCount: 0
  })
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        sessionConnected: !!session,
        userConnected: !!connectedUser,
        gameState: gameState?.gameState || null,
        controlsActive: !!(session && connectedUser),
        lastInputTime: Date.now(),
        playerCount: gameState?.players?.size || 0,
        bulletCount: gameState?.bullets?.size || 0,
        monsterCount: gameState?.monsters?.size || 0
      })
    }

    updateDebugInfo()
    const interval = setInterval(updateDebugInfo, 1000)
    return () => clearInterval(interval)
  }, [session, connectedUser, gameState])

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed top-4 left-4 z-50 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm"
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed top-16 left-4 z-40 bg-black bg-opacity-80 text-white p-4 rounded max-w-xs">
          <h3 className="text-lg font-bold mb-2">Debug Info</h3>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Session:</span>
              <span className={debugInfo.sessionConnected ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.sessionConnected ? '✓ Connected' : '✗ Disconnected'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>User:</span>
              <span className={debugInfo.userConnected ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.userConnected ? '✓ Authenticated' : '✗ Not Auth'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Game State:</span>
              <span className="text-blue-400">
                {debugInfo.gameState || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Controls:</span>
              <span className={debugInfo.controlsActive ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.controlsActive ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Players:</span>
              <span className="text-yellow-400">{debugInfo.playerCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Monsters:</span>
              <span className="text-orange-400">{debugInfo.monsterCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Bullets:</span>
              <span className="text-cyan-400">{debugInfo.bulletCount}</span>
            </div>
          </div>

          {connectedUser && (
            <div className="mt-3 pt-2 border-t border-gray-600">
              <div className="text-xs text-gray-300">
                <div>Address: {connectedUser.address.slice(0, 8)}...</div>
                <div>Color: <span style={{ color: connectedUser.color }}>■</span> {connectedUser.color}</div>
              </div>
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400">
              Press F to toggle this panel
            </div>
          </div>
        </div>
      )}

      {/* Control Instructions */}
      {isConnected && (
        <div className="fixed bottom-4 left-4 z-40 bg-black bg-opacity-70 text-white p-3 rounded max-w-sm">
          <h4 className="font-bold text-sm mb-2">Game Controls</h4>
          <div className="text-xs space-y-1">
            <div><span className="font-mono bg-gray-700 px-1 rounded">WASD</span> or <span className="font-mono bg-gray-700 px-1 rounded">Arrow Keys</span> - Move tank</div>
            <div><span className="font-mono bg-gray-700 px-1 rounded">Mouse Click</span> or <span className="font-mono bg-gray-700 px-1 rounded">Space</span> - Shoot</div>
            <div><span className="font-mono bg-gray-700 px-1 rounded">Mouse Move</span> - Aim direction</div>
          </div>
          
          {gameState?.gameState === 'waiting' && (
            <div className="mt-2 text-yellow-400 text-xs">
              ⏳ Single player game ready! Start fighting monsters!
            </div>
          )}
          
          {gameState?.gameState === 'playing' && (
            <div className="mt-2 text-green-400 text-xs">
              🎮 Game active! Time remaining: {Math.ceil((gameState.timeRemaining || 0) / 1000)}s
            </div>
          )}
        </div>
      )}
    </>
  )
}

// Keyboard shortcut to toggle debug panel
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F' || e.key === 'f') {
      const debugButton = document.querySelector('button:contains("Debug")') as HTMLButtonElement
      if (debugButton) {
        debugButton.click()
      }
    }
  })
}

export default DebugOverlay