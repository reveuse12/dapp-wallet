'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import { useState } from 'react'
import { QrCode, Copy, Check, DollarSign, ChevronDown } from 'lucide-react'
import { showToast } from './toast'
import { QRCodeSVG } from 'qrcode.react'
import { getChains } from '@/lib/chains'

const COMMON_TOKENS = [
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'DAI', name: 'Dai Stablecoin' },
  { symbol: 'WETH', name: 'Wrapped Ether' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin' }
]

export function QRGenerator() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [selectedToken, setSelectedToken] = useState<'native' | string>('native')
  const [showTokenSelect, setShowTokenSelect] = useState(false)
  
  const currentChain = getChains().find((c: any) => c.id === chainId)
  const nativeSymbol = balance?.symbol || currentChain?.nativeCurrency?.symbol || 'ETH'

  const getTokenSymbol = () => {
    return selectedToken === 'native' ? nativeSymbol : selectedToken
  }

  const copyPaymentRequest = () => {
    if (!address) return
    
    const tokenSymbol = getTokenSymbol()
    const paymentText = amount 
      ? `Payment Request\n\nAmount: ${amount} ${tokenSymbol}\n${note ? `Note: ${note}\n` : ''}Address: ${address}`
      : `Send funds to: ${address}`
    
    navigator.clipboard.writeText(paymentText)
    showToast('Payment request copied!', 'success')
  }

  const sharePaymentRequest = async () => {
    if (!address) return
    
    const tokenSymbol = getTokenSymbol()
    const paymentText = amount 
      ? `Payment Request\n\nAmount: ${amount} ${tokenSymbol}\n${note ? `Note: ${note}\n` : ''}Address: ${address}`
      : `Send funds to: ${address}`
    
    if (navigator.share) {
      try {
        await navigator.share({ text: paymentText })
      } catch (err) {
        copyPaymentRequest()
      }
    } else {
      copyPaymentRequest()
    }
  }

  if (!address) return null

  const qrValue = amount 
    ? `${address}?amount=${amount}${note ? `&message=${encodeURIComponent(note)}` : ''}`
    : address

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Receive Funds</h3>
      <p className="text-gray-500 text-sm mb-6">Request a specific amount or just share your address.</p>
      
      <div className="space-y-6">
        {/* Payment Request Form */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Payment Request (Optional)</p>
          </div>
          
          <div className="space-y-3">
            {/* Token Selector */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Token</label>
              <div className="relative">
                <button
                  onClick={() => setShowTokenSelect(!showTokenSelect)}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-between hover:border-blue-300 transition-colors"
                >
                  <span className="font-medium">{getTokenSymbol()}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showTokenSelect && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedToken('native'); setShowTokenSelect(false); }}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <span className="font-medium">{nativeSymbol}</span>
                      <span className="text-xs text-gray-500">Native</span>
                    </button>
                    {COMMON_TOKENS.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => { setSelectedToken(token.symbol); setShowTokenSelect(false); }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors"
                      >
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-xs text-gray-500 block">{token.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount</label>
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment for..."
                className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100">
            <QRCodeSVG
              value={qrValue}
              size={192}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Payment Details */}
        {amount && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-medium mb-1">Requesting Payment</p>
            <p className="text-green-600 text-lg font-bold">{amount} {getTokenSymbol()}</p>
            {note && <p className="text-green-600 text-sm mt-1">{note}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={copyPaymentRequest}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={sharePaymentRequest}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}