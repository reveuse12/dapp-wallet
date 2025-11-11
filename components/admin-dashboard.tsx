'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { useBalance, useSendTransaction } from 'wagmi'
import { Loader2, Users, Wallet, ArrowRight, CheckCircle, XCircle, Shield } from 'lucide-react'
import { showToast } from './toast'
import { supabase } from '@/lib/supabase'
import { isAdmin as checkIsAdmin } from '@/lib/admin'
import { parseEther } from 'viem'

export function AdminDashboard() {
  const { address, isConnected } = useAccount()
  const [authorizedUsers, setAuthorizedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    if (address) checkAdmin()
  }, [address])

  useEffect(() => {
    if (address && isAdmin) {
      fetchAuthorizedUsers()
      
      const subscription = supabase
        .channel('authorizations')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'authorizations' },
          () => fetchAuthorizedUsers()
        )
        .subscribe()
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [address, isAdmin])

  const checkAdmin = async () => {
    if (!address) return
    const result = await checkIsAdmin(address)
    setIsAdmin(result)
  }
  
  const fetchAuthorizedUsers = async () => {
    if (!address) return
    setIsLoadingUsers(true)
    try {
      // Get admin record
      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle()
      
      if (!admin) {
        console.error('Admin not found')
        setAuthorizedUsers([])
        return
      }

      // Get authorized users
      const { data, error } = await supabase
        .from('authorizations')
        .select(`
          user_address,
          users!inner (
            wallet_address
          )
        `)
        .eq('admin_id', admin.id)
        .eq('authorized', true)
      
      if (error) throw error
      setAuthorizedUsers(data?.map(d => d.user_address) || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setIsLoadingUsers(false)
    }
  }
  
  const { data: userBalance, isLoading: isLoadingBalance } = useBalance({
    address: selectedUser as `0x${string}`,
    query: { enabled: !!selectedUser }
  })
  
  const { sendTransaction, isPending: isTransferPending } = useSendTransaction()
  
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTxHash(null)
    
    if (!selectedUser || !amount || !address) return
    
    try {
      const amountInWei = parseEther(amount)
      
      if (userBalance && amountInWei > BigInt(userBalance.value)) {
        setError('Amount exceeds user balance')
        showToast('Insufficient balance', 'error')
        return
      }
      
      // Get user and admin IDs
      const { data: fromUser } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', selectedUser.toLowerCase())
        .maybeSingle()
      
      const { data: toAdmin } = await supabase
        .from('admins')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle()
      
      if (!fromUser || !toAdmin) {
        throw new Error('User or admin not found')
      }

      // Store transfer request in Supabase
      const { error: requestError } = await supabase
        .from('transfer_requests')
        .insert({
          from_user_id: fromUser.id,
          to_admin_id: toAdmin.id,
          from_address: selectedUser.toLowerCase(),
          to_address: address.toLowerCase(),
          amount: amount,
          status: 'pending'
        })
      
      if (requestError) throw requestError
      
      setAmount('')
      showToast('Transfer request sent! User must approve in their wallet.', 'success')
      setError('⚠️ Note: User must connect and approve this transfer')
    } catch (err) {
      setError('Failed to create transfer request')
      showToast('Request failed', 'error')
    }
  }
  

  
  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">Connect as admin to access dashboard</p>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-gray-500">Wallet not connected</p>
        </div>
      </div>
    )
  }
  
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">Access Denied</p>
          </div>
          <p className="text-red-600 text-sm mt-1">Connected wallet is not the authorized admin</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
      </div>
      <p className="text-gray-500 text-sm mb-4">Manage authorized user accounts</p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
        <p className="text-blue-700 text-xs">
          ℹ️ <strong>Note:</strong> Users must approve each transfer in their wallet. Authorization allows you to request transfers, not execute them automatically.
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Authorized Users ({authorizedUsers.length})</h3>
        </div>
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : authorizedUsers.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No authorized users found</p>
            <p className="text-gray-400 text-sm mt-1">Users need to authorize you first</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {authorizedUsers.map((user) => (
              <div 
                key={user}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedUser === user 
                    ? 'bg-blue-50 border-2 border-blue-300 shadow-sm' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <p className="font-mono text-sm break-all">{user}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedUser && (
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Transfer Funds</h3>
            <button 
              onClick={() => {
                setSelectedUser(null)
                setAmount('')
                setError(null)
                setTxHash(null)
              }}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Clear
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">Selected User</p>
            <p className="font-mono text-sm break-all text-gray-900">{selectedUser}</p>
          </div>
          
          {isLoadingBalance ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          ) : userBalance && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-blue-600" />
                <p className="text-blue-700 font-medium">Available Balance</p>
              </div>
              <p className="text-blue-600 text-2xl font-semibold">
                {Number(userBalance.formatted).toFixed(4)} {userBalance.symbol}
              </p>
            </div>
          )}
          
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-gray-900 font-medium mb-2">Transfer Amount</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setError(null)
                  }}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                />
                {userBalance && (
                  <button
                    type="button"
                    onClick={() => setAmount(userBalance.formatted)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    Max
                  </button>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
            >
              Request Transfer from User
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          {txHash && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700 font-medium">Transfer Successful!</p>
              </div>
              <a 
                href={`https://testnet.bscscan.com/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-700 underline"
              >
                View on BSCScan
              </a>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}