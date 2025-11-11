# Complete Setup Guide

## Step 1: Run Database Setup (5 minutes)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mcsmcsuuyrkgvdjbnfuy
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `FINAL_SETUP.sql`
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Setup complete!" and your admin address in the results

## Step 2: Verify Database Setup

Run this query to verify:

```sql
-- Check that admin was created
SELECT * FROM users WHERE wallet_address = '0x8668b2720b2fe3b1db0cdc11b7dc7cba5685f679';
SELECT * FROM admins WHERE wallet_address = '0x8668b2720b2fe3b1db0cdc11b7dc7cba5685f679';
```

You should see one row in each table.

## Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 4: Test the Complete Flow

### A. Test User Authorization

1. **Connect as a regular user** (not the admin wallet)
2. Go to the app in your browser
3. You should be automatically registered in the `users` table
4. Click on "Authorize Admin" tab
5. You should see the admin address: `0x8668b2720b2fe3b1db0cdc11b7dc7cba5685f679`
6. Click "Authorize Admin" button
7. You should see "Authorization successful!" toast
8. The UI should update to show "Authorized" status

### B. Test Admin Dashboard

1. **Disconnect your wallet**
2. **Connect with the admin wallet**: `0x8668b2720b2fe3b1db0cdc11b7dc7cba5685f679`
3. Go to the "Admin" tab
4. You should see the user you just authorized in the list
5. Click on the user to select them
6. You should see their balance
7. Enter an amount and click "Request Transfer from User"
8. You should see "Transfer request sent!" message

### C. Test Transfer Request (User Side)

1. **Disconnect admin wallet**
2. **Reconnect as the user** who authorized the admin
3. Go to "Requests" tab (if it exists) or check the database:

```sql
SELECT * FROM transfer_requests;
```

You should see the pending transfer request.

## Step 5: Verify in Database

Check that everything was created correctly:

```sql
-- Check users
SELECT id, wallet_address, total_logins FROM users;

-- Check admins
SELECT id, wallet_address, role FROM admins;

-- Check authorizations
SELECT 
  a.id,
  u.wallet_address as user_wallet,
  ad.wallet_address as admin_wallet,
  a.authorized
FROM authorizations a
JOIN users u ON a.user_id = u.id
JOIN admins ad ON a.admin_id = ad.id;

-- Check transfer requests
SELECT 
  tr.id,
  u.wallet_address as from_user,
  a.wallet_address as to_admin,
  tr.amount,
  tr.status
FROM transfer_requests tr
JOIN users u ON tr.from_user_id = u.id
JOIN admins a ON tr.to_admin_id = a.id;
```

## Troubleshooting

### Issue: "Admin not found"

**Solution:** Make sure you ran `FINAL_SETUP.sql` and the admin address matches exactly (lowercase).

### Issue: "User not found"

**Solution:** Connect with your wallet first. The user is auto-created on first connection.

### Issue: Authorization button doesn't work

**Check browser console (F12)** for errors. Common issues:
- User not registered yet (connect wallet first)
- Admin not in database (run FINAL_SETUP.sql)
- Network error (check Supabase connection)

### Issue: Admin dashboard shows no users

**Solution:** 
1. Make sure you authorized as a user first
2. Check the database: `SELECT * FROM authorizations;`
3. Verify the admin wallet address matches

## Architecture Overview

### Database Tables

```
users (auto-created on wallet connect)
  ↓
admins (created by FINAL_SETUP.sql)
  ↓
authorizations (created when user authorizes)
  ↓
transfer_requests (created when admin requests transfer)
```

### Data Flow

1. **User connects** → Auto-registered in `users` table
2. **User authorizes admin** → Record created in `authorizations` table
3. **Admin requests transfer** → Record created in `transfer_requests` table
4. **User approves** → Transaction sent to blockchain
5. **Transaction completes** → Record created in `transfer_history` table

## Important Notes

### Security Model

- ✅ Admin CANNOT directly transfer funds from user's wallet
- ✅ Admin can only REQUEST transfers
- ✅ User must APPROVE each transfer in their wallet
- ✅ User maintains full control of their private keys
- ✅ Authorization can be revoked at any time

### What Admin Authorization Means

When a user "authorizes" an admin, they are:
- ✅ Giving permission for the admin to REQUEST transfers
- ❌ NOT giving the admin access to their private keys
- ❌ NOT allowing automatic transfers without approval

Every transfer requires the user to sign the transaction in their wallet.

## Next Steps

After successful setup:

1. ✅ Test with multiple users
2. ✅ Test authorization/revocation flow
3. ✅ Test transfer request flow
4. ✅ Check audit logs: `SELECT * FROM audit_log;`
5. ✅ Monitor real-time updates

## Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Check Supabase logs in the dashboard
3. Verify all tables exist: `\dt` in SQL Editor
4. Check RLS policies are enabled
5. Verify your admin address is correct (lowercase)

## Files Reference

- `FINAL_SETUP.sql` - Complete database setup
- `SETUP_GUIDE.md` - This file
- `ANALYSIS_AND_FIX_PLAN.md` - Technical details
- `docs/ARCHITECTURE.md` - System architecture
- `docs/production-schema.sql` - Original schema reference
