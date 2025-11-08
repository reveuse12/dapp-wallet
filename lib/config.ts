import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { getChains } from './chains'

export const config = getDefaultConfig({
  appName: 'Multi-Chain Transfer Dapp',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: getChains() as any,
  ssr: true
})