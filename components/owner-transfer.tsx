'use client'

import { useState } from 'react'
import { useAccount, useBalance, useSendTransaction, useEstimateGas } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Send, AlertTriangle, Loader2 } from 'lucide-react'
import { showToast } from './toast'
import { saveTransferToHistory } from './transfer-history'

// Owner wallet address - replace with actual owner address
const OWNER_WALLET = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A' as const

export function OwnerTransfer() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending } = useSendTransaction()
  const [transferAmount, setTransferAmount] = useState('')
  const [isFullTransfer, setIsFullTransfer] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<string>()

  // Estimate gas for the transaction
  const { data: gasEstimate } = useEstimateGas({
    to: OWNER_WALLET,
    value: transferAmount ? parseEther(transferAmount) : undefined,
    query: { enabled: !!transferAmount && !!address }
  })

  const calculateMaxTransfer = () => {
    if (!balance || !gasEstimate) return '0'
    const gasInEth = formatEther(gasEstimate * BigInt(20000000000)) // 20 gwei
    const maxAmount = Number(balance.formatted) - Number(gasInEth) - 0.001 // Extra buffer
    return Math.max(0, maxAmount).toFixed(6)
  }

  const handleTransfer = async () => {
    if (!address || !balance) return
    
    setError('')
    setTxHash('')
    
    try {
      const amount = isFullTransfer ? calculateMaxTransfer() : transferAmount
      
      if (!amount || Number(amount) <= 0) {
        setError('Invalid transfer amount')
        return
      }

      const amountInWei = parseEther(amount)
      
      if (amountInWei >= balance.value) {
        setError('Insufficient funds for transfer and gas fees')
        return
      }

      sendTransaction({
        to: OWNER_WALLET,
        value: amountInWei
      }, {
        onSuccess: (hash) => {
          setTxHash(hash)
          if (address) {
            saveTransferToHistory(address, hash, amount)
          }
          setTransferAmount('')
          setIsFullTransfer(false)
          showToast('Transfer completed successfully!', 'success')
        },
        onError: (error) => {
          if (error.message.includes('User rejected') || error.message.includes('User denied')) {
            setError('Transfer cancelled by user')
            showToast('Transfer cancelled', 'error')
          } else if (error.message.includes('insufficient funds')) {
            setError('Insufficient funds for transfer')
            showToast('Insufficient funds', 'error')
          } else {
            setError('Transfer failed. Please try again.')
            showToast('Transfer failed', 'error')
          }
        }
      })
    } catch (error: any) {
      setError('Failed to initiate transfer')
      showToast('Transfer failed', 'error')
    }
  }

  if (!address) return null

  return (
    <div className="space-y-4 px-1">
      {/* Mobile Balance Display */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white">
        <div className="text-center">
          <p className="text-blue-100 text-xs mb-1">Available Balance</p>
          <p className="text-2xl font-bold mb-1">
            {balance ? Number(balance.formatted).toFixed(4) : '0.0000'} {balance?.symbol || 'BNB'}
          </p>
          <p className="text-blue-200 text-sm">
            ≈ ${balance ? (Number(balance.formatted) * 600).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Mobile Transfer Form */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Transfer to Owner</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Recipient Display */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">O</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Owner Wallet</p>
                <p className="text-xs font-mono text-gray-500">
                  {OWNER_WALLET.slice(0, 8)}...{OWNER_WALLET.slice(-6)}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <button
                onClick={() => {
                  const maxAmount = calculateMaxTransfer()
                  setTransferAmount(maxAmount)
                  setIsFullTransfer(true)
                }}
                className="text-xs text-blue-500 font-medium px-2 py-1 bg-blue-50 rounded"
              >
                Max
              </button>
            </div>
            
            <div className="relative">
              <input
                type="number"
                step="0.000001"
                placeholder="0.0"
                value={transferAmount}
                onChange={(e) => {
                  setTransferAmount(e.target.value)
                  setIsFullTransfer(false)
                }}
                className="w-full text-xl font-semibold bg-gray-50 border-0 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400 text-sm">{balance?.symbol || 'BNB'}</span>
              </div>
            </div>
            
            {balance && (
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Max: {calculateMaxTransfer()}</span>
                <span>≈ ${transferAmount ? (Number(transferAmount) * 600).toFixed(2) : '0.00'}</span>
              </div>
            )}
          </div>

          {/* Network Fee */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Network Fee</span>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">~0.001 BNB</p>
                <p className="text-xs text-gray-500">≈ $0.60</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          {transferAmount && Number(transferAmount) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Confirm Transfer</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Transfer {transferAmount} {balance?.symbol} to owner. Cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transfer Button */}
        <div className="p-4 pt-0">
          <button
            onClick={handleTransfer}
            disabled={!address || isPending || !transferAmount || Number(transferAmount) <= 0}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 active:from-red-600 active:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Confirm Transfer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {txHash && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mx-1">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Transfer Successful</p>
              <a 
                href={`${process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet' ? 'https://bscscan.com' : 'https://testnet.bscscan.com'}/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-green-600 underline"
              >
                View transaction
              </a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mx-1">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Transfer Failed</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}