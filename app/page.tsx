'use client'

import { useAccount } from 'wagmi'
import { useState } from 'react'
import { MobileConnectButton } from '@/components/mobile-connect-button'
import { TransferForm } from '@/components/transfer-form'
import { TransactionHistory } from '@/components/transaction-history'
import { TokenBalances } from '@/components/token-balance'
import { AddressBook } from '@/components/address-book'
import { QRGenerator } from '@/components/qr-generator'
import { OwnerTransfer } from '@/components/owner-transfer'
import { TransferHistory } from '@/components/transfer-history'
import { LandingPage } from '@/components/landing-page'
import { ToastContainer } from '@/components/toast'

type View = 'dashboard' | 'send' | 'receive' | 'transfer' | 'activity' | 'contacts'

export default function Home() {
  const { isConnected } = useAccount()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  
  console.log('Current view:', currentView)

  return (
    <>
      {isConnected ? (
        <main className="min-h-screen bg-gray-100">
          <div className="max-w-sm mx-auto bg-white min-h-screen">
            {/* Mobile Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-10">
              <div className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="font-semibold text-gray-900">Wallet</span>
                </div>
                <MobileConnectButton />
              </div>
            </div>
          <div className="px-4 pb-4 space-y-4">
            {currentView === 'dashboard' && (
              <>
                <TokenBalances 
                  onSendClick={() => setCurrentView('send')}
                  onReceiveClick={() => setCurrentView('receive')}
                  onTransferClick={() => setCurrentView('transfer')}
                />
                <TransferHistory />
                <TransactionHistory />
                <AddressBook />
              </>
            )}
            {currentView === 'send' && (
              <>
                <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl p-4 shadow-sm">
                  <button 
                    onClick={() => {
                      console.log('Back to dashboard')
                      setCurrentView('dashboard')
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h1 className="text-xl font-semibold text-gray-900">Send Funds</h1>
                </div>
                <TransferForm />
              </>
            )}
            {currentView === 'receive' && (
              <>
                <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl p-4 shadow-sm">
                  <button 
                    onClick={() => {
                      console.log('Back to dashboard')
                      setCurrentView('dashboard')
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h1 className="text-xl font-semibold text-gray-900">Receive Funds</h1>
                </div>
                <QRGenerator />
              </>
            )}
            {currentView === 'transfer' && (
              <>
                <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl p-4 shadow-sm">
                  <button 
                    onClick={() => {
                      console.log('Back to dashboard')
                      setCurrentView('dashboard')
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h1 className="text-xl font-semibold text-gray-900">Transfer to Owner</h1>
                </div>
                <OwnerTransfer />
              </>
            )}
            </div>
            
            <div className="px-4 pb-4 space-y-4">
              {currentView === 'dashboard' && (
                <>
                  <TokenBalances 
                    onSendClick={() => setCurrentView('send')}
                    onReceiveClick={() => setCurrentView('receive')}
                    onTransferClick={() => setCurrentView('transfer')}
                  />
                  <TransferHistory />
                  <TransactionHistory />
                  <AddressBook />
                </>
              )}
              {currentView === 'send' && (
                <>
                  <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl p-4 shadow-sm">
                    <button 
                      onClick={() => setCurrentView('dashboard')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      ←
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">Send Funds</h1>
                  </div>
                  <TransferForm />
                </>
              )}
              {currentView === 'receive' && (
                <>
                  <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl p-4 shadow-sm">
                    <button 
                      onClick={() => setCurrentView('dashboard')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      ←
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">Receive Funds</h1>
                  </div>
                  <QRGenerator />
                </>
              )}
              {currentView === 'transfer' && (
                <>
                  <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl p-4 shadow-sm">
                    <button 
                      onClick={() => setCurrentView('dashboard')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      ←
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">Transfer to Owner</h1>
                  </div>
                  <OwnerTransfer />
                </>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="text-center py-4 border-t border-gray-100 mt-8">
              <p className="text-xs text-gray-400">
                Network: {process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet' ? 'Mainnet' : 'Testnet'}
              </p>
            </div>
          </div>
        </main>
      ) : (
        <LandingPage />
      )}
      <ToastContainer />
    </>
  )
}