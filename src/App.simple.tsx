import { useAccount } from './lib/web3Context'
import { useAppKit } from '@reown/appkit/react'

function SimpleApp() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">Monad Tank Battle</h1>
        
        {isConnected ? (
          <div className="space-y-4">
            <p className="text-green-400">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <button 
              onClick={() => open({ view: 'Account' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400">Connect your wallet to get started</p>
            <button 
              onClick={() => open()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimpleApp