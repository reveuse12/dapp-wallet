import * as chains from 'viem/chains'

// Get all chains from viem
export const allChains = Object.values(chains)

export const getChains = () => allChains