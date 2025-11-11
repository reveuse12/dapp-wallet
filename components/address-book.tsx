'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Plus, Trash2, Copy, Loader2 } from 'lucide-react'
import { showToast } from './toast'
import { supabase } from '@/lib/supabase'
import type { AddressBookEntry } from '@/lib/supabase'

type SavedAddress = {
  id: number
  name: string
  address: string
}

export function AddressBook() {
  const { address: userAddress } = useAccount()
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (userAddress) {
      fetchAddresses()
      
      // Real-time subscription
      const subscription = supabase
        .channel('address_book')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'address_book',
            filter: `user_address=eq.${userAddress.toLowerCase()}`
          },
          () => fetchAddresses()
        )
        .subscribe()
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [userAddress])

  const fetchAddresses = async () => {
    if (!userAddress) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('address_book')
        .select('*')
        .eq('user_address', userAddress.toLowerCase())
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setAddresses(data?.map(d => ({
        id: d.id!,
        name: d.contact_name,
        address: d.contact_address
      })) || [])
    } catch (err) {
      console.error('Error fetching addresses:', err)
      showToast('Failed to load contacts', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const saveAddress = async () => {
    if (!name || !address || !userAddress) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('address_book')
        .insert({
          user_address: userAddress.toLowerCase(),
          contact_name: name,
          contact_address: address.toLowerCase()
        })
      
      if (error) throw error
      
      setName('')
      setAddress('')
      setShowForm(false)
      showToast('Contact saved successfully', 'success')
    } catch (err: any) {
      console.error('Error saving address:', err)
      if (err.code === '23505') {
        showToast('Contact already exists', 'error')
      } else {
        showToast('Failed to save contact', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const deleteAddress = async (id: number) => {
    try {
      const { error } = await supabase
        .from('address_book')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      showToast('Contact deleted', 'success')
    } catch (err) {
      console.error('Error deleting address:', err)
      showToast('Failed to delete contact', 'error')
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    showToast('Address copied to clipboard', 'info')
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
          <p className="text-sm text-gray-500">Saved wallet addresses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`p-3 rounded-2xl transition-colors ${
            showForm 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          {showForm ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
            <input
              type="text"
              placeholder="Enter contact name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={saveAddress}
              disabled={!name || !address || isSaving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-medium transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Contact'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setName('')
                setAddress('')
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-1">
          {addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">No contacts saved</p>
            <p className="text-sm text-gray-400">Add contacts for quick transfers</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors"
            >
              Add First Contact
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {addr.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{addr.name}</div>
                  <div className="text-sm text-gray-500 font-mono">
                    {addr.address.slice(0, 8)}...{addr.address.slice(-6)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyAddress(addr.address)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      )}
    </div>
  )
}