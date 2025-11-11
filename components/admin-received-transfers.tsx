'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { isAdmin as checkIsAdmin } from '@/lib/admin'
import { Loader2, CheckCircle, Wallet } from 'lucide-react'

interface Transfer {
  id: number
  from_address: string
  to_address: string
  amount: string
  status: string
  created_at: string
  completed_at: string
}

export function AdminReceivedTransfers() {
  const { address, isConnected } = useAccount()
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (address) checkAdmin()
  }, [address])

  useEffect(() => {
    if (address && isAdmin) {
      fetchTransfers()
      
      const subscription = supabase
        .channel('admin_transfers')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transfer_requests' },
          () => fetchTransfers()
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

  const fetchTransfers = async () => {
    if (!address) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('transfer_requests')
        .select('*')
        .eq('to_address', address.toLowerCase())
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
      
      if (error) throw error
      setTransfers(data || [])
    } catch (err) {
      console.error('Error fetching transfers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected || !isAdmin) {
    return null
  }

  const totalReceived = transfers.reduce((sum, t) => sum + parseFloat(t.amount), 0)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900">Received Transfers</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Received</p>
          <p className="text-lg font-bold text-green-600">{totalReceived.toFixed(4)}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No transfers received yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="font-mono text-xs text-gray-900 break-all">{transfer.from_address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">+{transfer.amount}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(transfer.completed_at).toLocaleString()}</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
