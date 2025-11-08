'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Shield, Zap, Globe, ArrowRight, Check } from 'lucide-react'
import { MobileConnectButton } from './mobile-connect-button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Wallet</span>
          </div>
          <MobileConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Secure • Fast • Decentralized
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Gateway to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> DeFi</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Send, receive, and manage your crypto assets with enterprise-grade security. 
              Connect your wallet to access the decentralized financial ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  return (
                    <button
                      onClick={openConnectModal}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
                    >
                      Connect Wallet
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )
                }}
              </ConnectButton.Custom>
              
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>100% Non-custodial</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bank-Grade Security</h3>
              <p className="text-gray-600 text-sm">Your keys, your crypto. We never store or access your private keys.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Instant transactions with minimal gas fees on BSC network.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Access</h3>
              <p className="text-gray-600 text-sm">Access DeFi protocols worldwide, 24/7 without restrictions.</p>
            </div>
          </div>

          {/* Supported Wallets */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/50 mb-16">
            <h3 className="font-semibold text-gray-900 mb-6">Supported Wallets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'MetaMask', logo: '🦊' },
                { name: 'WalletConnect', logo: '🔗' },
                { name: 'Coinbase', logo: '🔵' },
                { name: 'Trust Wallet', logo: '🛡️' }
              ].map((wallet) => (
                <div key={wallet.name} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/50 transition-colors">
                  <div className="text-2xl">{wallet.logo}</div>
                  <span className="text-sm font-medium text-gray-700">{wallet.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">Open Source</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">Audited Smart Contracts</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Network: {process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet' ? 'BSC Mainnet' : 'BSC Testnet'} • 
            Built with security and privacy in mind
          </p>
        </div>
      </footer>
    </div>
  )
}