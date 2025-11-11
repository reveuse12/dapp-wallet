import { supabase } from '@/lib/supabase'

export interface User {
  id: number
  wallet_address: string
  first_seen_at: string
  last_seen_at: string
  total_logins: number
  is_active: boolean
  metadata: Record<string, any>
}

export interface AuditLogEntry {
  user_id?: number
  action: string
  entity_type?: string
  entity_id?: number
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

/**
 * Register or update user when wallet connects
 */
export async function registerUserLogin(walletAddress: string): Promise<User | null> {
  try {
    const address = walletAddress.toLowerCase()
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', address)
      .maybeSingle()
    
    if (existingUser) {
      // Update last seen and increment login count
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          last_seen_at: new Date().toISOString(),
          total_logins: existingUser.total_logins + 1
        })
        .eq('wallet_address', address)
        .select()
        .single()
      
      if (error) throw error
      
      // Log the login
      await logAuditEvent({
        user_id: updatedUser.id,
        action: 'login',
        entity_type: 'user',
        entity_id: updatedUser.id,
        new_values: { login_count: updatedUser.total_logins }
      })
      
      return updatedUser
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          wallet_address: address,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          total_logins: 1,
          is_active: true,
          metadata: {}
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Log the registration
      await logAuditEvent({
        user_id: newUser.id,
        action: 'register',
        entity_type: 'user',
        entity_id: newUser.id,
        new_values: { wallet_address: address }
      })
      
      return newUser
    }
  } catch (error) {
    console.error('Error registering user login:', error)
    return null
  }
}

/**
 * Get user by wallet address
 */
export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Check if user is an admin
 */
export async function isUserAdmin(walletAddress: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_active', true)
      .maybeSingle()
    
    return !!data && !error
  } catch (error) {
    return false
  }
}

/**
 * Get admin details
 */
export async function getAdminByWallet(walletAddress: string) {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_active', true)
      .maybeSingle()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting admin:', error)
    return null
  }
}

/**
 * Log audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    // Get user agent and IP (in production, get from request headers)
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    
    await supabase
      .from('audit_log')
      .insert({
        ...entry,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging audit event:', error)
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: number) {
  try {
    const [authCount, transferCount, contactCount] = await Promise.all([
      supabase
        .from('authorizations')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      supabase
        .from('transfer_requests')
        .select('id', { count: 'exact' })
        .eq('from_user_id', userId),
      supabase
        .from('address_book')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
    ])
    
    return {
      authorizations: authCount.count || 0,
      transfers: transferCount.count || 0,
      contacts: contactCount.count || 0
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return { authorizations: 0, transfers: 0, contacts: 0 }
  }
}
