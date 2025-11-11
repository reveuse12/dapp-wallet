'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Transfer {
  id: number
  from_address: string
  to_address: string
  amount: string
  status: string
  created_at: string
  completed_at: string
}

export function UserSentTransfers() {
  const { address, isConnected } = useAccount()
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (address) {
      fetchTransfers()
      
      const subscription = supabase
        .channel('user_transfers')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transfer_requests' },
          () => fetchTransfers()
        )
        .subscribe()
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [address])

  const fetchTransfers = async () => {
    if (!address) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('transfer_requests')
        .select('*')
        .eq('from_address', address.toLowerCase())
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTransfers(data || [])
    } catch (err) {
      console.error('Error fetching transfers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) return null

  const totalSent = transfers.filter(t => t.status === 'completed').reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">My Transfers</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Sent</p>
          <p className="text-lg font-bold text-blue-600">{totalSent.toFixed(4)}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <ArrowUpRight className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No transfers yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transfers.map((transfer) => (
            <div key={transfer.id} className={`rounded-xl p-4 border ${getStatusColor(transfer.status)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-500">To Admin</p>
                  <p className="font-mono text-xs text-gray-900 break-all">{transfer.to_address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">-{transfer.amount}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {new Date(transfer.created_at).toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(transfer.status)}
                  <span className="capitalize">{transfer.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
