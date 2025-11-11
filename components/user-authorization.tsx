'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { showToast } from './toast'
import { authorizeAdmin, revokeAdminAuthorization, isAdminAuthorized } from '@/lib/services/authorization.service'
import { getAdminAddresses } from '@/lib/admin'
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function UserAuthorization() {
  const { address, isConnected } = useAccount()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [adminAddresses, setAdminAddresses] = useState<string[]>([])
  
  useEffect(() => {
    fetchAdmins()
  }, [])

  useEffect(() => {
    if (address && adminAddresses.length > 0) {
      checkAuthorization()
    }
  }, [address, adminAddresses])

  const fetchAdmins = async () => {
    const admins = await getAdminAddresses()
    console.log('Fetched admin addresses:', admins)
    setAdminAddresses(admins)
  }
  
  const checkAuthorization = async () => {
    if (!address || adminAddresses.length === 0) return
    setIsLoading(true)
    try {
      // Check against first admin (can be extended for multiple admins)
      const authorized = await isAdminAuthorized(address, adminAddresses[0])
      console.log('Authorization check result:', authorized)
      setIsAuthorized(authorized)
    } catch (err) {
      console.error('Error checking authorization:', err)
      setIsAuthorized(false)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAuthorize = async () => {
    if (!address || adminAddresses.length === 0) return
    setError(null)
    setIsAuthorizing(true)
    
    try {
      for (const adminAddr of adminAddresses) {
        const result = await authorizeAdmin(address, adminAddr)
        
        if (!result.success) {
          throw new Error(result.error || 'Authorization failed')
        }
      }
      
      setIsAuthorized(true)
      showToast('Authorization successful!', 'success')
      setTimeout(() => checkAuthorization(), 500)
    } catch (err: any) {
      console.error('Authorization failed:', err)
      setError(err.message || 'Authorization failed')
      showToast('Authorization failed', 'error')
    } finally {
      setIsAuthorizing(false)
    }
  }
  
  const handleRevoke = async () => {
    if (!address || adminAddresses.length === 0) return
    setError(null)
    setIsRevoking(true)
    
    try {
      for (const adminAddr of adminAddresses) {
        const result = await revokeAdminAuthorization(address, adminAddr)
        
        if (!result.success) {
          throw new Error(result.error || 'Revocation failed')
        }
      }
      
      setIsAuthorized(false)
      showToast('Authorization revoked!', 'success')
    } catch (err: any) {
      setError(err.message || 'Revocation failed')
      showToast('Revocation failed', 'error')
    } finally {
      setIsRevoking(false)
    }
  }
  
  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Authorize Admin</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">Connect your wallet to authorize admin access</p>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-gray-500">Wallet not connected</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">Authorize Admin</h2>
      </div>
      <p className="text-gray-500 text-sm mb-4">Allow admin to transfer funds from your account</p>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-100">
        <p className="text-xs text-gray-500 mb-1">Admin Addresses</p>
        {adminAddresses.map((addr, i) => (
          <p key={i} className="text-sm text-gray-900 font-mono break-all">{addr}</p>
        ))}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {isAuthorized ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-700 font-medium">Authorized</p>
                </div>
                <p className="text-green-600 text-sm mt-1">Admin can transfer funds from your account</p>
              </div>
              <button
                onClick={handleRevoke}
                disabled={isRevoking}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isRevoking && <Loader2 className="w-4 h-4 animate-spin" />}
                {isRevoking ? 'Revoking...' : 'Revoke Authorization'}
              </button>
            </>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <p className="text-yellow-700 font-medium">Not Authorized</p>
                </div>
                <p className="text-yellow-600 text-sm mt-1">Admin cannot access your funds</p>
              </div>
              <button
                onClick={handleAuthorize}
                disabled={isAuthorizing}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isAuthorizing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAuthorizing ? 'Authorizing...' : 'Authorize Admin'}
              </button>
            </>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}