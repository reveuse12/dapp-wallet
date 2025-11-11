# Authorization System Fix

## Problem
The authorization was not persisting because the code wasn't properly handling the database schema with `users`, `admins`, and `authorizations` tables with foreign key relationships.

## Root Cause
The actual database schema (from FINAL_SETUP.sql) has:
- `users` table with wallet addresses
- `admins` table with wallet addresses (references users)
- `authorizations` table with `user_id` and `admin_id` foreign keys (NOT NULL)

The old code was trying to insert into `authorizations` without the required `user_id` and `admin_id` fields, causing the "null value violates not-null constraint" error.

## Changes Made

### 1. Fixed `lib/services/authorization.service.ts`
- `authorizeAdmin()` - Now properly:
  1. Gets or creates user record from wallet address
  2. Gets admin record from wallet address
  3. Inserts/updates authorization with both IDs
- `revokeAdminAuthorization()` - Looks up user and admin IDs before updating
- `isAdminAuthorized()` - Looks up IDs and checks authorization with expiration
- `getAuthorizedAdmins()` - Properly joins with admins table
- `getAuthorizedUsers()` - Properly joins with users table

### 2. Fixed `lib/admin.ts`
- Restored Supabase queries for `admins` table
- `getAdminAddresses()` queries active admins from database
- `isAdmin()` checks against database records

### 3. Fixed `components/user-authorization.tsx`
- Updated to use corrected service function signatures
- Removed unused `userId` state
- Simplified to work with wallet addresses only

## How It Works Now

1. **User connects wallet** → Component gets wallet address
2. **Fetch admin addresses** → Queries `admins` table from Supabase
3. **Check authorization** → 
   - Looks up user ID from wallet address
   - Looks up admin ID from wallet address
   - Checks `authorizations` table with both IDs
4. **Authorize** → 
   - Creates user record if doesn't exist
   - Gets admin ID
   - Inserts/updates authorization with user_id and admin_id
5. **Revoke** → Updates `authorized` field to `false`

## Database Schema (Actual)

The database was set up using `FINAL_SETUP.sql` which includes:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  ...
);

CREATE TABLE admins (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  wallet_address TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  ...
);

CREATE TABLE authorizations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  admin_id BIGINT NOT NULL REFERENCES admins(id),
  user_address TEXT NOT NULL,
  admin_address TEXT NOT NULL,
  authorized BOOLEAN DEFAULT true,
  ...
  UNIQUE(user_id, admin_id)
);
```

## Admin Setup

The admin was seeded in the database:
```sql
-- Wallet: 0x8668B2720B2Fe3B1Db0CDc11b7dc7cBa5685F679
```

## Testing

1. Make sure `FINAL_SETUP.sql` was run in Supabase
2. Connect your wallet
3. Click "Authorize Admin"
4. Refresh the page or navigate away and back
5. Authorization status should persist ✅

## Verification Query

Check if authorization is stored:
```sql
SELECT 
  a.*,
  u.wallet_address as user_wallet,
  ad.wallet_address as admin_wallet
FROM authorizations a
JOIN users u ON a.user_id = u.id
JOIN admins ad ON a.admin_id = ad.id;
```
