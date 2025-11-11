import { supabase } from '@/lib/supabase'
import { logAuditEvent } from './user.service'

export interface TransferRequest {
  id: number
  authorization_id?: number
  from_user_id: number
  to_admin_id: number
  from_address: string
  to_address: string
  amount: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'
  tx_hash?: string
  requested_at: string
  responded_at?: string
  completed_at?: string
  rejection_reason?: string
  metadata?: Record<string, any>
}

/**
 * Create a transfer request (admin requests transfer from user)
 */
export async function createTransferRequest(
  fromUserId: number,
  toAdminId: number,
  fromAddress: string,
  toAddress: string,
  amount: string,
  authorizationId?: number
): Promise<{ success: boolean; requestId?: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('transfer_requests')
      .insert({
        authorization_id: authorizationId,
        from_user_id: fromUserId,
        to_admin_id: toAdminId,
        from_address: fromAddress.toLowerCase(),
        to_address: toAddress.toLowerCase(),
        amount,
        status: 'pending',
        requested_at: new Date().toISOString(),
        metadata: {}
      })
      .select()
      .single()
    
    if (error) throw error
    
    await logAuditEvent({
      user_id: toAdminId,
      action: 'create_transfer_request',
      entity_type: 'transfer_request',
      entity_id: data.id,
      new_values: { amount, from_address: fromAddress, to_address: toAddress }
    })
    
    return { success: true, requestId: data.id }
  } catch (error: any) {
    console.error('Error creating transfer request:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Approve transfer request (user approves)
 */
export async function approveTransferRequest(
  requestId: number,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('transfer_requests')
      .update({
        status: 'approved',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('from_user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    await logAuditEvent({
      user_id: userId,
      action: 'approve_transfer_request',
      entity_type: 'transfer_request',
      entity_id: requestId,
      old_values: { status: 'pending' },
      new_values: { status: 'approved' }
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error approving transfer request:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Reject transfer request (user rejects)
 */
export async function rejectTransferRequest(
  requestId: number,
  userId: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('transfer_requests')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', requestId)
      .eq('from_user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    await logAuditEvent({
      user_id: userId,
      action: 'reject_transfer_request',
      entity_type: 'transfer_request',
      entity_id: requestId,
      old_values: { status: 'pending' },
      new_values: { status: 'rejected', reason }
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error rejecting transfer request:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Complete transfer request (after blockchain transaction)
 */
export async function completeTransferRequest(
  requestId: number,
  txHash: string,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('transfer_requests')
      .update({
        status: 'completed',
        tx_hash: txHash,
        completed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()
    
    if (error) throw error
    
    // Also create transfer history entry
    await supabase
      .from('transfer_history')
      .insert({
        user_id: userId,
        transfer_request_id: requestId,
        user_address: data.from_address,
        tx_hash: txHash,
        amount: data.amount,
        transfer_type: 'admin_request',
        status: 'success'
      })
    
    await logAuditEvent({
      user_id: userId,
      action: 'complete_transfer_request',
      entity_type: 'transfer_request',
      entity_id: requestId,
      new_values: { status: 'completed', tx_hash: txHash }
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error completing transfer request:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Mark transfer request as failed
 */
export async function failTransferRequest(
  requestId: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('transfer_requests')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', requestId)
    
    if (error) throw error
    
    await logAuditEvent({
      action: 'fail_transfer_request',
      entity_type: 'transfer_request',
      entity_id: requestId,
      new_values: { status: 'failed', reason }
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error failing transfer request:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get pending transfer requests for a user
 */
export async function getPendingTransferRequests(userId: number) {
  try {
    const { data, error } = await supabase
      .from('transfer_requests')
      .select(`
        *,
        admins (
          wallet_address,
          role
        )
      `)
      .eq('from_user_id', userId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting pending requests:', error)
    return []
  }
}

/**
 * Get all transfer requests for admin
 */
export async function getAdminTransferRequests(adminId: number, status?: string) {
  try {
    let query = supabase
      .from('transfer_requests')
      .select(`
        *,
        users (
          wallet_address,
          last_seen_at
        )
      `)
      .eq('to_admin_id', adminId)
      .order('requested_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting admin requests:', error)
    return []
  }
}

/**
 * Save transfer to history
 */
export async function saveTransferToHistory(
  userId: number,
  userAddress: string,
  txHash: string,
  amount: string,
  transferType: 'owner' | 'admin_request' | 'regular' = 'owner'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('transfer_history')
      .insert({
        user_id: userId,
        user_address: userAddress.toLowerCase(),
        tx_hash: txHash,
        amount,
        transfer_type: transferType,
        status: 'pending'
      })
    
    if (error) throw error
    
    await logAuditEvent({
      user_id: userId,
      action: 'save_transfer_history',
      entity_type: 'transfer_history',
      new_values: { tx_hash: txHash, amount, type: transferType }
    })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving transfer to history:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update transfer status in history
 */
export async function updateTransferStatus(
  txHash: string,
  status: 'success' | 'failed',
  blockNumber?: string,
  gasUsed?: string,
  gasPrice?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('transfer_history')
      .update({
        status,
        block_number: blockNumber,
        gas_used: gasUsed,
        gas_price: gasPrice
      })
      .eq('tx_hash', txHash)
    
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error updating transfer status:', error)
    return { success: false, error: error.message }
  }
}
