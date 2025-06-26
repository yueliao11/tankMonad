import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGameStore } from '@/store/gameStore'
import GameHUD from './GameHUD'
import GameScene from './GameScene'
import ConnectionStatus from './ConnectionStatus'
import MultiSynqProvider from './MultiSynqProvider'
import DebugOverlay from '@/components/ui/DebugOverlay'
import MobileControls from './MobileControls'

const GameScreen: React.FC = () => {
  const { isConnected } = useGameStore()

  if (!isConnected) {
    return <MultiSynqProvider />
  }

  return (
    <div className="relative w-full h-full overflow-hidden game-ui">
      {/* 3D Game Scene */}
      <Canvas
        className="game-canvas"
        camera={{
          position: [0, 15, 15],
          fov: 60,
          near: 0.1,
          far: 200,
        }}
        shadows
        onCreated={({ gl }) => {
          gl.setSize(window.innerWidth, window.innerHeight)
          gl.shadowMap.enabled = true
          gl.shadowMap.type = 2 // PCFSoftShadowMap
        }}
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>

      {/* Game HUD Overlay */}
      <GameHUD />

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Debug Overlay for Control Testing */}
      <DebugOverlay />

      {/* Mobile Controls */}
      <MobileControls />
    </div>
  )
}

export default GameScreen