'use client'

import { useAccount, usePublicClient } from 'wagmi'
import { useState, useEffect } from 'react'
import { ExternalLink, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatEther } from 'viem'

type Transaction = {
  hash: string
  from: string
  to: string | null
  value: bigint
  blockNumber: bigint
  timestamp: number
  status: 'success' | 'pending' | 'failed'
}

export function TransactionHistory() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const itemsPerPage = 5

  const fetchTransactions = async () => {
    if (!address || !publicClient) return
    
    setLoading(true)
    try {
      const latestBlock = await publicClient.getBlockNumber()
      
      // Get recent blocks to find transactions (reduced to 10 blocks to avoid RPC limits)
      const recentTxs: Transaction[] = []
      for (let i = 0; i < 10; i++) {
        try {
          const block = await publicClient.getBlock({
            blockNumber: latestBlock - BigInt(i),
            includeTransactions: true
          })
          
          const userTxs = block.transactions.filter((tx: any) => 
            tx.from?.toLowerCase() === address.toLowerCase() || 
            tx.to?.toLowerCase() === address.toLowerCase()
          ).slice(0, 5)

          for (const tx of userTxs) {
            recentTxs.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              blockNumber: block.number,
              timestamp: Number(block.timestamp),
              status: 'success' as const
            })
          }
        } catch (error) {
          console.log('Block fetch error:', error)
        }
      }

      setTransactions(recentTxs.slice(0, 20))
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [address, publicClient])

  const getExplorerUrl = (hash: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet' 
      ? 'https://bscscan.com' 
      : 'https://testnet.bscscan.com'
    return `${baseUrl}/tx/${hash}`
  }

  const displayedTransactions = showAll 
    ? transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : transactions.slice(0, 5)
  
  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  if (!address) return null

  return (
    <div className="bg-white rounded-2xl mx-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="p-2 text-gray-400 active:text-gray-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="font-medium text-sm">No transactions</p>
          <p className="text-xs">Activity will appear here</p>
        </div>
      ) : (
        <div>
          {displayedTransactions.map((tx) => (
          <div key={tx.hash} className="flex items-center justify-between p-4 active:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.from.toLowerCase() === address.toLowerCase()
                  ? 'bg-gradient-to-r from-red-400 to-pink-500'
                  : 'bg-gradient-to-r from-green-400 to-emerald-500'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {tx.from.toLowerCase() === address.toLowerCase() ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  )}
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {tx.from.toLowerCase() === address.toLowerCase() ? 'Sent' : 'Received'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.timestamp * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-medium ${
                tx.from.toLowerCase() === address.toLowerCase()
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}>
                {tx.from.toLowerCase() === address.toLowerCase() ? '-' : '+'}
                {Number(formatEther(tx.value)).toFixed(4)}
              </p>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs text-gray-500">BNB</span>
                <a
                  href={getExplorerUrl(tx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          ))}
          
          {!showAll && transactions.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 text-blue-500 font-medium transition-colors active:bg-blue-50 text-sm"
            >
              View all {transactions.length} transactions
            </button>
          )}
          
          {showAll && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-3 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 active:text-gray-600 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 active:text-gray-600 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}