import { create } from 'zustand'
import { GameState, HUDData, InputState } from '@/types'

interface GameStore {
  // Game state
  gameState: GameState | null
  session: any // MultiSynq session
  isConnected: boolean
  connectionError: string | null
  connectedUser: { address: string; color: string } | null
  
  // HUD data
  hudData: HUDData
  
  // Input state
  inputState: InputState
  
  // Actions
  setGameState: (gameState: GameState) => void
  setSession: (session: any) => void
  setConnected: (isConnected: boolean) => void
  setConnectionError: (error: string | null) => void
  setConnectedUser: (user: { address: string; color: string } | null) => void
  updateHUD: (data: Partial<HUDData>) => void
  updateInput: (input: Partial<InputState>) => void
  reset: () => void
}

const initialHUDData: HUDData = {
  health: 100,
  maxHealth: 100,
  score: 0,
  timeRemaining: 180000, // 3 minutes
  monstersRemaining: 10,
  playersOnline: 1,
}

const initialInputState: InputState = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  shoot: false,
  mouseX: 0,
  mouseY: 0,
}

export const useGameStore = create<GameStore>((set, _get) => ({
  gameState: null,
  session: null,
  isConnected: false,
  connectionError: null,
  connectedUser: null,
  hudData: initialHUDData,
  inputState: initialInputState,
  
  setGameState: (gameState) => set({ gameState }),
  setSession: (session) => set({ session }),
  setConnected: (isConnected) => set({ isConnected }),
  setConnectionError: (error) => set({ connectionError: error }),
  setConnectedUser: (user) => set({ connectedUser: user }),
  
  updateHUD: (data) => set((state) => ({
    hudData: { ...state.hudData, ...data }
  })),
  
  updateInput: (input) => set((state) => ({
    inputState: { ...state.inputState, ...input }
  })),
  
  reset: () => set({
    gameState: null,
    session: null,
    isConnected: false,
    connectionError: null,
    connectedUser: null,
    hudData: initialHUDData,
    inputState: initialInputState,
  }),
}))