import { create } from 'zustand'
import { AuthState, User } from '../types'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  loginWithGitHub: () => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (email: string, password: string) => {
    set({ loading: true })
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user for demo
      const mockUser: User = {
        id: '1',
        email,
        name: 'Demo User',
        githubUsername: 'demo-user',
        plan: 'pro',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        loading: false 
      })
      
      // Store in localStorage for persistence
      localStorage.setItem('auth_token', 'mock_token')
      localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  loginWithGitHub: async () => {
    set({ loading: true })
    try {
      // In a real app, this would handle GitHub OAuth flow
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      const redirectUri = `${import.meta.env.VITE_APP_URL}/auth/github/callback`
      
      // For demo purposes, simulate successful GitHub login
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: '1',
        email: 'user@github.com',
        name: 'GitHub User',
        githubUsername: 'github-user',
        plan: 'pro',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        loading: false 
      })
      
      localStorage.setItem('auth_token', 'github_mock_token')
      localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      loading: false 
    })
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  updateUser: (updatedUser: Partial<User>) => {
    const { user } = get()
    if (user) {
      const newUser = { ...user, ...updatedUser }
      set({ user: newUser })
      localStorage.setItem('user', JSON.stringify(newUser))
    }
  },

  checkAuth: async () => {
    set({ loading: true })
    try {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        const user = JSON.parse(userData)
        set({ 
          user, 
          isAuthenticated: true, 
          loading: false 
        })
      } else {
        set({ loading: false })
      }
    } catch (error) {
      set({ loading: false })
    }
  },
}))

// Initialize auth check on store creation
useAuthStore.getState().checkAuth() 