# 🚀 Quick Start - 5 Minutes to Production

## TL;DR

1. Run SQL in Supabase
2. Update admin address
3. Restart dev server
4. Connect wallet
5. Done!

## Step 1: Run SQL (2 minutes)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy ALL content from `docs/production-schema.sql`
5. **IMPORTANT**: Find this line (around line 180):
   ```sql
   '0x742d35Cc6634C0532925a3b8D91D0a74b4A3Bb31'
   ```
   Replace with YOUR admin wallet address (appears twice)
6. Click **Run** or press `Ctrl+Enter`
7. Wait for "Success" message

## Step 2: Verify Tables (30 seconds)

Click **Table Editor** (left sidebar), you should see:
- ✅ users
- ✅ admins
- ✅ authorizations
- ✅ transfer_requests
- ✅ transfer_history
- ✅ address_book
- ✅ audit_log

## Step 3: Restart Dev Server (30 seconds)

```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

## Step 4: Test (2 minutes)

1. Open http://localhost:3000
2. Open browser console (F12)
3. Connect your wallet
4. You should see:
   ```
   User authenticated: {
     id: 1,
     wallet: "0x...",
     isAdmin: true/false,
     totalLogins: 1
   }
   ```

## Step 5: Verify in Database (30 seconds)

Go to Supabase → Table Editor → `users`

You should see your wallet address with:
- `total_logins: 1`
- `last_seen_at: [just now]`
- `is_active: true`

## ✅ Done!

Your app now has:
- ✅ Automatic user registration
- ✅ Login tracking
- ✅ Admin management
- ✅ Audit logging
- ✅ Real-time sync

## What Just Happened?

### Before
- Users not tracked
- Data in localStorage only
- No audit trail

### After
- Users auto-registered when wallet connects
- All data in Supabase (syncs everywhere)
- Complete audit trail
- Production-ready architecture

## Next Steps

### Test Authorization Flow
1. Connect non-admin wallet
2. Go to "Authorize" tab
3. Click "Authorize Admin"
4. Check `authorizations` table in Supabase

### Test Transfer Request
1. Connect admin wallet
2. Go to "Admin" tab
3. Select authorized user
4. Request transfer
5. Check `transfer_requests` table

### Test Real-time Sync
1. Open app in 2 browsers
2. Connect same wallet in both
3. Add contact in browser 1
4. See it appear in browser 2 instantly

## Troubleshooting

### "Failed to fetch" error
- Check `.env.local` has correct Supabase URL and key
- Restart dev server after changing env

### User not registered
- Check browser console for errors
- Verify `users` table exists in Supabase
- Check RLS policies allow inserts

### Admin not detected
- Verify your wallet address in `admins` table
- Make sure address is lowercase
- Check `is_active = true`

## Learn More

- **Full Setup**: Read `PRODUCTION_SETUP.md`
- **Architecture**: Read `docs/ARCHITECTURE.md`
- **Checklist**: Follow `CHECKLIST.md`
- **Summary**: Read `UPGRADE_SUMMARY.md`

## Key Files

### Database
- `docs/production-schema.sql` - Complete database schema

### Services
- `lib/services/user.service.ts` - User operations
- `lib/services/authorization.service.ts` - Authorization logic
- `lib/services/transfer.service.ts` - Transfer operations

### React
- `lib/hooks/useUserAuth.ts` - User authentication hook
- `components/user-provider.tsx` - User context

### Use Anywhere
```typescript
import { useUser } from '@/components/user-provider'

function MyComponent() {
  const { user, isAdmin, isLoading } = useUser()
  
  if (!user) return <div>Connect wallet</div>
  
  return <div>Welcome {user.wallet_address}!</div>
}
```

## Database Queries

### See all users
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### See audit trail
```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50;
```

### See transfer requests
```sql
SELECT * FROM transfer_requests ORDER BY requested_at DESC;
```

## That's It!

You now have a production-grade DApp with proper user management, audit logging, and real-time synchronization.

**Total time: ~5 minutes** ⚡

---

Need help? Check the other documentation files or review the browser console for errors.
