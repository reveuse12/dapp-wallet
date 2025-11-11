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
import { ChainWarning } from '@/components/chain-warning'
import { UserAuthorization } from '@/components/user-authorization'
import { AdminDashboard } from '@/components/admin-dashboard'
import { TransferRequests } from '@/components/transfer-requests'
import { AdminReceivedTransfers } from '@/components/admin-received-transfers'
import { UserSentTransfers } from '@/components/user-sent-transfers'
import { LayoutDashboard, Shield, Clock, Send, Download, ArrowLeftRight, Menu, X } from 'lucide-react'

type View = 'dashboard' | 'send' | 'receive' | 'transfer' | 'activity' | 'contacts' | 'authorize' | 'admin' | 'requests'

export default function Home() {
  const { isConnected } = useAccount()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <ChainWarning />
      {isConnected ? (
        <main className="min-h-screen bg-gray-100 flex">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 min-h-screen flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">Wallet</span>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              
              <button
                onClick={() => setCurrentView('authorize')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'authorize'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                Authorize
              </button>
              
              <button
                onClick={() => setCurrentView('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'admin'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin
              </button>
              
              <button
                onClick={() => setCurrentView('requests')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'requests'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-5 h-5" />
                Requests
              </button>
              
              <button
                onClick={() => setCurrentView('send')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'send'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Send className="w-5 h-5" />
                Send
              </button>
              
              <button
                onClick={() => setCurrentView('receive')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'receive'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Download className="w-5 h-5" />
                Receive
              </button>
              
              <button
                onClick={() => setCurrentView('transfer')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'transfer'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5" />
                Transfer
              </button>
            </nav>

            <div className="p-4 border-t border-gray-200">
              <MobileConnectButton />
            </div>
          </aside>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
          )}

          {/* Sidebar - Mobile */}
          <aside className={`md:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">Wallet</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <button
                onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => { setCurrentView('authorize'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'authorize' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <Shield className="w-5 h-5" />
                Authorize
              </button>
              <button
                onClick={() => { setCurrentView('admin'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'admin' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <Shield className="w-5 h-5" />
                Admin
              </button>
              <button
                onClick={() => { setCurrentView('requests'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'requests' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <Clock className="w-5 h-5" />
                Requests
              </button>
              <button
                onClick={() => { setCurrentView('send'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'send' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <Send className="w-5 h-5" />
                Send
              </button>
              <button
                onClick={() => { setCurrentView('receive'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'receive' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <Download className="w-5 h-5" />
                Receive
              </button>
              <button
                onClick={() => { setCurrentView('transfer'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'transfer' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                <ArrowLeftRight className="w-5 h-5" />
                Transfer
              </button>
            </nav>

            <div className="p-4 border-t border-gray-200">
              <MobileConnectButton />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-semibold text-gray-900">Wallet</span>
              <div className="w-10" />
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-6">
              <div className="space-y-4 md:space-y-6">
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
              {currentView === 'authorize' && (
                <>
                  <UserAuthorization />
                  <UserSentTransfers />
                </>
              )}
              {currentView === 'admin' && (
                <>
                  <AdminDashboard />
                  <AdminReceivedTransfers />
                </>
              )}
              {currentView === 'requests' && (
                <TransferRequests />
              )}
              {currentView === 'send' && <TransferForm />}
              {currentView === 'receive' && <QRGenerator />}
              {currentView === 'transfer' && <OwnerTransfer />}
              </div>
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