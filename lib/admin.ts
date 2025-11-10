import { supabase } from './supabase'

export async function isAdmin(address: string): Promise<boolean> {
  const { data } = await supabase
    .from('admin_wallets')
    .select('wallet_address')
    .eq('wallet_address', address.toLowerCase())
    .eq('is_active', true)
    .single()
  
  return !!data
}

export async function getAdminAddresses(): Promise<string[]> {
  const { data } = await supabase
    .from('admin_wallets')
    .select('wallet_address')
    .eq('is_active', true)
  
  return data?.map(d => d.wallet_address) || []
}
