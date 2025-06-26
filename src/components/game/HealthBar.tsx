import React from 'react'
import { Html } from '@react-three/drei'
import { ArmorSystem } from '@/lib/armorSystem'

interface HealthBarProps {
  health: number
  maxHealth: number
  position: [number, number, number]
  label?: string
  isPlayer?: boolean
  armorSystem?: ArmorSystem
}

const HealthBar: React.FC<HealthBarProps> = ({ 
  health, 
  maxHealth, 
  position, 
  label,
  isPlayer = false,
  armorSystem
}) => {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100))
  const isLowHealth = healthPercent < 30
  const isDead = health <= 0

  // Get armor status if available
  const armorStatus = armorSystem?.getStatus()
  const hasShield = armorStatus && armorStatus.maxShield > 0
  const shieldPercentage = armorStatus ? armorStatus.shieldPercent : 0

  const getArmorColor = () => {
    if (!armorStatus) return 'text-gray-400'
    
    switch (armorStatus.armorType) {
      case 'light': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'heavy': return 'text-gray-400'
      case 'reactive': return 'text-red-400'
      case 'composite': return 'text-blue-400'
      case 'energy': return 'text-cyan-400'
      default: return 'text-gray-400'
    }
  }

  const getArmorIcon = () => {
    if (!armorStatus) return '🛡️'
    
    switch (armorStatus.armorType) {
      case 'light': return '🟢'
      case 'medium': return '🟡'
      case 'heavy': return '⚫'
      case 'reactive': return '🔴'
      case 'composite': return '🔵'
      case 'energy': return '🔷'
      default: return '🛡️'
    }
  }

  return (
    <Html position={[position[0], position[1] + 3, position[2]]} center>
      <div className="flex flex-col items-center pointer-events-none">
        {/* Label */}
        {label && (
          <div className={`text-xs font-bold mb-1 px-2 py-0.5 rounded ${
            isPlayer 
              ? 'bg-blue-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {label}
          </div>
        )}
        
        {/* Armor Type Indicator */}
        {armorStatus && (
          <div className={`text-xs text-center mb-1 ${getArmorColor()}`}>
            {getArmorIcon()} {armorStatus.armorName}
          </div>
        )}

        {/* Shield Bar (if available) */}
        {hasShield && (
          <div className="bg-gray-800 rounded-full w-16 h-1 border border-cyan-400 overflow-hidden mb-1">
            <div 
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${shieldPercentage}%` }}
            />
            {shieldPercentage > 0 && (
              <div className="absolute inset-0 bg-cyan-400 opacity-30 animate-pulse" />
            )}
          </div>
        )}
        
        {/* Health Bar Container */}
        <div className="bg-gray-800 rounded-full w-16 h-2 border border-gray-600 overflow-hidden relative">
          {/* Health Bar Fill */}
          <div 
            className={`h-full transition-all duration-300 ${
              isDead 
                ? 'bg-gray-500' 
                : isLowHealth 
                  ? 'bg-red-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${healthPercent}%` }}
          />
          
          {/* Critical Health Pulse */}
          {isLowHealth && !isDead && (
            <div className="absolute inset-0 bg-red-500 opacity-50 animate-pulse" />
          )}
        </div>
        
        {/* Health Text */}
        <div className="text-xs text-white font-mono mt-0.5 bg-black bg-opacity-50 px-1 rounded">
          {health}/{maxHealth}
          {hasShield && (
            <div className="text-xs text-cyan-400">
              ⚡{Math.ceil(armorStatus!.shield)}/{armorStatus!.maxShield}
            </div>
          )}
        </div>

        {/* Active Abilities */}
        {armorStatus && armorStatus.abilities.some(a => a.active) && (
          <div className="text-xs text-center text-yellow-400 animate-pulse">
            {armorStatus.abilities
              .filter(a => a.active)
              .map(a => a.type.toUpperCase())
              .join(' ')}
          </div>
        )}
        
        {/* Status indicators */}
        {isDead && (
          <div className="text-xs text-red-400 font-bold">💀 DEAD</div>
        )}
        {isPlayer && !isDead && (
          <div className="text-xs text-blue-400">👤 YOU</div>
        )}
      </div>
    </Html>
  )
}

export default HealthBar