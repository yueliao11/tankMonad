import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import ExplosionEffect from './ExplosionEffect'

interface Explosion {
  id: string
  position: [number, number, number]
  size: number
  type: 'hit' | 'kill' | 'monster-death'
}

const ExplosionManager: React.FC = () => {
  const { session } = useGameStore()
  const [explosions, setExplosions] = useState<Explosion[]>([])

  useEffect(() => {
    if (!session?.view) return

    // Listen for hit events
    const handlePlayerKilled = (data: any) => {
      console.log('Player killed explosion:', data)
      // Find the victim's position for explosion
      const gameState = session.view.model?.getGameState?.()
      if (gameState?.players) {
        for (const player of gameState.players.values()) {
          if (player.address === data.victim) {
            addExplosion(
              `kill-${Date.now()}`,
              [player.position.x, player.position.y + 1, player.position.z],
              2.0,
              'kill'
            )
            break
          }
        }
      }
    }

    const handleMonsterKilled = (data: any) => {
      console.log('Monster killed explosion:', data)
      addExplosion(
        `monster-${Date.now()}`,
        [data.position?.x || 0, (data.position?.y || 0) + 1, data.position?.z || 0],
        1.5,
        'monster-death'
      )
    }

    const handleBulletHit = (data: any) => {
      console.log('Bullet hit explosion:', data)
      addExplosion(
        `hit-${Date.now()}`,
        [data.position?.x || 0, (data.position?.y || 0) + 0.5, data.position?.z || 0],
        0.8,
        'hit'
      )
    }

    // Subscribe to game events
    session.view.subscribe('game', 'player-killed', handlePlayerKilled)
    session.view.subscribe('game', 'monster-killed', handleMonsterKilled)
    session.view.subscribe('game', 'bullet-hit', handleBulletHit)

    return () => {
      // Cleanup subscriptions
      session.view?.unsubscribe('game', 'player-killed', handlePlayerKilled)
      session.view?.unsubscribe('game', 'monster-killed', handleMonsterKilled)
      session.view?.unsubscribe('game', 'bullet-hit', handleBulletHit)
    }
  }, [session])

  const addExplosion = (id: string, position: [number, number, number], size: number, type: Explosion['type']) => {
    const newExplosion: Explosion = { id, position, size, type }
    setExplosions(prev => [...prev, newExplosion])
  }

  const removeExplosion = (id: string) => {
    setExplosions(prev => prev.filter(exp => exp.id !== id))
  }

  return (
    <>
      {explosions.map((explosion) => (
        <ExplosionEffect
          key={explosion.id}
          position={explosion.position}
          size={explosion.size}
          duration={explosion.type === 'kill' ? 2000 : 1000}
          onComplete={() => removeExplosion(explosion.id)}
        />
      ))}
    </>
  )
}

export default ExplosionManager