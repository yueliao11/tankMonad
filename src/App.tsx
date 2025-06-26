import { useAccount } from './web3Context.tsx'
import AuthenticationScreen from './components/auth/AuthenticationScreen.tsx'
import GameScreen from './components/game/GameScreen.tsx'
import { useAuthStore } from './store/authStore.ts'

function App() {
  const { isConnected } = useAccount()
  const { isAuthenticated } = useAuthStore()

  // Show authentication screen if not connected or authenticated
  if (!isConnected || !isAuthenticated) {
    return <AuthenticationScreen />
  }

  // Show the full 3D multiplayer game
  return <GameScreen />
}

export default App