# Migration Guide: localStorage to Supabase

## Overview

This guide covers the migration of Address Book and Transfer History from localStorage to Supabase database.

## Step 1: Run SQL Migration

Open your Supabase SQL Editor and run the SQL from `docs/supabase-migration.sql`:

```sql
-- This will create:
-- 1. address_book table
-- 2. transfer_history table
-- 3. Indexes for performance
-- 4. Row Level Security policies
-- 5. Real-time subscriptions
```

## Step 2: Verify Tables Created

In Supabase Dashboard:
1. Go to Table Editor
2. Verify these tables exist:
   - `address_book`
   - `transfer_history`
3. Check that real-time is enabled for both tables

## Step 3: Restart Development Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## What Changed

### Address Book (`components/address-book.tsx`)
**Before:**
- Stored contacts in `localStorage` with key `addressBook`
- Data was local to browser only

**After:**
- Stores contacts in Supabase `address_book` table
- Data syncs across all devices
- Real-time updates when contacts are added/removed
- Each user's contacts are isolated by `user_address`

### Transfer History (`components/transfer-history.tsx`)
**Before:**
- Stored transfers in `localStorage` with key `ownerTransfers_{address}`
- Data was local to browser only

**After:**
- Stores transfers in Supabase `transfer_history` table
- Data syncs across all devices
- Real-time updates when transfers are made
- Status can be updated (pending → success/failed)

## New Features

### Real-time Synchronization
Both components now have real-time subscriptions:
- Changes made on one device appear instantly on all devices
- Multiple users can see updates without refreshing

### Better Data Management
- Unique constraints prevent duplicate entries
- Proper indexing for fast queries
- Timestamps for all records
- Status tracking for transfers

### Helper Functions

**Transfer History:**
```typescript
// Save a new transfer
await saveTransferToHistory(address, txHash, amount)

// Update transfer status
await updateTransferStatus(txHash, 'success')
```

## Data Migration (Optional)

If you have existing localStorage data you want to migrate:

### For Address Book:
```javascript
// Run in browser console
const oldData = JSON.parse(localStorage.getItem('addressBook') || '[]')
console.log('Old contacts:', oldData)
// Manually re-add contacts through the UI
```

### For Transfer History:
```javascript
// Run in browser console
const address = 'YOUR_WALLET_ADDRESS'
const oldData = JSON.parse(localStorage.getItem(`ownerTransfers_${address}`) || '[]')
console.log('Old transfers:', oldData)
// Data will be automatically saved to DB for new transfers
```

## Testing

1. **Address Book:**
   - Add a contact
   - Open app in another browser/device
   - Verify contact appears
   - Delete contact
   - Verify it's removed everywhere

2. **Transfer History:**
   - Make an owner transfer
   - Check it appears in history
   - Verify status updates correctly

## Rollback (if needed)

If you need to rollback to localStorage:

```bash
git checkout HEAD~1 components/address-book.tsx
git checkout HEAD~1 components/transfer-history.tsx
git checkout HEAD~1 lib/supabase.ts
```

## Troubleshooting

### "Failed to fetch" errors
- Check Supabase URL and keys in `.env.local`
- Verify tables were created successfully
- Check RLS policies are set to allow all

### Data not syncing
- Verify real-time is enabled in Supabase
- Check browser console for subscription errors
- Ensure you're connected to the internet

### Duplicate entry errors
- This is expected if you try to add the same contact twice
- The UI will show an error message
- Check the unique constraints in the database
