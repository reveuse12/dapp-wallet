'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSendTransaction, useAccount, useBalance } from 'wagmi'
import { Send, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { showToast } from './toast'

const transferSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address'),
  amount: z.string().min(1, 'Amount required')
})

type FormData = { to: string; amount: string }

export function TransferForm() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending } = useSendTransaction()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<string>()
  const [recipientAddress, setRecipientAddress] = useState<string>()
  
  const { data: recipientBalance } = useBalance({ 
    address: recipientAddress as `0x${string}`,
    query: { enabled: !!recipientAddress }
  })

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    resolver: zodResolver(transferSchema)
  })

  const watchedAddress = watch('to')
  
  useEffect(() => {
    if (watchedAddress && /^0x[a-fA-F0-9]{40}$/.test(watchedAddress)) {
      setRecipientAddress(watchedAddress)
    } else {
      setRecipientAddress(undefined)
    }
  }, [watchedAddress])

  const onSubmit = async (data: FormData) => {
    if (!data.amount || !data.to) return
    
    setError('')
    setTxHash('')
    
    try {
      const amountInWei = BigInt(Math.floor(parseFloat(data.amount) * 1e18))
      
      sendTransaction({
        to: data.to as `0x${string}`,
        value: amountInWei
      }, {
        onSuccess: (hash) => {
          setTxHash(hash)
          reset()
          showToast('Transaction sent successfully!', 'success')
        },
        onError: (error) => {
          if (error.message.includes('User rejected') || error.message.includes('User denied')) {
            setError('Transaction cancelled by user')
            showToast('Transaction cancelled', 'error')
          } else if (error.message.includes('insufficient funds')) {
            setError('Insufficient funds for transaction')
            showToast('Insufficient funds', 'error')
          } else {
            setError('Transaction failed. Please try again.')
            showToast('Transaction failed', 'error')
          }
        }
      })
    } catch (error: any) {
      setError('Failed to send transaction')
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Send Funds</h2>
      <p className="text-gray-500 text-sm mb-6">Enter the details to send cryptocurrency.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-gray-900 font-medium mb-3">Recipient Address</label>
          <div className="flex gap-2">
            <input
              {...register('to')}
              placeholder="0x..."
              className="flex-1 px-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            <button 
              type="button" 
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => showToast('QR scanner not available in demo', 'info')}
            >
              <div className="w-5 h-5 border-2 border-gray-400 rounded border-dashed"></div>
            </button>
          </div>
          {errors.to && <p className="text-red-500 text-sm mt-2">{errors.to.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-900 font-medium mb-3">Amount</label>
            <input
              {...register('amount')}
              type="number"
              step="0.0001"
              placeholder="0"
              className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-gray-900 font-medium mb-3">Asset</label>
            <div className="relative">
              <select className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none">
                <option>BNB</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {balance && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-700">Available: {Number(balance.formatted).toFixed(4)} {balance.symbol}</p>
              <button
                type="button"
                onClick={() => {
                  const maxAmount = (Number(balance.formatted) * 0.99).toFixed(4) // Leave some for gas
                  const amountInput = document.querySelector('input[type="number"]') as HTMLInputElement
                  if (amountInput) {
                    amountInput.value = maxAmount
                    amountInput.dispatchEvent(new Event('input', { bubbles: true }))
                  }
                }}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
              >
                Max
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!address || isPending}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition-colors"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </div>
          ) : (
            'Send Transaction'
          )}
        </button>
      </form>

      {txHash && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl">
          <p className="text-sm text-green-700">
            Success! <a href={`https://testnet.bscscan.com/tx/${txHash}`} target="_blank" className="underline">View transaction</a>
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}