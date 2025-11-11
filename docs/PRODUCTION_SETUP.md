# 🚀 Production-Grade Setup Guide

## Overview

This guide will help you set up the production-grade architecture with proper user management, authorization flow, and audit logging.

## Architecture Changes

### What's New?

1. **User Management System**
   - Automatic user registration when wallet connects
   - Track login history and user activity
   - User statistics and analytics

2. **Proper Data Relationships**
   - Foreign keys between all tables
   - Referential integrity
   - Cascade deletes where appropriate

3. **Admin Management**
   - Separate admins table with roles and permissions
   - Multiple admin support
   - Admin activity tracking

4. **Audit Logging**
   - Track all important actions
   - User activity history
   - Compliance and debugging

5. **Enhanced Authorization**
   - Expiration dates for authorizations
   - Amount limits
   - Notes and metadata

6. **Better Transfer Management**
   - Link transfers to authorizations
   - Track request lifecycle
   - Rejection reasons

## Step-by-Step Setup

### Step 1: Backup Current Data (Important!)

Before running the migration, backup your existing data:

```sql
-- In Supabase SQL Editor
-- Export existing data
SELECT * FROM authorizations;
SELECT * FROM transfer_requests;
```

### Step 2: Run Production Schema

1. Go to Supabase Dashboard → SQL Editor
2. Open `docs/production-schema.sql`
3. **IMPORTANT**: Update the admin wallet address in the seed data section:

```sql
-- Find this line and replace with YOUR admin address:
'0x742d35Cc6634C0532925a3b8D91D0a74b4A3Bb31'
```

4. Run the entire SQL script
5. Verify all tables were created successfully

### Step 3: Verify Database Structure

Check that these tables exist:
- ✅ `users`
- ✅ `admins`
- ✅ `authorizations`
- ✅ `transfer_requests`
- ✅ `transfer_history`
- ✅ `address_book`
- ✅ `audit_log`

### Step 4: Test the Setup

1. Restart your development server:
```bash
npm run dev
```

2. Connect your wallet
3. Check browser console - you should see:
```
User authenticated: {
  id: 1,
  wallet: "0x...",
  isAdmin: false,
  totalLogins: 1
}
```

4. Check Supabase → Table Editor → `users` table
   - Your wallet should be registered
   - `total_logins` should be 1

5. Disconnect and reconnect wallet
   - `total_logins` should increment to 2
   - `last_seen_at` should update

### Step 5: Verify Admin Setup

1. Connect with admin wallet
2. Console should show `isAdmin: true`
3. Check `admins` table - your wallet should be there
4. Admin dashboard should be accessible

## New Features

### 1. Automatic User Registration

When a user connects their wallet:
- User is automatically registered in `users` table
- Login count increments
- Last seen timestamp updates
- Audit log entry created

### 2. User Context Hook

Use anywhere in your app:

```typescript
import { useUser } from '@/components/user-provider'

function MyComponent() {
  const { user, isAdmin, isLoading } = useUser()
  
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Connect wallet</div>
  
  return (
    <div>
      <p>User ID: {user.id}</p>
      <p>Wallet: {user.wallet_address}</p>
      <p>Total Logins: {user.total_logins}</p>
      <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### 3. Service Layer

All database operations now go through service functions:

**User Service** (`lib/services/user.service.ts`):
- `registerUserLogin()` - Register/update user
- `getUserByWallet()` - Get user data
- `isUserAdmin()` - Check admin status
- `logAuditEvent()` - Log actions

**Authorization Service** (`lib/services/authorization.service.ts`):
- `authorizeAdmin()` - Authorize admin with options
- `revokeAdminAuthorization()` - Revoke access
- `isAdminAuthorized()` - Check authorization
- `getAuthorizedAdmins()` - Get user's admins
- `getAuthorizedUsers()` - Get admin's users

**Transfer Service** (`lib/services/transfer.service.ts`):
- `createTransferRequest()` - Admin creates request
- `approveTransferRequest()` - User approves
- `rejectTransferRequest()` - User rejects
- `completeTransferRequest()` - Mark as completed
- `saveTransferToHistory()` - Save to history

### 4. Audit Logging

All important actions are logged:
- User login/registration
- Admin authorization/revocation
- Transfer requests created/approved/rejected
- Transfer completions

View audit logs:
```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50;
```

### 5. Database Views

Two helpful views are created:

**active_authorizations**:
```sql
SELECT * FROM active_authorizations;
-- Shows all active authorizations with user and admin details
```

**transfer_request_summary**:
```sql
SELECT * FROM transfer_request_summary;
-- Shows transfer requests with wallet addresses
```

## Migration Path for Existing Components

### Components to Update:

1. **user-authorization.tsx** - Use new authorization service
2. **admin-dashboard.tsx** - Use new user/admin services
3. **transfer-requests.tsx** - Use new transfer service
4. **transfer-history.tsx** - Already updated
5. **address-book.tsx** - Already updated

### Example: Update user-authorization.tsx

```typescript
import { useUser } from '@/components/user-provider'
import { authorizeAdmin, revokeAdminAuthorization } from '@/lib/services/authorization.service'

