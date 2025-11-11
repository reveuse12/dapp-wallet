# ✅ Production Upgrade Checklist

## Phase 1: Database Setup

- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Open `docs/production-schema.sql`
- [ ] **IMPORTANT**: Update admin wallet address (line ~180)
  ```sql
  '0x742d35Cc6634C0532925a3b8D91D0a74b4A3Bb31' -- Replace with YOUR address
  ```
- [ ] Run the entire SQL script
- [ ] Verify tables created:
  - [ ] users
  - [ ] admins
  - [ ] authorizations
  - [ ] transfer_requests
  - [ ] transfer_history
  - [ ] address_book
  - [ ] audit_log
- [ ] Check that your admin wallet is in `admins` table

## Phase 2: Test User Registration

- [ ] Dev server is running (`npm run dev`)
- [ ] Open browser to http://localhost:3000
- [ ] Open browser console (F12)
- [ ] Connect your wallet
- [ ] Should see in console:
  ```
  User authenticated: {
    id: 1,
    wallet: "0x...",
    isAdmin: false/true,
    totalLogins: 1
  }
  ```
- [ ] Check Supabase → users table
  - [ ] Your wallet address is there
  - [ ] total_logins = 1
  - [ ] last_seen_at is recent
- [ ] Disconnect wallet
- [ ] Reconnect wallet
- [ ] Check total_logins incremented to 2

## Phase 3: Test Admin Access

- [ ] Connect with admin wallet
- [ ] Console shows `isAdmin: true`
- [ ] Check Supabase → admins table
  - [ ] Your wallet is there
  - [ ] is_active = true
- [ ] Navigate to "Admin" tab
- [ ] Should see admin dashboard (not "Access Denied")

## Phase 4: Test Authorization Flow

- [ ] Connect with regular (non-admin) wallet
- [ ] Go to "Authorize" tab
- [ ] Click "Authorize Admin"
- [ ] Check Supabase → authorizations table
  - [ ] New record created
  - [ ] user_id matches your user
  - [ ] admin_id matches admin
  - [ ] authorized = true
- [ ] Check Supabase → audit_log table
  - [ ] Action "authorize_admin" logged

## Phase 5: Test Transfer Request

- [ ] Connect with admin wallet
- [ ] Go to "Admin" tab
- [ ] Should see authorized user in list
- [ ] Select user
- [ ] Enter amount
- [ ] Click "Request Transfer from User"
- [ ] Check Supabase → transfer_requests table
  - [ ] New request created
  - [ ] status = 'pending'
- [ ] Check audit_log
  - [ ] Action "create_transfer_request" logged

## Phase 6: Test Transfer Approval

- [ ] Connect with user wallet (the one who authorized)
- [ ] Go to "Requests" tab
- [ ] Should see pending request
- [ ] Click "Approve"
- [ ] Wallet popup should appear
- [ ] Sign transaction
- [ ] Check Supabase → transfer_requests table
  - [ ] status changed to 'completed'
  - [ ] tx_hash populated
- [ ] Check transfer_history table
  - [ ] New entry created
  - [ ] Linked to transfer_request

## Phase 7: Test Address Book

- [ ] Connect wallet
- [ ] Go to "Dashboard" → scroll to Contacts
- [ ] Click "+" to add contact
- [ ] Enter name and address
- [ ] Click "Save Contact"
- [ ] Check Supabase → address_book table
  - [ ] New contact saved
  - [ ] user_id matches your user
- [ ] Open app in another browser/device
- [ ] Connect same wallet
- [ ] Contact should appear (real-time sync)

## Phase 8: Verify Audit Trail

- [ ] Check Supabase → audit_log table
- [ ] Should see entries for:
  - [ ] User login/registration
  - [ ] Admin authorization
  - [ ] Transfer request creation
  - [ ] Transfer approval
  - [ ] Contact creation
- [ ] Each entry should have:
  - [ ] user_id
  - [ ] action
  - [ ] timestamp
  - [ ] old_values / new_values

## Phase 9: Test Real-time Updates

