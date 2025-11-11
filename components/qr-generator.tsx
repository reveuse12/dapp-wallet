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
  { symbol: 'WBNB', name: 'Wrapped BNB' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
  { symbol: 'BUSD', name: 'Binance USD' }
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
    const symbol = selectedToken === 'native' ? nativeSymbol : selectedToken
    console.log('Selected Token:', selectedToken, 'Symbol:', symbol)
    return symbol
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

  // Generate QR value based on selected token
  const generateQRValue = () => {
    if (!address) return ''
    
    const tokenSymbol = getTokenSymbol()
    console.log('Generating QR for:', tokenSymbol, 'Amount:', amount)
    
    // If amount is specified, include it in the QR
    if (amount) {
      // For native token (ETH, BNB, etc.)
      if (selectedToken === 'native') {
        const qr = `ethereum:${address}@${chainId}?value=${parseFloat(amount) * 1e18}${note ? `&message=${encodeURIComponent(note)}` : ''}`
        console.log('Native QR:', qr)
        return qr
      }
      // For ERC20 tokens - include token info in the data
      const qr = `ethereum:${address}?token=${tokenSymbol}&amount=${amount}${note ? `&message=${encodeURIComponent(note)}` : ''}`
      console.log('Token QR:', qr)
      return qr
    }
    
    // Just address if no amount
    return `ethereum:${address}`
  }
  
  const qrValue = generateQRValue()
  console.log('Final QR Value:', qrValue)

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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedToken('native'); setShowTokenSelect(false); }}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-600">{nativeSymbol}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Native Token</span>
                      </div>
                      <span className="text-xs text-gray-500">Network native currency</span>
                    </button>
                    {COMMON_TOKENS.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => { setSelectedToken(token.symbol); setShowTokenSelect(false); }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{token.symbol}</div>
                        <div className="text-xs text-gray-500">{token.name}</div>
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
        <div>
          <div className="flex justify-center mb-3">
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-100">
              <QRCodeSVG
                key={`${selectedToken}-${amount}-${note}`}
                value={qrValue}
                size={192}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
          
          {/* QR Content Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 text-center">QR Code Contains:</p>
            <div className="space-y-1">
              <p className="text-xs font-mono text-gray-700 break-all text-center">
                {amount ? `${amount} ${getTokenSymbol()}` : 'Address only'}
              </p>
              <p className="text-xs font-mono text-gray-500 break-all text-center">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
              {note && <p className="text-xs text-gray-600 text-center italic">"{note}"</p>}
            </div>
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