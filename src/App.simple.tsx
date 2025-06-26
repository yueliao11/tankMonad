import React, { useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

function SimpleApp() {
  const { isConnected, address } = useAccount()
  const [gameStarted, setGameStarted] = useState(false)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-2">
              🚗 TANK BATTLE
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Multiplayer Real-time Combat
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>Powered by Monad</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Connect Wallet
              </h2>
              <p className="text-gray-400">
                Connect your wallet to join the battle
              </p>
            </div>
            
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>🎮 Real-time multiplayer tank combat</p>
            <p>⏱️ 3-minute battle rounds</p>
            <p>🏆 Score points by eliminating monsters</p>
            <p>🔗 Synchronized via MultiSynq network</p>
          </div>
        </div>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white">
            Ready to Battle!
          </h2>
          <p className="text-gray-400">
            Connected as: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          
          <button
            onClick={() => setGameStarted(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Game
          </button>

          <div className="text-xs text-gray-600 space-y-1">
            <p>MultiSynq integration: Ready</p>
            <p>3D Graphics: Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Placeholder game area */}
      <div className="relative w-full h-full">
        {/* Game HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">❤️</span>
                <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full transition-all duration-300" />
                </div>
                <span className="text-sm text-white/90">100/100</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">🏆</span>
                <span className="text-lg font-bold text-white">0</span>
              </div>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">⏰</span>
              <span className="text-2xl font-mono font-bold text-white">3:00</span>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-orange-500">🎯</span>
                <span className="text-sm text-white/90">Monsters:</span>
                <span className="text-lg font-bold text-white">10</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">👥</span>
                <span className="text-sm text-white/90">Players:</span>
                <span className="text-lg font-bold text-white">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-6 h-6 border-2 border-white/80 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white/80 rounded-full"></div>
          </div>
        </div>

        {/* Game area placeholder */}
        <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">🚗</div>
            <h3 className="text-2xl font-bold">3D Scene Loading...</h3>
            <p className="text-gray-400">
              The full 3D game will render here once all dependencies are loaded
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <p>WASD - Move tank</p>
              <p>Mouse - Aim and shoot</p>
              <p>Space - Brake</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="space-y-1 text-xs text-gray-300">
            <div>WASD - Move</div>
            <div>Mouse - Aim & Shoot</div>
            <div>Space - Brake</div>
          </div>
        </div>

        {/* Simple leaderboard */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-xs">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/90">Leaderboard</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">You</span>
                <span className="text-white font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleApp