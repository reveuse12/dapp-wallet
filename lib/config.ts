import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { getChains } from './chains'

export const config = getDefaultConfig({
  appName: 'Multi-Chain Transfer Dapp',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: getChains() as any,
  ssr: true
})

// Admin address for the authorization system
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0x742d35Cc6634C0532925a3b8D91D0a74b4A3Bb31'