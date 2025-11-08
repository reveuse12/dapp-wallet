'use client'

import { useAccount } from 'wagmi'
import { useState } from 'react'
import { QrCode, Copy, Check } from 'lucide-react'
import { showToast } from './toast'

const ASSETS = [
  { id: 'bnb', name: 'BNB', fullName: 'Smart Chain', icon: '🟡', selected: true },
  { id: 'btc', name: 'Bitcoin', fullName: 'BTC', icon: '₿', selected: false },
  { id: 'eth', name: 'Ethereum', fullName: 'ETH', icon: '⟠', selected: false }
]

export function QRGenerator() {
  const { address } = useAccount()
  const [selectedAsset, setSelectedAsset] = useState('bnb')
  const [assets, setAssets] = useState(ASSETS)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      showToast('Address copied to clipboard', 'info')
    }
  }

  const selectAsset = (assetId: string) => {
    setSelectedAsset(assetId)
    setAssets(assets.map(asset => ({ ...asset, selected: asset.id === assetId })))
  }

  if (!address) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Receive Funds</h3>
      <p className="text-gray-500 text-sm mb-6">Share this QR code or address to receive funds.</p>
      
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`}
              alt="QR Code"
              className="w-48 h-48"
            />
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-3">Select Asset</p>
            <div className="space-y-2">
              {assets.map((asset) => (
                <div 
                  key={asset.id}
                  onClick={() => selectAsset(asset.id)}
                  className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                    asset.selected 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    asset.selected ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    {asset.selected ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <span className="text-sm">{asset.icon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      asset.selected ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {asset.name} ({asset.fullName})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={copyAddress}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Copy className="w-5 h-5" />
          Copy Address
        </button>
      </div>
    </div>
  )
}