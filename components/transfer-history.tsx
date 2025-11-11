'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ExternalLink, Clock, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TransferHistoryEntry } from '@/lib/supabase'

type OwnerTransfer = {
  id: number
  hash: string
  amount: string
  timestamp: number
  status: 'pending' | 'success' | 'failed'
}

const OWNER_WALLET = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A'

export function TransferHistory() {
  const { address } = useAccount()
  const [transfers, setTransfers] = useState<OwnerTransfer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (address) {
      fetchTransfers()
      
      // Real-time subscription
      const subscription = supabase
        .channel('transfer_history')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'transfer_history',
            filter: `user_address=eq.${address.toLowerCase()}`
          },
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
        .from('transfer_history')
        .select('*')
        .eq('user_address', address.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      
      setTransfers(data?.map(d => ({
        id: d.id!,
        hash: d.tx_hash,
        amount: d.amount,
        timestamp: new Date(d.created_at!).getTime() / 1000,
        status: d.status as 'pending' | 'success' | 'failed'
      })) || [])
    } catch (err) {
      console.error('Error fetching transfers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getExplorerUrl = (hash: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet' 
      ? 'https://bscscan.com' 
      : 'https://testnet.bscscan.com'
    return `${baseUrl}/tx/${hash}`
  }

  if (!address) return null

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Owner Transfers</h3>
          <p className="text-sm text-gray-500">Transfers to platform owner</p>
        </div>
        {transfers.length > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
            {transfers.length}
          </span>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No transfers yet</p>
          <p className="text-sm text-gray-400">Owner transfers will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {transfers.slice(0, 5).map((transfer) => (
            <div key={transfer.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Transfer to Owner</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transfer.timestamp).toLocaleDateString()} • 
                    <span className={`font-medium ${
                      transfer.status === 'success' ? 'text-green-600' :
                      transfer.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {transfer.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-lg text-red-600">
                  -{transfer.amount} BNB
                </p>
                <a
                  href={getExplorerUrl(transfer.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  <span className="text-sm">View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
          
          {transfers.length > 5 && (
            <button className="w-full py-3 text-blue-500 hover:text-blue-600 font-medium transition-colors hover:bg-blue-50 rounded-2xl mt-2">
              View all {transfers.length} transfers
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Helper function to save transfer to history
export async function saveTransferToHistory(address: string, hash: string, amount: string) {
  try {
    await supabase
      .from('transfer_history')
      .insert({
        user_address: address.toLowerCase(),
        tx_hash: hash,
        amount: amount,
        status: 'pending'
      })
  } catch (err) {
    console.error('Error saving transfer to history:', err)
  }
}

// Helper function to update transfer status
export async function updateTransferStatus(hash: string, status: 'success' | 'failed') {
  try {
    await supabase
      .from('transfer_history')
      .update({ status })
      .eq('tx_hash', hash)
  } catch (err) {
    console.error('Error updating transfer status:', err)
  }
}