function UserAuthorization() {
  const { user, isLoading } = useUser()
  
  const handleAuthorize = async () => {
    if (!user) return
    
    const result = await authorizeAdmin(
      user.id,
      user.wallet_address,
      ADMIN_ADDRESS,
      {
        expirationDate: undefined, // No expiration
        amountLimit: undefined, // No limit
        notes: 'Authorized via UI'
      }
    )
    
    if (result.success) {
      showToast('Admin authorized!', 'success')
    } else {
      showToast(result.error || 'Failed', 'error')
    }
  }
  
  // ... rest of component
}
```

## Database Relationships

```
users (1) ←→ (many) authorizations
users (1) ←→ (many) transfer_requests
users (1) ←→ (many) transfer_history
users (1) ←→ (many) address_book
users (1) ←→ (many) audit_log

admins (1) ←→ (many) authorizations
admins (1) ←→ (many) transfer_requests

authorizations (1) ←→ (many) transfer_requests
transfer_requests (1) ←→ (1) transfer_history
```

## Security Considerations

### Row Level Security (RLS)

Currently set to "Allow all" for development. For production:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users see own data" ON users
  FOR SELECT USING (wallet_address = current_setting('app.user_wallet'));

-- Example: Users can only modify their own address book
CREATE POLICY "Users manage own contacts" ON address_book
  FOR ALL USING (user_address = current_setting('app.user_wallet'));
```

### API Security

Consider adding:
- Rate limiting
- IP whitelisting for admin actions
- Two-factor authentication for admins
- Webhook signatures for external integrations

## Monitoring & Analytics

### User Analytics

```sql
-- Total users
SELECT COUNT(*) FROM users WHERE is_active = true;

-- New users today
SELECT COUNT(*) FROM users 
WHERE DATE(first_seen_at) = CURRENT_DATE;

-- Active users (logged in last 7 days)
SELECT COUNT(*) FROM users 
WHERE last_seen_at > NOW() - INTERVAL '7 days';

-- Top users by login count
SELECT wallet_address, total_logins 
FROM users 
ORDER BY total_logins DESC 
LIMIT 10;
```

### Transfer Analytics

```sql
-- Total transfer requests
SELECT status, COUNT(*) 
FROM transfer_requests 
GROUP BY status;

-- Transfer volume by day
SELECT DATE(requested_at) as date, 
       COUNT(*) as requests,
       SUM(CAST(amount AS DECIMAL)) as total_amount
FROM transfer_requests
WHERE status = 'completed'
GROUP BY DATE(requested_at)
ORDER BY date DESC;
```

### Audit Trail

```sql
-- Recent actions
SELECT u.wallet_address, a.action, a.created_at
FROM audit_log a
LEFT JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 50;

-- Actions by type
SELECT action, COUNT(*) 
FROM audit_log 
GROUP BY action 
ORDER BY COUNT(*) DESC;
```

## Troubleshooting

### Issue: User not registered on wallet connect

**Solution**: Check browser console for errors. Verify:
- Supabase URL and keys in `.env.local`
- `users` table exists
- RLS policies allow inserts

### Issue: Admin status not detected

**Solution**: Verify:
- Admin wallet address in `admins` table
- Address is lowercase in database
- `is_active = true` in admins table

### Issue: Audit log not working

**Solution**: 
- Check `audit_log` table exists
- Verify RLS policies
- Check browser console for errors

## Next Steps

1. ✅ Run production schema
2. ✅ Test user registration
3. ✅ Verify admin access
4. ⏳ Update remaining components to use services
5. ⏳ Add proper RLS policies
6. ⏳ Set up monitoring dashboard
7. ⏳ Deploy to production

## Support

For issues or questions:
1. Check browser console for errors
2. Check Supabase logs
3. Review audit_log table
4. Check this documentation

---

**You now have a production-grade architecture! 🎉**
