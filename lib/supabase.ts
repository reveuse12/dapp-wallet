import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Authorization {
  id?: number
  user_address: string
  admin_address: string
  authorized: boolean
  created_at?: string
  updated_at?: string
}

export interface AddressBookEntry {
  id?: number
  user_address: string
  contact_name: string
  contact_address: string
  created_at?: string
}

export interface TransferHistoryEntry {
  id?: number
  user_address: string
  tx_hash: string
  amount: string
  status: 'pending' | 'success' | 'failed'
  created_at?: string
}
