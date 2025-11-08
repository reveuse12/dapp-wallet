import { clsx, type ClassValue } from 'clsx'
import { isAddress, formatEther, parseEther } from 'ethers'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const transferSchema = z.object({
  to: z.string().refine(isAddress, 'Invalid address'),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Invalid amount')
})

export const formatBalance = (balance: bigint) => formatEther(balance)
export const parseAmount = (amount: string) => parseEther(amount)
export const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`