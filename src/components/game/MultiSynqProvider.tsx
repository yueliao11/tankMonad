import React, { useEffect, useState } from 'react'
import * as Multisynq from '@multisynq/client'
import { useAccount } from '@/lib/web3Context.tsx'
import { useGameStore } from '@/store/gameStore'
import { useAuthStore } from '@/store/authStore'
import { MULTISYNQ_CONFIG } from '@/lib/gameConfig'
import { getRandomColor } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TankGameModel from '@/game/models/TankGameModel'
import TankGameView from '@/game/views/TankGameView'

const MultiSynqProvider: React.FC = () => {
  const { address } = useAccount()
  const { setSession, setConnected, setConnectionError, setConnectedUser } = useGameStore()
  const { isAuthenticated } = useAuthStore()
  const [isConnecting, setIsConnecting] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !address) return

    let mounted = true
    
    const connectToSession = async () => {
      try {
        setIsConnecting(true)
        setConnectionError(null)

        console.log('Connecting to MultiSynq session...')
        
        // Create ViewData with player info
        const viewData = {
          address,
          color: getRandomColor(),
        }

        // Join MultiSynq session
        const session = await Multisynq.Session.join({
          apiKey: MULTISYNQ_CONFIG.apiKey,
          appId: MULTISYNQ_CONFIG.appId,
          model: TankGameModel,
          view: TankGameView,
          viewData,
          // Auto-generate session name if not specified
          name: undefined,
          password: undefined,
        })

        if (!mounted) return

        console.log('Successfully connected to MultiSynq session:', session.id)
        setSession(session)
        setConnected(true)
        setConnectedUser(viewData) // Store connected user info
        setRetryCount(0)

      } catch (error) {
        console.error('Failed to connect to MultiSynq:', error)
        if (!mounted) return
        
        // More detailed error handling
        let errorMessage = 'Failed to connect to game session'
        if (error instanceof Error) {
          errorMessage = error.message
          console.log('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
          })
        }
        
        setConnectionError(errorMessage)
        setConnected(false)

        // Auto-retry with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 2000 // 2s, 4s, 8s
          setTimeout(() => {
            if (mounted) {
              setRetryCount(prev => prev + 1)
            }
          }, delay)
        }
      } finally {
        if (mounted) {
          setIsConnecting(false)
        }
      }
    }

    connectToSession()

    return () => {
      mounted = false
    }
  }, [address, isAuthenticated, retryCount])

  const handleRetry = () => {
    setRetryCount(0)
    setIsConnecting(true)
  }

  if (!isAuthenticated || !address) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        {isConnecting ? (
          <>
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-white">
              Connecting to Battle Arena
            </h2>
            <p className="text-gray-400">
              Establishing secure connection to MultiSynq network...
            </p>
            <LoadingSpinner size="lg" />
            
            {retryCount > 0 && (
              <p className="text-yellow-400 text-sm">
                Retry attempt {retryCount}/3
              </p>
            )}
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white">
              Connection Failed
            </h2>
            <p className="text-gray-400 mb-4">
              Unable to connect to the game session. This could be due to:
            </p>
            <ul className="text-sm text-gray-500 text-left space-y-1">
              <li>• Network connectivity issues</li>
              <li>• MultiSynq service unavailable</li>
              <li>• Temporary server overload</li>
            </ul>
            
            <div className="space-y-3 pt-4">
              <button
                onClick={handleRetry}
                className="btn-primary px-6 py-3 w-full"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary px-6 py-2 w-full"
              >
                Reload Page
              </button>
            </div>
          </>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>Player: {address.slice(0, 6)}...{address.slice(-4)}</p>
          <p>MultiSynq App ID: {MULTISYNQ_CONFIG.appId}</p>
          <p>API Key: {MULTISYNQ_CONFIG.apiKey.slice(0, 8)}...</p>
          {retryCount > 0 && <p>Retry {retryCount}/3</p>}
        </div>
      </div>
    </div>
  )
}

export default MultiSynqProvider