import { create } from 'zustand'
import { AuthState } from '@/types'

interface AuthStore extends AuthState {
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setAddress: (address: string) => void
  setError: (error: string | undefined) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  address: undefined,
  error: undefined,
  
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setAddress: (address) => set({ address }),
  setError: (error) => set({ error }),
  reset: () => set({ 
    isAuthenticated: false, 
    isLoading: false, 
    address: undefined, 
    error: undefined 
  }),
}))