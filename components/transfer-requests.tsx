'use client'

import { useAccount, useSendTransaction } from 'wagmi'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { parseEther } from 'viem'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { showToast } from './toast'

interface TransferRequest {
  id: number
  from_address: string
  to_address: string
  amount: string
  status: string
  created_at: string
}

export function TransferRequests() {
  const { address, isConnected } = useAccount()
  const { sendTransaction, isPending } = useSendTransaction()
  const [requests, setRequests] = useState<TransferRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    if (address) {
      fetchRequests()
      
      const subscription = supabase
        .channel('transfer_requests')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transfer_requests' },
          () => fetchRequests()
        )
        .subscribe()
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [address])

  const fetchRequests = async () => {
    if (!address) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('transfer_requests')
        .select('*')
        .eq('from_address', address.toLowerCase())
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setRequests(data || [])
    } catch (err) {
      console.error('Error fetching requests:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (request: TransferRequest) => {
    setProcessingId(request.id)
    try {
      sendTransaction({
        to: request.to_address as `0x${string}`,
        value: parseEther(request.amount)
      }, {
        onSuccess: async (hash) => {
          await supabase
            .from('transfer_requests')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', request.id)
          
          showToast('Transfer approved!', 'success')
          fetchRequests()
        },
        onError: (err: any) => {
          showToast('Transfer failed', 'error')
        }
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (request: TransferRequest) => {
    try {
      await supabase
        .from('transfer_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id)
      
      showToast('Request rejected', 'success')
      fetchRequests()
    } catch (err) {
      showToast('Failed to reject', 'error')
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Transfer Requests</h2>
        <p className="text-gray-500 text-sm">Connect wallet to see requests</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">Pending Requests</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500">To Admin</p>
                  <p className="font-mono text-xs text-gray-600 break-all">{request.to_address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{request.amount} BNB</p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(request)}
                  disabled={isPending && processingId === request.id}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isPending && processingId === request.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReject(request)}
                  disabled={isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
