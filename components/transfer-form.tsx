'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSendTransaction, useAccount, useBalance } from 'wagmi'
import { Send, Loader2 } from 'lucide-react'
import { z } from 'zod'

const addressSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address')
})

type FormData = { to: string }

export function TransferForm() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending } = useSendTransaction()
  const [txHash, setTxHash] = useState<string>()
  const [recipientAddress, setRecipientAddress] = useState<string>()
  
  const { data: recipientBalance } = useBalance({ 
    address: recipientAddress as `0x${string}`,
    query: { enabled: !!recipientAddress }
  })

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    resolver: zodResolver(addressSchema)
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
    if (!recipientBalance?.value) return
    
    try {
      sendTransaction({
        to: address as `0x${string}`,
        value: recipientBalance.value
      }, {
        onSuccess: (hash) => {
          setTxHash(hash)
          reset()
          setRecipientAddress(undefined)
        },
        onError: (error) => {
          console.error(error)
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6">Transfer Balance</h2>
      
      {balance && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Your Balance: {Number(balance.formatted).toFixed(4)} {balance.symbol}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Address to Transfer From</label>
          <input
            {...register('to')}
            placeholder="0x..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
          />
          {errors.to && <p className="text-red-500 text-sm mt-1">{errors.to.message}</p>}
        </div>

        {recipientBalance && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Available Balance: {Number(recipientBalance.formatted).toFixed(4)} {recipientBalance.symbol}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!address || isPending || !recipientBalance?.value}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Transfer to Me
            </>
          )}
        </button>
      </form>

      {txHash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Transaction: <a href={`https://testnet.bscscan.com/tx/${txHash}`} target="_blank" className="underline">View on Explorer</a>
          </p>
        </div>
      )}
    </div>
  )
}