import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { registerUserLogin, getUserByWallet, isUserAdmin, type User } from '@/lib/services/user.service'

export function useUserAuth() {
  const { address, isConnected } = useAccount()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (isConnected && address && !isInitialized) {
      handleUserLogin(address)
    } else if (!isConnected) {
      setUser(null)
      setIsAdmin(false)
      setIsInitialized(false)
    }
  }, [address, isConnected, isInitialized])

  const handleUserLogin = async (walletAddress: string) => {
    setIsLoading(true)
    try {
      // Register/update user login
      const userData = await registerUserLogin(walletAddress)
      
      if (userData) {
        setUser(userData)
        
        // Check if user is admin
        const adminStatus = await isUserAdmin(walletAddress)
        setIsAdmin(adminStatus)
        
        console.log('User authenticated:', {
          id: userData.id,
          wallet: userData.wallet_address,
          isAdmin: adminStatus,
          totalLogins: userData.total_logins
        })
      }
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Error during user login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    if (address) {
      const userData = await getUserByWallet(address)
      if (userData) {
        setUser(userData)
      }
    }
  }

  return {
    user,
    isAdmin,
    isLoading,
    isInitialized,
    refreshUser
  }
}
