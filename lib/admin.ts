import { supabase } from './supabase'

export async function isAdmin(address: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('wallet_address')
    .eq('wallet_address', address.toLowerCase())
    .eq('is_active', true)
    .maybeSingle()
  
  return !!data && !error
}

export async function getAdminAddresses(): Promise<string[]> {
  const { data, error } = await supabase
    .from('admins')
    .select('wallet_address')
    .eq('is_active', true)
  
  if (error) {
    console.error('Error fetching admin addresses:', error)
    return []
  }
  
  console.log('Admin addresses from DB:', data)
  return data?.map(d => d.wallet_address) || []
}
