'use client'

import { useAccount, useReadContract, useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { Send } from 'lucide-react'
import { showToast } from './toast'

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

const TOKENS = {
  testnet: [
    { address: '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684', symbol: 'USDT', decimals: 18 },
    { address: '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7', symbol: 'BUSD', decimals: 18 }
  ],
  mainnet: [
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18 },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18 }
  ]
}

export function TokenBalances({ onSendClick, onReceiveClick, onTransferClick }: { 
  onSendClick?: () => void
  onReceiveClick?: () => void
  onTransferClick?: () => void 
}) {
  const { address } = useAccount()
  const isMainnet = process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet'
  const tokens = isMainnet ? TOKENS.mainnet : TOKENS.testnet

  const { data: nativeBalance, isLoading: isLoadingBalance } = useBalance({ address })

  if (!address) return null

  // Get native token symbol based on chain
  const nativeSymbol = nativeBalance?.symbol || 'ETH'
  const nativeName = nativeSymbol === 'BNB' ? 'BNB' : nativeSymbol === 'ETH' ? 'Ethereum' : nativeSymbol

  return (
    <div className="space-y-4">
      {/* Mobile Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden mx-1">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="relative">
          <div className="mb-4">
            <p className="text-blue-100 text-xs font-medium mb-1">Total Balance</p>
            <h2 className="text-2xl font-bold mb-1">
              {isLoadingBalance ? '...' : nativeBalance ? `${Number(nativeBalance.formatted).toFixed(4)} ${nativeSymbol}` : '0.00'}
            </h2>
            <div className="flex justify-between items-center">
              <p className="text-blue-200 text-xs">+2.4% today</p>
              <p className="text-blue-200 text-xs font-mono">
                {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ''}
              </p>
            </div>
          </div>
          
          {/* Mobile Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onSendClick?.()}
              className="bg-white/15 backdrop-blur-sm active:bg-white/25 text-white py-3 px-2 rounded-xl font-medium transition-all flex flex-col items-center gap-1 text-xs"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
            <button 
              onClick={() => onReceiveClick?.()}
              className="bg-white/15 backdrop-blur-sm active:bg-white/25 text-white py-3 px-2 rounded-xl font-medium transition-all flex flex-col items-center gap-1 text-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
              Receive
            </button>
            <button 
              onClick={() => onTransferClick?.()}
              className="bg-red-500/90 active:bg-red-600 text-white py-3 px-2 rounded-xl font-medium transition-all flex flex-col items-center gap-1 text-xs shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              Transfer
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Assets List */}
      <div className="bg-white rounded-2xl mx-1 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Assets</h3>
        </div>
        
        <div>
          <div 
            className="flex items-center justify-between p-4 active:bg-gray-50 transition-colors"
            onClick={() => {
              if (address) {
                navigator.clipboard.writeText(address)
                showToast('Address copied to clipboard', 'info')
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{nativeSymbol[0]}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{nativeSymbol}</p>
                <p className="text-xs text-gray-500">{nativeName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {isLoadingBalance ? '...' : nativeBalance ? Number(nativeBalance.formatted).toFixed(4) : '0.0000'}
              </p>
              <p className="text-xs text-gray-500">{nativeSymbol}</p>
            </div>
          </div>
          
          {tokens.map((token) => (
            <TokenBalance key={token.address} token={token} userAddress={address} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TokenBalance({ token, userAddress }: { token: any, userAddress: string }) {
  const { data: balance, error, isLoading } = useReadContract({
    address: token.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`]
  })

  const formattedBalance = balance ? formatUnits(balance, token.decimals) : '0'
  const usdValue = Number(formattedBalance) * (token.symbol === 'USDT' ? 1 : 0.5)

  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case 'USDT': return { bg: 'from-green-400 to-emerald-500', text: 'T' }
      case 'BUSD': return { bg: 'from-yellow-400 to-amber-500', text: 'B' }
      default: return { bg: 'from-blue-400 to-indigo-500', text: symbol[0] }
    }
  }

  const icon = getTokenIcon(token.symbol)

  return (
    <div className="flex items-center justify-between p-4 active:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-gradient-to-r ${icon.bg} rounded-full flex items-center justify-center`}>
          <span className="text-white font-bold">{icon.text}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{token.symbol}</p>
          <p className="text-xs text-gray-500">
            {token.symbol === 'USDT' ? 'Tether' : token.symbol === 'BUSD' ? 'Binance USD' : 'Token'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">
          {isLoading ? '...' : error ? '0.0000' : Number(formattedBalance).toFixed(4)}
        </p>
        <p className="text-xs text-gray-500">
          ${isLoading ? '0.00' : error ? '0.00' : usdValue.toFixed(2)}
        </p>
      </div>
    </div>
  )
}