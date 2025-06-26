import { useAccount } from 'wagmi'
import AuthenticationScreen from './components/auth/AuthenticationScreen'
import GameScreen from './components/game/GameScreen'
import { useAuthStore } from './store/authStore'

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