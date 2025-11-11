'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { AlertCircle } from 'lucide-react'
import { getChains } from '@/lib/chains'

export function ChainWarning() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  if (!isConnected) return null
  
  const supportedChains = getChains()
  const isSupported = supportedChains.some((chain: any) => chain.id === chainId)
  
  if (isSupported) return null
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-900 mb-1">Unsupported Network</p>
            <p className="text-sm text-yellow-800 mb-3">
              Please switch to a supported network to use this app.
            </p>
            <div className="flex flex-wrap gap-2">
              {supportedChains.slice(0, 3).map((chain: any) => (
                <button
                  key={chain.id}
                  onClick={() => switchChain?.({ chainId: chain.id })}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Switch to {chain.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
