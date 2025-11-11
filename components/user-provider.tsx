'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useUserAuth } from '@/lib/hooks/useUserAuth'
import type { User } from '@/lib/services/user.service'

interface UserContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  isInitialized: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const userAuth = useUserAuth()

  return (
    <UserContext.Provider value={userAuth}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