- [ ] Open app in two browser windows
- [ ] Connect same wallet in both
- [ ] In window 1: Add a contact
- [ ] In window 2: Contact should appear automatically
- [ ] In window 1: Authorize admin
- [ ] In window 2: Authorization status should update
- [ ] Test with transfer requests too

## Phase 10: Check Analytics

Run these queries in Supabase SQL Editor:

- [ ] Total users:
  ```sql
  SELECT COUNT(*) FROM users;
  ```
- [ ] Active users (last 7 days):
  ```sql
  SELECT COUNT(*) FROM users 
  WHERE last_seen_at > NOW() - INTERVAL '7 days';
  ```
- [ ] Transfer requests by status:
  ```sql
  SELECT status, COUNT(*) 
  FROM transfer_requests 
  GROUP BY status;
  ```
- [ ] Recent audit events:
  ```sql
  SELECT * FROM audit_log 
  ORDER BY created_at DESC 
  LIMIT 20;
  ```

## Phase 11: Code Quality

- [ ] No TypeScript errors
  ```bash
  npm run build
  ```
- [ ] No ESLint errors
  ```bash
  npm run lint
  ```
- [ ] All services compile correctly
- [ ] All hooks work properly

## Phase 12: Documentation Review

- [ ] Read `PRODUCTION_SETUP.md`
- [ ] Read `docs/ARCHITECTURE.md`
- [ ] Read `UPGRADE_SUMMARY.md`
- [ ] Understand the service layer
- [ ] Know how to use `useUser()` hook

## Phase 13: Update Components (Optional)

Update these components to use new services:

- [ ] `components/user-authorization.tsx`
  - [ ] Use `useUser()` hook
  - [ ] Use `authorizeAdmin()` service
  - [ ] Use `revokeAdminAuthorization()` service

- [ ] `components/admin-dashboard.tsx`
  - [ ] Use `useUser()` hook
  - [ ] Use `getAuthorizedUsers()` service
  - [ ] Use `createTransferRequest()` service

- [ ] `components/transfer-requests.tsx`
  - [ ] Use `useUser()` hook
  - [ ] Use `approveTransferRequest()` service
  - [ ] Use `rejectTransferRequest()` service
  - [ ] Use `completeTransferRequest()` service

## Phase 14: Security Hardening (Production)

- [ ] Update RLS policies (currently "Allow all")
- [ ] Add rate limiting
- [ ] Add IP whitelisting for admin actions
- [ ] Review and restrict permissions
- [ ] Enable 2FA for admins (if applicable)
- [ ] Set up monitoring alerts

## Phase 15: Deployment Prep

- [ ] Environment variables set in production
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] NEXT_PUBLIC_ADMIN_ADDRESS
- [ ] Database backups configured
- [ ] Monitoring dashboard set up
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring enabled

## Common Issues & Solutions

### Issue: User not registered
**Check:**
- [ ] Supabase URL and keys in `.env.local`
- [ ] `users` table exists
- [ ] RLS policies allow inserts
- [ ] Browser console for errors

### Issue: Admin not detected
**Check:**
- [ ] Admin wallet in `admins` table
- [ ] Address is lowercase
- [ ] `is_active = true`
- [ ] Wallet address matches exactly

### Issue: Real-time not working
**Check:**
- [ ] Real-time enabled in Supabase
- [ ] Tables added to publication
- [ ] Browser console for subscription errors
- [ ] Internet connection stable

### Issue: Audit log empty
**Check:**
- [ ] `audit_log` table exists
- [ ] RLS policies allow inserts
- [ ] Service functions being called
- [ ] No errors in console

## Success Criteria

✅ All checkboxes above are checked
✅ Users automatically registered on wallet connect
✅ Admin access working correctly
✅ Authorization flow complete
✅ Transfer requests working
✅ Real-time updates functioning
✅ Audit trail capturing all actions
✅ No console errors
✅ Database properly structured
✅ Documentation understood

## You're Done! 🎉

Your DApp is now production-grade with:
- Automatic user management
- Complete audit trail
- Real-time synchronization
- Clean architecture
- Scalable foundation

**Ready to deploy!**
