'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, ChevronDown, Copy, LogOut } from 'lucide-react'
import { useState } from 'react'
import { showToast } from './toast'

export function MobileConnectButton() {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, openAccountModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div className="relative">
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium text-sm active:scale-95 transition-all"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-2 rounded-xl font-medium text-sm flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {account.displayName?.[0] || 'W'}
                      </span>
                    </div>
                    <span className="hidden sm:inline">
                      {account.displayName}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                        {/* Account Info */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {account.displayName?.[0] || 'W'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{account.displayName}</p>
                              <p className="text-xs text-gray-500">Connected</p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-mono">
                                {account.address}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(account.address)
                                  showToast('Address copied!', 'info')
                                  setShowMenu(false)
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Copy className="w-3 h-3 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Network Info */}
                        <div className="p-4 border-b border-gray-100">
                          <button
                            onClick={() => {
                              openChainModal()
                              setShowMenu(false)
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <div className="text-left">
                                <p className="font-medium text-gray-900 text-sm">{chain.name}</p>
                                <p className="text-xs text-gray-500">Network</p>
                              </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              openAccountModal()
                              setShowMenu(false)
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-colors text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium text-sm">Disconnect</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}