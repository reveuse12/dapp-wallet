import { defineChain } from 'viem'
import { sepolia, polygonAmoy } from 'viem/chains'

export const bscTestnet = defineChain({
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] }
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' }
  },
  testnet: true
})

export const bscMainnet = defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed.binance.org'] }
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' }
  }
})

export const testnets = [bscTestnet, sepolia, polygonAmoy]
export const mainnets = [bscMainnet]

export const getChains = () => process.env.NEXT_PUBLIC_NETWORK_MODE === 'mainnet' ? mainnets : testnets