import React, { useState } from 'react'
import { useAccount, useNetwork } from '../../lib/web3Context'
import { useAppKit } from '@reown/appkit/react'
import { useAuthStore } from '../../store/authStore'
import LoadingSpinner from '../ui/LoadingSpinner'
import { switchToMonadTestnet } from '../../lib/web3'

const AuthenticationScreen: React.FC = () => {
  const { address } = useAccount()
  const { chain } = useNetwork() || { chain: null }
  const { open } = useAppKit()
  const { setAuthenticated, setAddress, setError, error } = useAuthStore()
  const [authStep, setAuthStep] = useState<'connect' | 'network'>('connect')
  const [networkSwitching, setNetworkSwitching] = useState(false)

  const handleSwitchNetwork = async () => {
    try {
      setNetworkSwitching(true)
      setError(undefined)
      await switchToMonadTestnet()
      // After successful network switch, authenticate directly
      if (address) {
        setAddress(address)
        setAuthenticated(true)
        console.log('Authentication successful for address:', address)
      }
    } catch (error) {
      console.error('Network switch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to switch network')
    } finally {
      setNetworkSwitching(false)
    }
  }

  React.useEffect(() => {
    if (address) {
      // Check if we're on the correct network (Monad Testnet = 10143)
      if (chain?.id === 10143) {
        // Directly authenticate if connected to the right network
        setAddress(address)
        setAuthenticated(true)
        console.log('Authentication successful for address:', address)
      } else {
        setAuthStep('network')
      }
    } else {
      setAuthStep('connect')
    }
  }, [address, chain])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">
            🚗 TANK BATTLE
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Multiplayer Real-time Combat
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-monad-500 rounded-full animate-pulse"></span>
            <span>Powered by Monad</span>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
          {authStep === 'connect' ? (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Connect Wallet
                </h2>
                <p className="text-gray-400">
                  Connect your wallet to join the battle
                </p>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => open()}
                  className="btn-primary px-8 py-3 text-lg font-semibold"
                >
                  Connect Wallet
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Switch to Monad Network
                </h2>
                <p className="text-gray-400 mb-4">
                  Please switch to Monad Testnet to continue
                </p>
                <div className="text-sm text-gray-500 space-y-2">
                  <div>Current: {chain?.name || 'Unknown Network'}</div>
                  <div>Required: Monad Testnet</div>
                  <div className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                </div>
              </div>

              <button
                onClick={handleSwitchNetwork}
                disabled={networkSwitching}
                className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center space-x-2"
              >
                {networkSwitching ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Switching Network...</span>
                  </>
                ) : (
                  <span>Switch to Monad Testnet</span>
                )}
              </button>

              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>Network Details:</p>
                <p>• RPC: testnet-rpc.monad.xyz</p>
                <p>• Explorer: testnet.monadexplorer.com</p>
                <p>• Chain ID: 10143</p>
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="text-red-400 text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="text-xs text-gray-600 text-center space-y-1">
            <p>Step: {authStep}</p>
            {address && <p>Address: {address.slice(0, 6)}...{address.slice(-4)}</p>}
            {chain && <p>Network: {chain.name} ({chain.id})</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthenticationScreen