import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

// Extend EIP-1193 Provider interface
interface EIP1193Provider {
  request(request: { method: string; params?: any[] }): Promise<any>
  on(event: string, handler: (...args: any[]) => void): void
  removeListener(event: string, handler: (...args: any[]) => void): void
}

// Web3 Context type definitions
interface Web3ContextType {
  // Account info
  address: string | undefined
  isConnected: boolean
  
  // Network info
  chainId: number | undefined
  network: { id: number; name: string } | undefined
  
  // Provider and signer
  provider: BrowserProvider | undefined
  signer: JsonRpcSigner | undefined
  
  // Methods
  switchNetwork: (chainId: number) => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Custom hook to use Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// Custom hooks for specific functionality (wagmi compatibility)
export const useAccount = () => {
  const { address, isConnected } = useWeb3()
  return { address, isConnected }
}

export const useNetwork = () => {
  const { chainId, network } = useWeb3()
  return { 
    chain: network ? { id: network.id, name: network.name } : undefined,
    chainId 
  }
}

// Provider component
interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  
  const [provider, setProvider] = useState<BrowserProvider | undefined>(undefined)
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined)
  const [chainId, setChainId] = useState<number | undefined>(undefined)
  const [network, setNetwork] = useState<{ id: number; name: string } | undefined>(undefined)

  // Initialize provider and signer when wallet connects
  useEffect(() => {
    const initializeProvider = async () => {
      if (walletProvider && isConnected) {
        try {
          // Cast to EIP1193Provider to ensure proper typing
          const eip1193Provider = walletProvider as unknown as EIP1193Provider
          const ethersProvider = new BrowserProvider(eip1193Provider)
          const ethersSigner = await ethersProvider.getSigner()
          const networkInfo = await ethersProvider.getNetwork()
          
          setProvider(ethersProvider)
          setSigner(ethersSigner)
          setChainId(Number(networkInfo.chainId))
          
          // Map chainId to network name
          const networkName = Number(networkInfo.chainId) === 10143 
            ? 'Monad Testnet' 
            : Number(networkInfo.chainId) === 41455 
            ? 'Monad' 
            : 'Unknown Network'
          
          setNetwork({ id: Number(networkInfo.chainId), name: networkName })
          
          console.log('Web3 Provider initialized:', {
            chainId: Number(networkInfo.chainId),
            address,
            networkName
          })
        } catch (error) {
          console.error('Failed to initialize provider:', error)
        }
      } else {
        // Reset state when disconnected
        setProvider(undefined)
        setSigner(undefined)
        setChainId(undefined)
        setNetwork(undefined)
      }
    }

    initializeProvider()
  }, [walletProvider, isConnected, address])

  // Listen for network changes
  useEffect(() => {
    if (walletProvider) {
      const eip1193Provider = walletProvider as unknown as EIP1193Provider
      
      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16)
        setChainId(newChainId)
        
        const networkName = newChainId === 10143 
          ? 'Monad Testnet' 
          : newChainId === 41455 
          ? 'Monad' 
          : 'Unknown Network'
        
        setNetwork({ id: newChainId, name: networkName })
        console.log('Network changed to:', newChainId, networkName)
      }

      eip1193Provider.on('chainChanged', handleChainChanged)
      
      return () => {
        eip1193Provider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [walletProvider])

  // Switch network function
  const switchNetwork = async (targetChainId: number): Promise<void> => {
    if (!walletProvider) {
      throw new Error('No wallet provider available')
    }
    
    const eip1193Provider = walletProvider as unknown as EIP1193Provider
    
    try {
      await eip1193Provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet, need to add it
        const networkConfig = targetChainId === 10143 ? {
          chainId: '0x279F',
          chainName: 'Monad Testnet',
          nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
          rpcUrls: ['https://testnet-rpc.monad.xyz'],
          blockExplorerUrls: ['https://testnet.monadexplorer.com']
        } : {
          chainId: '0xA1EF',
          chainName: 'Monad',
          nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
          rpcUrls: ['https://rpc.monad.xyz'],
          blockExplorerUrls: ['https://explorer.monad.xyz']
        }
        
        await eip1193Provider.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        })
      } else {
        throw error
      }
    }
  }

  const contextValue: Web3ContextType = {
    address,
    isConnected,
    chainId,
    network,
    provider,
    signer,
    switchNetwork,
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Provider 