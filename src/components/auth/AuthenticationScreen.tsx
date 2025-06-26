import React, { useState } from 'react'
import { useAccount, useSignMessage, useNetwork } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { SiweMessage } from 'siwe'
import { useAuthStore } from '@/store/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { switchToMonadTestnet } from '@/lib/addMonadNetwork'

const AuthenticationScreen: React.FC = () => {
  const { address } = useAccount()
  const { chain } = useNetwork() || { chain: null }
  const { signMessageAsync } = useSignMessage()
  const { setAuthenticated, setAddress, setError, isLoading, setLoading, error } = useAuthStore()
  const [authStep, setAuthStep] = useState<'connect' | 'network' | 'sign'>('connect')
  const [networkSwitching, setNetworkSwitching] = useState(false)

  const handleSignIn = async () => {
    if (!address) return

    try {
      setLoading(true)
      setError(undefined)
      
      console.log('Starting SIWE authentication for address:', address)
      console.log('Chain ID:', chain?.id)

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Monad Tank Battle to authenticate your wallet.',
        uri: window.location.origin,
        version: '1',
        chainId: chain?.id || 10143, // Use current chain or fallback to Monad testnet
        nonce: Math.random().toString(36).substring(2, 15),
        issuedAt: new Date().toISOString(),
      })

      const messageToSign = message.prepareMessage()

      // Sign the message
      const signature = await signMessageAsync({
        message: messageToSign,
      })

      // Basic signature validation (in production, this should be done on the server)
      if (signature && signature.length > 0) {
        // If we got a signature, consider it valid for demo purposes
        // In production, you would verify the signature on your backend
        setAddress(address)
        setAuthenticated(true)
        console.log('Authentication successful for address:', address)
      } else {
        throw new Error('No signature received')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          setError('Please sign the message to continue')
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your connection and try again.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      setNetworkSwitching(true)
      setError(undefined)
      await switchToMonadTestnet()
      setAuthStep('sign')
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
        setAuthStep('sign')
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
                <ConnectButton />
              </div>
            </>
          ) : authStep === 'network' ? (
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
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Sign Message
                </h2>
                <p className="text-gray-400 mb-4">
                  Sign a message to verify your identity
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                  <div className="text-green-400">✓ Connected to {chain?.name}</div>
                </div>
              </div>

              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Signing...</span>
                  </>
                ) : (
                  <span>Sign & Enter Game</span>
                )}
              </button>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">
                {error}
              </p>
              <button 
                onClick={() => setError(undefined)}
                className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Game Info */}
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

export default AuthenticationScreen