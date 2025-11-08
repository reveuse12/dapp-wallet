'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { TransferForm } from '@/components/transfer-form'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <ConnectButton />
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">
            BNB Transfer Dapp
          </h1>
          <p className="text-gray-600 mb-8">
            Send BNB securely on BNB Smart Chain
          </p>

          {isConnected ? (
            <div className="flex justify-center">
              <TransferForm />
            </div>
          ) : (
            <div className="py-12">
              <p className="text-gray-600 text-lg">
                Connect your wallet to get started
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>
            Network: {process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </p>
        </footer>
      </div>
    </main>
  )
}