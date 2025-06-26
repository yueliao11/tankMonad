import React from 'react'
import { useGameStore } from '@/store/gameStore'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionError } = useGameStore()

  if (isConnected && !connectionError) {
    return null // Don't show anything when connected
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md">
        <div className="text-center space-y-4">
          {connectionError ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-xl font-semibold text-white">
                Connection Error
              </h3>
              <p className="text-gray-300">
                {connectionError}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary px-6 py-2"
              >
                Retry Connection
              </button>
            </>
          ) : (
            <>
              <WifiOff className="w-12 h-12 text-yellow-500 mx-auto animate-pulse" />
              <h3 className="text-xl font-semibold text-white">
                Connecting...
              </h3>
              <p className="text-gray-300">
                Establishing connection to MultiSynq network
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-monad-500 border-t-transparent"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus