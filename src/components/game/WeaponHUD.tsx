import React from 'react'
import { WeaponSystem, WeaponType } from '@/lib/weaponSystem'

interface WeaponHUDProps {
  weaponSystem: WeaponSystem
  className?: string
}

const WeaponHUD: React.FC<WeaponHUDProps> = ({ weaponSystem, className = '' }) => {
  const activeWeapon = weaponSystem.getActiveWeapon()
  const primaryWeapon = weaponSystem.loadout.primary
  const secondaryWeapon = weaponSystem.loadout.secondary
  const isActiveWeaponPrimary = weaponSystem.loadout.activeWeapon === 'primary'

  const getWeaponIcon = (weaponType: WeaponType): string => {
    switch (weaponType) {
      case WeaponType.CANNON: return '🔫'
      case WeaponType.MACHINE_GUN: return '🔫'
      case WeaponType.ROCKET: return '🚀'
      case WeaponType.PLASMA: return '⚡'
      case WeaponType.SHOTGUN: return '💥'
      case WeaponType.SNIPER: return '🎯'
      default: return '🔫'
    }
  }

  const getStatusColor = (weapon: any): string => {
    if (weapon.overheated) return 'text-red-500'
    if (weapon.isReloading) return 'text-yellow-500'
    if (weapon.currentAmmo === 0) return 'text-red-400'
    return 'text-green-400'
  }

  const getAmmoBarColor = (weapon: any): string => {
    const ammoPercent = weapon.currentAmmo / weapon.config.magazineSize
    if (ammoPercent > 0.6) return 'bg-green-500'
    if (ammoPercent > 0.3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getHeatBarColor = (weapon: any): string => {
    const heatPercent = weapon.heat / weapon.maxHeat
    if (heatPercent < 0.5) return 'bg-blue-400'
    if (heatPercent < 0.8) return 'bg-yellow-400'
    return 'bg-red-500'
  }

  const getEnergyBarColor = (): string => {
    const energyPercent = weaponSystem.energy / weaponSystem.maxEnergy
    if (energyPercent > 0.6) return 'bg-cyan-500'
    if (energyPercent > 0.3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={`bg-black/80 rounded-lg p-4 text-white font-mono ${className}`}>
      {/* Active Weapon Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getWeaponIcon(activeWeapon.config.type)}</span>
            <div>
              <h3 className="text-lg font-bold text-cyan-400">
                {activeWeapon.config.name}
              </h3>
              <p className="text-xs text-gray-400">
                {activeWeapon.config.ammoType.toUpperCase()}
              </p>
            </div>
          </div>
          <div className={`text-right ${getStatusColor(activeWeapon)}`}>
            {activeWeapon.overheated && <div className="text-xs">OVERHEATED</div>}
            {activeWeapon.isReloading && <div className="text-xs">RELOADING</div>}
            {!activeWeapon.overheated && !activeWeapon.isReloading && (
              <div className="text-xs">READY</div>
            )}
          </div>
        </div>

        {/* Ammo Counter */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">AMMO</span>
          <span className={`font-bold ${getStatusColor(activeWeapon)}`}>
            {activeWeapon.currentAmmo} / {activeWeapon.config.magazineSize}
          </span>
        </div>

        {/* Ammo Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getAmmoBarColor(activeWeapon)}`}
            style={{
              width: `${(activeWeapon.currentAmmo / activeWeapon.config.magazineSize) * 100}%`
            }}
          />
        </div>

        {/* Heat Display */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">HEAT</span>
          <span className="text-xs text-gray-400">
            {Math.round(activeWeapon.heat)}%
          </span>
        </div>

        {/* Heat Bar */}
        <div className="w-full bg-gray-700 rounded-full h-1 mb-3">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${getHeatBarColor(activeWeapon)}`}
            style={{
              width: `${(activeWeapon.heat / activeWeapon.maxHeat) * 100}%`
            }}
          />
        </div>

        {/* Reload Progress */}
        {activeWeapon.isReloading && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-yellow-400">RELOADING</span>
              <span className="text-xs text-yellow-400">
                {Math.round(activeWeapon.getReloadProgress(Date.now()) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 bg-yellow-500 rounded-full transition-all duration-100"
                style={{
                  width: `${activeWeapon.getReloadProgress(Date.now()) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Energy System */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-cyan-400">ENERGY</span>
          <span className="text-sm">
            {Math.round(weaponSystem.energy)} / {weaponSystem.maxEnergy}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getEnergyBarColor()}`}
            style={{
              width: `${(weaponSystem.energy / weaponSystem.maxEnergy) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Weapon Selection */}
      <div className="grid grid-cols-2 gap-2">
        {/* Primary Weapon */}
        <div 
          className={`p-2 rounded border-2 transition-all cursor-pointer ${
            isActiveWeaponPrimary 
              ? 'border-cyan-500 bg-cyan-500/20' 
              : 'border-gray-600 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getWeaponIcon(primaryWeapon.config.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">
                {primaryWeapon.config.name}
              </div>
              <div className="text-xs text-gray-400">
                {primaryWeapon.currentAmmo}/{primaryWeapon.config.magazineSize}
              </div>
            </div>
          </div>
          <div className="text-xs text-center text-cyan-400 mt-1">
            [1] PRIMARY
          </div>
        </div>

        {/* Secondary Weapon */}
        <div 
          className={`p-2 rounded border-2 transition-all cursor-pointer ${
            !isActiveWeaponPrimary 
              ? 'border-cyan-500 bg-cyan-500/20' 
              : 'border-gray-600 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getWeaponIcon(secondaryWeapon.config.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">
                {secondaryWeapon.config.name}
              </div>
              <div className="text-xs text-gray-400">
                {secondaryWeapon.currentAmmo}/{secondaryWeapon.config.magazineSize}
              </div>
            </div>
          </div>
          <div className="text-xs text-center text-cyan-400 mt-1">
            [2] SECONDARY
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>FIRE:</span>
          <span>Left Click / Space</span>
        </div>
        <div className="flex justify-between">
          <span>RELOAD:</span>
          <span>R</span>
        </div>
        <div className="flex justify-between">
          <span>SWITCH:</span>
          <span>1/2 or Q</span>
        </div>
      </div>

      {/* Weapon Stats */}
      <div className="mt-4 pt-3 border-t border-gray-600">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>DAMAGE:</span>
            <span className="text-white">{activeWeapon.config.damage}</span>
          </div>
          <div className="flex justify-between">
            <span>RANGE:</span>
            <span className="text-white">{activeWeapon.config.range}m</span>
          </div>
          <div className="flex justify-between">
            <span>FIRE RATE:</span>
            <span className="text-white">{activeWeapon.config.fireRate}/s</span>
          </div>
          {activeWeapon.config.splashRadius > 0 && (
            <div className="flex justify-between">
              <span>SPLASH:</span>
              <span className="text-white">{activeWeapon.config.splashRadius}m</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeaponHUD