import { supabase } from '@/lib/supabase'

export interface Authorization {
  id: number
  user_id: number
  admin_id: number
  user_address: string
  admin_address: string
  authorized: boolean
  authorized_at: string
  revoked_at?: string
  expiration_date?: string
  amount_limit?: string
  notes?: string
  created_at: string
  updated_at: string
}

/**
 * Authorize an admin
 */
export async function authorizeAdmin(
  userAddress: string,
  adminAddress: string,
  options?: {
    expirationDate?: string
    amountLimit?: string
    notes?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const userAddr = userAddress.toLowerCase()
    const adminAddr = adminAddress.toLowerCase()
    
    // Get or create user
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', userAddr)
      .maybeSingle()
    
    if (!user) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ wallet_address: userAddr })
        .select('id')
        .single()
      
      if (userError) throw userError
      user = newUser
    }
    
    // Get admin
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('wallet_address', adminAddr)
      .eq('is_active', true)
      .maybeSingle()
    
    if (!admin) {
      return { success: false, error: 'Admin not found or inactive' }
    }
    
    // Check if authorization already exists
    const { data: existing } = await supabase
      .from('authorizations')
      .select('*')
      .eq('user_id', user.id)
      .eq('admin_id', admin.id)
      .maybeSingle()
    
    if (existing) {
      // Update existing authorization
      const { error } = await supabase
        .from('authorizations')
        .update({
          authorized: true,
          authorized_at: new Date().toISOString(),
          revoked_at: null,
          expiration_date: options?.expirationDate || null,
          amount_limit: options?.amountLimit || null,
          notes: options?.notes || null
        })
        .eq('id', existing.id)
      
      if (error) throw error
    } else {
      // Create new authorization
      const { error } = await supabase
        .from('authorizations')
        .insert({
          user_id: user.id,
          admin_id: admin.id,
          user_address: userAddr,
          admin_address: adminAddr,
          authorized: true,
          authorized_at: new Date().toISOString(),
          expiration_date: options?.expirationDate || null,
          amount_limit: options?.amountLimit || null,
          notes: options?.notes || null
        })
      
      if (error) throw error
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error authorizing admin:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Revoke admin authorization
 */
export async function revokeAdminAuthorization(
  userAddress: string,
  adminAddress: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userAddr = userAddress.toLowerCase()
    const adminAddr = adminAddress.toLowerCase()
    
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', userAddr)
      .maybeSingle()
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    
    // Get admin ID
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('wallet_address', adminAddr)
      .maybeSingle()
    
    if (!admin) {
      return { success: false, error: 'Admin not found' }
    }
    
    // Update authorization
    const { error } = await supabase
      .from('authorizations')
      .update({
        authorized: false,
        revoked_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('admin_id', admin.id)
    
    if (error) throw error
    
    return { success: true }
  } catch (error: any) {
    console.error('Error revoking authorization:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if user has authorized an admin
 */
export async function isAdminAuthorized(
  userAddress: string,
  adminAddress: string
): Promise<boolean> {
  try {
    const userAddr = userAddress.toLowerCase()
    const adminAddr = adminAddress.toLowerCase()
    
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', userAddr)
      .maybeSingle()
    
    if (!user) return false
    
    // Get admin ID
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('wallet_address', adminAddr)
      .eq('is_active', true)
      .maybeSingle()
    
    if (!admin) return false
    
    // Check authorization
    const { data } = await supabase
      .from('authorizations')
      .select('*')
      .eq('user_id', user.id)
      .eq('admin_id', admin.id)
      .eq('authorized', true)
      .maybeSingle()
    
    if (!data) return false
    
    // Check expiration
    if (data.expiration_date) {
      const expiration = new Date(data.expiration_date)
      if (expiration < new Date()) {
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error checking authorization:', error)
    return false
  }
}

/**
 * Get all authorized admins for a user
 */
export async function getAuthorizedAdmins(userAddress: string) {
  try {
    const userAddr = userAddress.toLowerCase()
    
    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', userAddr)
      .maybeSingle()
    
    if (!user) return []
    
    const { data, error } = await supabase
      .from('authorizations')
      .select(`
        *,
        admins (
          wallet_address,
          role,
          permissions
        )
      `)
      .eq('user_id', user.id)
      .eq('authorized', true)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting authorized admins:', error)
    return []
  }
}

/**
 * Get all users who authorized an admin
 */
export async function getAuthorizedUsers(adminAddress: string) {
  try {
    const adminAddr = adminAddress.toLowerCase()
    
    // Get admin ID
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('wallet_address', adminAddr)
      .maybeSingle()
    
    if (!admin) return []
    
    const { data, error } = await supabase
      .from('authorizations')
      .select(`
        *,
        users (
          wallet_address,
          last_seen_at,
          total_logins
        )
      `)
      .eq('admin_id', admin.id)
      .eq('authorized', true)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting authorized users:', error)
    return []
  }
}
