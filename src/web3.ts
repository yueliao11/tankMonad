import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, arbitrum, defineChain, type AppKitNetwork } from '@reown/appkit/networks'

// Define Monad networks using AppKit's defineChain
export const monadTestnet = defineChain({
  id: 10143,
  caipNetworkId: 'eip155:10143',
  chainNamespace: 'eip155',
  name: 'Monad Testnet',
  nativeCurrency: { 
    name: 'MON', 
    symbol: 'MON', 
    decimals: 18 
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz']
    }
  },
  blockExplorers: {
    default: {
      name: 'Monad Testnet Explorer',
      url: 'https://testnet.monadexplorer.com'
    }
  }
})

export const monadMainnet = defineChain({
  id: 41455,
  caipNetworkId: 'eip155:41455',
  chainNamespace: 'eip155',
  name: 'Monad',
  nativeCurrency: { 
    name: 'MON', 
    symbol: 'MON', 
    decimals: 18 
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz']
    }
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://explorer.monad.xyz'
    }
  }
})

// Configure the networks with proper typing
const networks = [
  monadTestnet,
  monadMainnet,
  mainnet,
  arbitrum
] as [AppKitNetwork, ...AppKitNetwork[]]

// Project ID from environment variables
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_WALLET_CONNECT_PROJECT_ID?: string
    }
  }
}

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '4c15f62f4a2c70e0b99b8b9d9dce7b5f'

// Set up the EthersAdapter
const ethersAdapter = new EthersAdapter()

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [ethersAdapter],
  networks: networks,
  metadata: {
    name: 'Monad Tank Battle',
    description: 'Multiplayer Real-time Tank Combat Game',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://tankbattle.monad.xyz',
    icons: [`${typeof window !== 'undefined' ? window.location.origin : 'https://tankbattle.monad.xyz'}/icon.png`]
  },
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: [],
    emailShowWallets: false
  }
})

// Export network configurations for use in components
export const NETWORKS = {
  TESTNET: monadTestnet,
  MAINNET: monadMainnet
}

// Helper function to switch to Monad Testnet
export const switchToMonadTestnet = async () => {
  try {
    // Use the AppKit's switchNetwork method
    await appKit.switchNetwork(monadTestnet)
  } catch (error) {
    console.error('Failed to switch to Monad Testnet:', error)
    throw error
  }
} 