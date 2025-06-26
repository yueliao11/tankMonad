import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { formatTime } from '@/lib/utils'
import { Trophy, Heart, Target, Users, Clock } from 'lucide-react'
import WeaponHUD from './WeaponHUD'
import { WeaponSystem, WeaponType } from '@/lib/weaponSystem'

const GameHUD: React.FC = () => {
  const { hudData } = useGameStore()
  
  // Initialize weapon system for this player
  const [weaponSystem] = useState(() => new WeaponSystem(WeaponType.CANNON, WeaponType.MACHINE_GUN))
  const [showWeaponHUD] = useState(true)

  const healthPercentage = (hudData.health / hudData.maxHealth) * 100

  // Update weapon system
  useEffect(() => {
    const interval = setInterval(() => {
      weaponSystem.update(0.1) // Update every 100ms
    }, 100)

    return () => clearInterval(interval)
  }, [weaponSystem])

  return (
    <>
      {/* Top HUD - Game Info */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
        {/* Left Panel - Player Info */}
        <div className="hud-panel pointer-events-auto">
          <div className="flex items-center space-x-4">
            {/* Health */}
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    healthPercentage > 60 ? 'bg-green-500' :
                    healthPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
              <span className="hud-text">
                {hudData.health}/{hudData.maxHealth}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="hud-value">{hudData.score}</span>
            </div>
          </div>
        </div>

        {/* Center Panel - Timer */}
        <div className="hud-panel pointer-events-auto">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="hud-value text-2xl font-mono">
              {formatTime(hudData.timeRemaining)}
            </span>
          </div>
        </div>

        {/* Right Panel - Game Stats */}
        <div className="hud-panel pointer-events-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-500" />
              <span className="hud-text">Monsters:</span>
              <span className="hud-value">{hudData.monstersRemaining}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="hud-text">Players:</span>
              <span className="hud-value">{hudData.playersOnline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="w-6 h-6 border-2 border-white/80 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white/80 rounded-full"></div>
        </div>
      </div>

      {/* Weapon HUD */}
      {showWeaponHUD && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <WeaponHUD weaponSystem={weaponSystem} />
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-80 hud-panel pointer-events-none">
        <div className="space-y-1 text-xs">
          <div className="font-bold text-yellow-400 mb-2">🎮 Enhanced Controls:</div>
          <div className="text-gray-300">🔸 WASD / ↑↓←→ - Move Tank</div>
          <div className="text-gray-300">🔸 Mouse Click / Space - Shoot</div>
          <div className="text-gray-300">🔸 R - Reload Weapon</div>
          <div className="text-gray-300">🔸 1/2 - Switch Weapons</div>
          <div className="text-gray-300">🔸 Q - Quick Weapon Switch</div>
          <div className="text-cyan-400 mt-2 font-semibold">⚡ Advanced Weapons Ready!</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="absolute bottom-4 right-4 hud-panel pointer-events-auto max-w-xs">
        <div className="space-y-2">
          <h3 className="hud-text font-semibold">Leaderboard</h3>
          <div className="space-y-1">
            {/* This will be populated with actual leaderboard data */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">You</span>
              <span className="text-white font-medium">{hudData.score}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GameHUD